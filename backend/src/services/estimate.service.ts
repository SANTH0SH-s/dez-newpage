import { EstimateRepository } from "../repositories/estimate.repository";
import { EnquiryRepository } from "../repositories/enquiry.repository";
import { ServiceRepository } from "../repositories/service.repository";
import { MultiplierRepository } from "../repositories/multiplier.repository";
import { SettingsRepository } from "../repositories/settings.repository";
import { EstimateCreateInput } from "../schemas/estimate.schemas";
import { PricingEngine, FullService } from "../pricing/pricing.engine";
import { ApiError } from "../middleware/error.middleware";
import { prisma } from "../config/database";
import { Decimal } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";


export class EstimateService {
  static async createEstimate(input: EstimateCreateInput) {
    // 1. Fetch settings, multipliers, and services from DB
    const settings = await SettingsRepository.findDefaultSettings();
    if (!settings) {
      throw new ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings not configured");
    }

    const multipliers = await MultiplierRepository.findAll();

    const serviceIds = input.services.map((s) => s.serviceId);
    const servicesData: FullService[] = [];

    for (const serviceId of serviceIds) {
      const sData = await ServiceRepository.findActiveServiceById(serviceId);
      if (!sData) {
        throw new ApiError(404, "NOT_FOUND", `Active service ${serviceId} not found`);
      }
      servicesData.push(sData as unknown as FullService);
    }

    // 2. Authoritative pricing calculation
    const calcResult = PricingEngine.calculate(input, servicesData, multipliers, settings);

    // Generate IDs
    const estimateId = `EST-${Math.floor(100000 + Math.random() * 900000)}`;
    const enquiryId = input.customer ? `ENQ-${Math.floor(100000 + Math.random() * 900000)}` : null;

    // Estimate range string
    const rangeStr = `${settings.currency}${calcResult.estimatedMin.toLocaleString()} - ${settings.currency}${calcResult.estimatedMax.toLocaleString()}`;

    // 3. Prepare data structure for the transaction
    const selectedServicesData = input.services.map((sInput) => {
      const serviceObj = servicesData.find((s) => s.id === sInput.serviceId)!;
      const srvCalc = calcResult.services.find((s) => s.serviceId === sInput.serviceId)!;

      // Check if package was selected
      let selectedPackage = null;
      const pkgId = sInput.packageId || sInput.answers?.["selected-package"];
      if (pkgId) {
        const pkgObj = serviceObj.packages.find((p) => p.id === pkgId);
        if (!pkgObj) {
          throw new ApiError(400, "BAD_REQUEST", `Package ${pkgId} not found in service ${serviceObj.id}`);
        }
        selectedPackage = {
          packageId: pkgObj.id,
          name: pkgObj.name,
          price: new Decimal(pkgObj.price),
          timeline: pkgObj.timeline,
        };
      }

      // Check if addons selected
      const selectedAddons = (sInput.addons || []).map((addonInput) => {
        const comp = serviceObj.components.find((c) => c.id === addonInput.pricingComponentId);
        if (!comp) {
          throw new ApiError(400, "BAD_REQUEST", `Add-on component ${addonInput.pricingComponentId} not found in service ${serviceObj.id}`);
        }
        return {
          pricingComponentId: comp.id,
          name: comp.name,
          pricingType: comp.pricingType,
          price: new Decimal(comp.price),
          quantity: addonInput.units,
          billingCycle: comp.billingCycle,
        };
      });

      return {
        serviceId: serviceObj.id,
        serviceName: serviceObj.name,
        baseCost: new Decimal(srvCalc.baseCost),
        addonsCost: new Decimal(srvCalc.addonsCost),
        multiplierProduct: new Decimal(srvCalc.multiplierProduct),
        totalCost: new Decimal(srvCalc.totalCost),
        estimatedTimeline: srvCalc.estimatedTimeline,
        selectedPackage,
        selectedAddons,
      };
    });

    // Determine customer info
    const customerName = input.customer?.name || "Anonymous Customer";
    const customerEmail = input.customer?.email || "anonymous@example.com";
    const customerPhone = input.customer?.phone || null;
    const customerCompany = input.customer?.company || null;
    const notes = input.customer?.notes || null;

    // Use transaction
    const result = await prisma.$transaction(async (tx) => {
      let createdEnquiry = null;
      if (input.customer && enquiryId) {
        createdEnquiry = await EnquiryRepository.create({
          id: enquiryId,
          name: customerName,
          email: customerEmail,
          phone: customerPhone || "N/A",
          company: customerCompany,
          estimateRange: rangeStr,
          message: notes || "Generated via cost estimator proposal flow",
          selectedServices: selectedServicesData.map(s => s.serviceId),
        }, tx);
      }

      const createdEstimate = await EstimateRepository.createWithSelections({
        id: estimateId,
        customerName,
        customerEmail,
        customerPhone,
        customerCompany,
        notes,
        subtotal: new Decimal(calcResult.oneTimeSubtotal),
        totalPrice: new Decimal(calcResult.oneTimeFinalCost),
        taxRateSnapshot: new Decimal(settings.taxRate),
        taxAmount: new Decimal(calcResult.oneTimeTax),
        discountRateSnapshot: new Decimal(settings.discountRate),
        discountAmount: new Decimal(calcResult.oneTimeDiscount),
        currency: settings.currency,
        status: "PENDING",
        breakdown: calcResult as unknown as Prisma.InputJsonValue,
        answers: input.services.reduce((acc, s) => {
          acc[s.serviceId] = s.answers || {};
          return acc;
        }, {} as Record<string, Prisma.InputJsonValue>) as Prisma.InputJsonValue,
        estimateRange: rangeStr,
        enquiryId: createdEnquiry?.id || null,
        selectedServices: selectedServicesData,
      }, tx);

      return { estimate: createdEstimate, enquiry: createdEnquiry };
    });

    return result;
  }

  static async getEstimateById(id: string) {
    const est = await EstimateRepository.findById(id);
    if (!est) {
      throw new ApiError(404, "NOT_FOUND", `Estimate ${id} not found`);
    }
    return est;
  }

  static async getEstimatesList(page: number, limit: number) {
    return EstimateRepository.findAll(page, limit);
  }
}
