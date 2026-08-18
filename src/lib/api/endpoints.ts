import { api } from "./client";
import { 
  Service, 
  Package, 
  PricingComponent, 
  Question, 
  FAQItem, 
  MultiplierSet, 
  GlobalSettings, 
  TotalCalculationResult, 
  Estimate, 
  Enquiry,
  Multiplier
} from "@/lib/types";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

export const endpoints = {
  // Public
  getPublicServices: () => api.get<ApiResponse<Service[]>>("/services"),
  getPublicServiceById: (id: string) => api.get<ApiResponse<Service>>(`/services/${id}`),
  getPublicPackages: (serviceId: string) => api.get<ApiResponse<Package[]>>(`/services/${serviceId}/packages`),
  getPublicComponents: (serviceId: string) => api.get<ApiResponse<PricingComponent[]>>(`/services/${serviceId}/pricing-components`),
  getPublicQuestions: (serviceId: string) => api.get<ApiResponse<Question[]>>(`/services/${serviceId}/questions`),
  getPublicFAQs: (serviceId: string) => api.get<ApiResponse<FAQItem[]>>(`/services/${serviceId}/faqs`),
  getPublicMultipliers: () => api.get<ApiResponse<MultiplierSet>>("/multipliers"),
  getPublicSettings: () => api.get<ApiResponse<GlobalSettings>>("/settings/public"),
  calculateEstimate: (body: unknown) => api.post<ApiResponse<TotalCalculationResult>>("/estimates/calculate", body),
  createEstimate: (body: unknown) => api.post<ApiResponse<Estimate>>("/estimates", body),
  createEnquiry: (body: unknown) => api.post<ApiResponse<Enquiry>>("/enquiries", body),

  // Auth
  login: (body: unknown) => api.post<ApiResponse<{ token?: string }>>("/auth/login", body),
  getMe: () => api.get<ApiResponse<{ id: string; email: string; name: string }>>("/auth/me"),
  logout: () => api.post<ApiResponse<{ success: boolean }>>("/auth/logout", {}),
  changePassword: (body: unknown) => api.post<ApiResponse<{ message: string }>>("/auth/change-password", body),

  // Admin CMS CRUD
  adminGetServices: () => api.get<ApiResponse<Service[]>>("/admin/services"),
  adminGetServiceById: (id: string) => api.get<ApiResponse<Service>>(`/admin/services/${id}`),
  adminCreateService: (body: unknown) => api.post<ApiResponse<Service>>("/admin/services", body),
  adminUpdateService: (id: string, body: unknown) => api.patch<ApiResponse<Service>>(`/admin/services/${id}`, body),
  adminDeleteService: (id: string) => api.delete<ApiResponse<Service>>(`/admin/services/${id}`),

  adminGetPackages: (serviceId: string) => api.get<ApiResponse<Package[]>>(`/admin/services/${serviceId}/packages`),
  adminCreatePackage: (serviceId: string, body: unknown) => api.post<ApiResponse<Package>>(`/admin/services/${serviceId}/packages`, body),
  adminUpdatePackage: (id: string, body: unknown) => api.patch<ApiResponse<Package>>(`/admin/packages/${id}`, body),
  adminDeletePackage: (id: string) => api.delete<ApiResponse<Package>>(`/admin/packages/${id}`),

  adminGetComponents: (serviceId: string) => api.get<ApiResponse<PricingComponent[]>>(`/admin/services/${serviceId}/pricing-components`),
  adminCreateComponent: (serviceId: string, body: unknown) => api.post<ApiResponse<PricingComponent>>(`/admin/services/${serviceId}/pricing-components`, body),
  adminUpdateComponent: (id: string, body: unknown) => api.patch<ApiResponse<PricingComponent>>(`/admin/pricing-components/${id}`, body),
  adminDeleteComponent: (id: string) => api.delete<ApiResponse<PricingComponent>>(`/admin/pricing-components/${id}`),

  adminGetQuestions: (serviceId: string) => api.get<ApiResponse<Question[]>>(`/admin/services/${serviceId}/questions`),
  adminCreateQuestion: (serviceId: string, body: unknown) => api.post<ApiResponse<Question>>(`/admin/services/${serviceId}/questions`, body),
  adminUpdateQuestion: (id: string, body: unknown) => api.patch<ApiResponse<Question>>(`/admin/questions/${id}`, body),
  adminDeleteQuestion: (id: string) => api.delete<ApiResponse<Question>>(`/admin/questions/${id}`),

  adminGetFAQs: (serviceId: string) => api.get<ApiResponse<FAQItem[]>>(`/admin/services/${serviceId}/faqs`),
  adminCreateFAQ: (serviceId: string, body: unknown) => api.post<ApiResponse<FAQItem>>(`/admin/services/${serviceId}/faqs`, body),
  adminUpdateFAQ: (id: string, body: unknown) => api.patch<ApiResponse<FAQItem>>(`/admin/faqs/${id}`, body),
  adminDeleteFAQ: (id: string) => api.delete<ApiResponse<FAQItem>>(`/admin/faqs/${id}`),

  adminGetMultipliers: () => api.get<ApiResponse<MultiplierSet>>("/admin/multipliers"),
  adminCreateMultiplier: (body: unknown) => api.post<ApiResponse<Multiplier>>("/admin/multipliers", body),
  adminUpdateMultiplier: (id: string, body: unknown) => api.patch<ApiResponse<Multiplier>>(`/admin/multipliers/${id}`, body),
  adminDeleteMultiplier: (id: string) => api.delete<ApiResponse<Multiplier>>(`/admin/multipliers/${id}`),

  adminGetSettings: () => api.get<ApiResponse<GlobalSettings>>("/admin/settings"),
  adminUpdateSettings: (body: unknown) => api.patch<ApiResponse<GlobalSettings>>("/admin/settings", body),

  adminGetEstimates: (page = 1, limit = 10) => api.get<ApiResponse<{ items: Estimate[]; total: number }>>(`/admin/estimates?page=${page}&limit=${limit}`),
  adminGetEstimateById: (id: string) => api.get<ApiResponse<Estimate>>(`/admin/estimates/${id}`),
  adminDeleteEstimate: (id: string) => api.delete<ApiResponse<{ success: boolean }>>(`/admin/estimates/${id}`),
  adminUpdateEstimateStatus: (id: string, status: string) => api.patch<ApiResponse<Estimate>>(`/admin/estimates/${id}/status`, { status }),

  adminGetEnquiries: (page = 1, limit = 10) => api.get<ApiResponse<{ items: Enquiry[]; total: number }>>(`/admin/enquiries?page=${page}&limit=${limit}`),
  adminGetEnquiryById: (id: string) => api.get<ApiResponse<Enquiry>>(`/admin/enquiries/${id}`),
  adminDeleteEnquiry: (id: string) => api.delete<ApiResponse<{ success: boolean }>>(`/admin/enquiries/${id}`),
  adminUpdateEnquiryStatus: (id: string, status: string) => api.patch<ApiResponse<Enquiry>>(`/admin/enquiries/${id}/status`, { status }),

  adminGetAuditLogs: () => api.get<ApiResponse<unknown[]>>("/admin/audit-logs"),
};

