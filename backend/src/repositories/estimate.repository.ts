import { prisma } from "../config/database";
import { Prisma, EstimateStatus, PricingType, BillingCycle } from "@prisma/client";

export class EstimateRepository {
  static async createWithSelections(data: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    customerCompany?: string | null;
    notes?: string | null;
    subtotal: Prisma.Decimal | number;
    totalPrice: Prisma.Decimal | number;
    taxRateSnapshot: Prisma.Decimal | number;
    taxAmount: Prisma.Decimal | number;
    discountRateSnapshot: Prisma.Decimal | number;
    discountAmount: Prisma.Decimal | number;
    currency: string;
    validUntil?: Date | null;
    status: EstimateStatus;
    breakdown: Prisma.InputJsonValue;
    answers: Prisma.InputJsonValue;
    estimateRange?: string | null;
    enquiryId?: string | null;
    selectedServices: {
      serviceId: string;
      serviceName: string;
      baseCost: Prisma.Decimal | number;
      addonsCost: Prisma.Decimal | number;
      multiplierProduct: Prisma.Decimal | number;
      totalCost: Prisma.Decimal | number;
      estimatedTimeline: string;
      selectedPackage?: {
        packageId: string;
        name: string;
        price: Prisma.Decimal | number;
        timeline: string;
      } | null;
      selectedAddons: {
        pricingComponentId: string;
        name: string;
        pricingType: PricingType;
        price: Prisma.Decimal | number;
        quantity: number;
        billingCycle: BillingCycle;
      }[];
    }[];
  }, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.estimate.create({
      data: {
        id: data.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerCompany: data.customerCompany,
        notes: data.notes,
        subtotal: data.subtotal,
        totalPrice: data.totalPrice,
        taxRateSnapshot: data.taxRateSnapshot,
        taxAmount: data.taxAmount,
        discountRateSnapshot: data.discountRateSnapshot,
        discountAmount: data.discountAmount,
        currency: data.currency,
        validUntil: data.validUntil,
        status: data.status,
        breakdown: data.breakdown,
        answers: data.answers,
        estimateRange: data.estimateRange,
        enquiryId: data.enquiryId,
        selectedServices: {
          create: data.selectedServices.map(s => ({
            serviceId: s.serviceId,
            serviceName: s.serviceName,
            baseCost: s.baseCost,
            addonsCost: s.addonsCost,
            multiplierProduct: s.multiplierProduct,
            totalCost: s.totalCost,
            estimatedTimeline: s.estimatedTimeline,
            selectedPackage: s.selectedPackage ? {
              create: {
                packageId: s.selectedPackage.packageId,
                name: s.selectedPackage.name,
                price: s.selectedPackage.price,
                timeline: s.selectedPackage.timeline
              }
            } : undefined,
            selectedAddons: {
              create: s.selectedAddons.map(a => ({
                pricingComponentId: a.pricingComponentId,
                name: a.name,
                pricingType: a.pricingType,
                price: a.price,
                quantity: a.quantity,
                billingCycle: a.billingCycle
              }))
            }
          }))
        }
      },
      include: {
        selectedServices: {
          include: {
            selectedPackage: true,
            selectedAddons: true
          }
        }
      }
    });
  }

  static async findById(id: string) {
    return prisma.estimate.findUnique({
      where: { id },
      include: {
        selectedServices: {
          include: {
            selectedPackage: true,
            selectedAddons: true
          }
        },
        enquiry: true
      }
    });
  }

  static async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      prisma.estimate.count(),
      prisma.estimate.findMany({
        skip,
        take: limit,
        orderBy: { createdDate: "desc" },
        include: {
          selectedServices: {
            include: {
              selectedPackage: true,
              selectedAddons: true
            }
          },
          enquiry: true
        }
      })
    ]);
    return { total, items, page, limit };
  }

  static async updateEnquiryId(estimateId: string, enquiryId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.estimate.update({
      where: { id: estimateId },
      data: { enquiryId }
    });
  }

  static async updateStatus(id: string, status: string) {
    const dbStatus = status.toUpperCase() as EstimateStatus;
    return prisma.estimate.update({
      where: { id },
      data: { status: dbStatus }
    });
  }

  static async delete(id: string) {
    return prisma.estimate.delete({
      where: { id }
    });
  }
}
