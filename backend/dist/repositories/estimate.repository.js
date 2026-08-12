"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimateRepository = void 0;
const database_1 = require("../config/database");
class EstimateRepository {
    static async createWithSelections(data, tx) {
        const client = tx || database_1.prisma;
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
    static async findById(id) {
        return database_1.prisma.estimate.findUnique({
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
    static async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [total, items] = await Promise.all([
            database_1.prisma.estimate.count(),
            database_1.prisma.estimate.findMany({
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
    static async updateEnquiryId(estimateId, enquiryId, tx) {
        const client = tx || database_1.prisma;
        return client.estimate.update({
            where: { id: estimateId },
            data: { enquiryId }
        });
    }
    static async updateStatus(id, status) {
        return database_1.prisma.estimate.update({
            where: { id },
            data: { status }
        });
    }
    static async delete(id) {
        return database_1.prisma.estimate.delete({
            where: { id }
        });
    }
}
exports.EstimateRepository = EstimateRepository;