export const prepareEstimatePayload = (
  selectedServiceIds: string[],
  answers: Record<string, Record<string, unknown>> = {},
  projectModifiers: { complexity?: string; urgency?: string; quality?: string } = {},
  customer?: { name: string; email: string; phone?: string; company?: string; notes?: string }
) => {
  const services = selectedServiceIds.map((serviceId) => {
    const serviceAnswers = answers[serviceId] || {};
    const packageId = serviceAnswers["selected-package"] as string || null;

    const addonIds = (serviceAnswers["pricing-components"] as string[]) || [];
    const unitsMap = (serviceAnswers["pricing-component-units"] as Record<string, number>) || {};

    const addons = addonIds.map((addonId) => ({
      pricingComponentId: addonId,
      units: unitsMap[addonId] || 1,
    }));

    const cleanAnswers: Record<string, unknown> = {};
    for (const key of Object.keys(serviceAnswers)) {
      if (key !== "selected-package" && key !== "pricing-components" && key !== "pricing-component-units") {
        cleanAnswers[key] = serviceAnswers[key];
      }
    }

    return {
      serviceId,
      packageId,
      answers: cleanAnswers,
      addons,
    };
  });

  return {
    services,
    multipliers: {
      complexity: projectModifiers.complexity || "simple",
      urgency: projectModifiers.urgency || "normal",
      quality: projectModifiers.quality || "standard",
    },
    customer: customer ? {
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      company: customer.company || "",
      notes: customer.notes || "",
    } : undefined,
  };
};
