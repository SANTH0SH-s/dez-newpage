import { prisma } from "../config/database";
import { Prisma, EnquiryStatus } from "@prisma/client";

export class EnquiryRepository {
  static async create(data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company?: string | null;
    estimateRange: string;
    message: string;
    selectedServices: string[];
    status?: EnquiryStatus;
  }, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.enquiry.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        estimateRange: data.estimateRange,
        message: data.message,
        selectedServices: data.selectedServices,
        status: data.status || "PENDING"
      }
    });
  }

  static async findById(id: string) {
    return prisma.enquiry.findUnique({
      where: { id },
      include: {
        estimate: true
      }
    });
  }

  static async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      prisma.enquiry.count(),
      prisma.enquiry.findMany({
        skip,
        take: limit,
        orderBy: { createdDate: "desc" },
        include: {
          estimate: true
        }
      })
    ]);
    return { total, items, page, limit };
  }

  static async delete(id: string) {
    return prisma.enquiry.delete({
      where: { id }
    });
  }

  static async updateStatus(id: string, status: string) {
    const dbStatus = status.toUpperCase() as EnquiryStatus;
    return prisma.enquiry.update({
      where: { id },
      data: { status: dbStatus }
    });
  }
}
