import { Request, Response, NextFunction } from "express";
import { EnquiryCreateSchema } from "../schemas/estimate.schemas";
import { EnquiryService } from "../services/enquiry.service";
import { ApiError } from "../middleware/error.middleware";
import { serializeData } from "../utils/serialization";

export class EnquiryController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = EnquiryCreateSchema.safeParse(req.body);
      if (!parseResult.success) {
        throw new ApiError(400, "BAD_REQUEST", parseResult.error.errors[0]?.message || "Invalid input");
      }

      const result = await EnquiryService.createEnquiry(parseResult.data);

      return res.status(201).json({
        success: true,
        data: serializeData(result),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEnquiryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const enquiry = await EnquiryService.getEnquiryById(id);
      return res.status(200).json({
        success: true,
        data: serializeData(enquiry),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEnquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);
      const result = await EnquiryService.getEnquiriesList(page, limit);
      return res.status(200).json({
        success: true,
        data: {
          total: result.total,
          items: serializeData(result.items),
          page: result.page,
          limit: result.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
