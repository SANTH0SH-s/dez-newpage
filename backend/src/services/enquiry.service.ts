import { EnquiryRepository } from "../repositories/enquiry.repository";
import { EnquiryCreateInput } from "../schemas/estimate.schemas";
import { ApiError } from "../middleware/error.middleware";
import { prisma } from "../config/database";

export class EnquiryService {
  static async createEnquiry(input: EnquiryCreateInput) {
    const rangeStr = input.estimateRange || "₹0 - ₹0";

    const result = await prisma.$transaction(async (tx) => {
      // If estimateId is provided, verify it exists
      if (input.estimateId) {
        const est = await tx.estimate.findUnique({
          where: { id: input.estimateId }
        });
        if (!est) {
          throw new ApiError(404, "NOT_FOUND", `Estimate ${input.estimateId} not found`);
        }
      }

      const enquiryId = `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;
      const enquiry = await EnquiryRepository.create({
        id: enquiryId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        estimateRange: rangeStr,
        message: input.message,
        selectedServices: input.selectedServices,
      }, tx);

      // If estimateId is provided, link it
      if (input.estimateId) {
        await tx.estimate.update({
          where: { id: input.estimateId },
          data: { enquiryId: enquiry.id }
        });
      }

      return enquiry;
    });

    return result;
  }

  static async getEnquiryById(id: string) {
    const enq = await EnquiryRepository.findById(id);
    if (!enq) {
      throw new ApiError(404, "NOT_FOUND", `Enquiry ${id} not found`);
    }
    return enq;
  }

  static async getEnquiriesList(page: number, limit: number) {
    return EnquiryRepository.findAll(page, limit);
  }
}
