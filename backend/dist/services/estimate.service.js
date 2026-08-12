"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimateService = void 0;
const estimate_repository_1 = require("../repositories/estimate.repository");
const enquiry_repository_1 = require("../repositories/enquiry.repository");
const service_repository_1 = require("../repositories/service.repository");
const multiplier_repository_1 = require("../repositories/multiplier.repository");
const settings_repository_1 = require("../repositories/settings.repository");
const pricing_engine_1 = require("../pricing/pricing.engine");
const error_middleware_1 = require("../middleware/error.middleware");
const database_1 = require("../config/database");
const library_1 = require("@prisma/client/runtime/library");
class EstimateService {
    static async createEstimate(input) {
        // 1. Fetch settings, multipliers, and services from DB
        const settings = await settings_repository_1.SettingsRepository.findDefaultSettings();
        if (!settings) {
            throw new error_middleware_1.ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings not configured");
        }
        const multipliers = await multiplier_repository_1.MultiplierRepository.findAll();
        const serviceIds = input.services.map((s) => s.serviceId);
        const servicesData = [];
        for (const serviceId of serviceIds) {
            const sData = await service_repository_1.ServiceRepository.findActiveServiceById(serviceId);
            if (!sData) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", `Active service ${serviceId} not found`);
            }
            servicesData.push(sData);
        }
        // 2. Authoritative pricing calculation
        const calcResult = pricing_engine_1.PricingEngine.calculate(input, servicesData, multipliers, settings);
        // Generate IDs
        const estimateId = `EST-${Math.floor(100000 + Math.random() * 900000)}`;
        const enquiryId = input.customer ? `ENQ-${Math.floor(100000 + Math.random() * 900000)}` : null;
        // Estimate range string
        const rangeStr = `${settings.currency}${calcResult.estimatedMin.toLocaleString()} - ${settings.currency}${calcResult.estimatedMax.toLocaleString()}`;
        // 3. Prepare data structure for the transaction
        const selectedServicesData = input.services.map((sInput) => {
            const serviceObj = servicesData.find((s) => s.id === sInput.serviceId);
            const srvCalc = calcResult.services.find((s) => s.serviceId === sInput.serviceId);
            // Check if package was selected
            let selectedPackage = null;
            const pkgId = sInput.packageId || sInput.answers?.["selected-package"];
            if (pkgId) {
                const pkgObj = serviceObj.packages.find((p) => p.id === pkgId);
                if (!pkgObj) {
                    throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Package ${pkgId} not found in service ${serviceObj.id}`);
                }
                selectedPackage = {
                    packageId: pkgObj.id,
                    name: pkgObj.name,
                    price: new library_1.Decimal(pkgObj.price),
                    timeline: pkgObj.timeline,
                };
            }
            // Check if addons selected
            const selectedAddons = (sInput.addons || []).map((addonInput) => {
                const comp = serviceObj.components.find((c) => c.id === addonInput.pricingComponentId);
                if (!comp) {
                    throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Add-on component ${addonInput.pricingComponentId} not found in service ${serviceObj.id}`);
                }
                return {
                    pricingComponentId: comp.id,
                    name: comp.name,
                    pricingType: comp.pricingType,
                    price: new library_1.Decimal(comp.price),
                    quantity: addonInput.units,
                    billingCycle: comp.billingCycle,
                };
            });
            return {
                serviceId: serviceObj.id,
                serviceName: serviceObj.name,
                baseCost: new library_1.Decimal(srvCalc.baseCost),
                addonsCost: new library_1.Decimal(srvCalc.addonsCost),
                multiplierProduct: new library_1.Decimal(srvCalc.multiplierProduct),
                totalCost: new library_1.Decimal(srvCalc.totalCost),
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
        const result = await database_1.prisma.$transaction(async (tx) => {
            let createdEnquiry = null;
            if (input.customer && enquiryId) {
                createdEnquiry = await enquiry_repository_1.EnquiryRepository.create({
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
            const createdEstimate = await estimate_repository_1.EstimateRepository.createWithSelections({
                id: estimateId,
                customerName,
                customerEmail,
                customerPhone,
                customerCompany,
                notes,
                subtotal: new library_1.Decimal(calcResult.oneTimeSubtotal),
                totalPrice: new library_1.Decimal(calcResult.oneTimeFinalCost),
                taxRateSnapshot: new library_1.Decimal(settings.taxRate),
                taxAmount: new library_1.Decimal(calcResult.oneTimeTax),
                discountRateSnapshot: new library_1.Decimal(settings.discountRate),
                discountAmount: new library_1.Decimal(calcResult.oneTimeDiscount),
                currency: settings.currency,
                status: "PENDING",
                breakdown: calcResult,
                answers: input.services.reduce((acc, s) => {
                    acc[s.serviceId] = s.answers || {};
                    return acc;
                }, {}),
                estimateRange: rangeStr,
                enquiryId: createdEnquiry?.id || null,
                selectedServices: selectedServicesData,
            }, tx);
            return { estimate: createdEstimate, enquiry: createdEnquiry };
        });
        return result;
    }
    static async getEstimateById(id) {
        const est = await estimate_repository_1.EstimateRepository.findById(id);
        if (!est) {
            throw new error_middleware_1.ApiError(404, "NOT_FOUND", `Estimate ${id} not found`);
        }
        return est;
    }
    static async getEstimatesList(page, limit) {
        return estimate_repository_1.EstimateRepository.findAll(page, limit);
    }
}
exports.EstimateService = EstimateService;
