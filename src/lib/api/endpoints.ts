import { api } from "./client";

export const endpoints = {
  // Public
  getPublicServices: () => api.get<any>("/services"),
  getPublicServiceById: (id: string) => api.get<any>(`/services/${id}`),
  getPublicPackages: (serviceId: string) => api.get<any>(`/services/${serviceId}/packages`),
  getPublicComponents: (serviceId: string) => api.get<any>(`/services/${serviceId}/pricing-components`),
  getPublicQuestions: (serviceId: string) => api.get<any>(`/services/${serviceId}/questions`),
  getPublicFAQs: (serviceId: string) => api.get<any>(`/services/${serviceId}/faqs`),
  getPublicMultipliers: () => api.get<any>("/multipliers"),
  getPublicSettings: () => api.get<any>("/settings/public"),
  calculateEstimate: (body: any) => api.post<any>("/estimates/calculate", body),
  createEstimate: (body: any) => api.post<any>("/estimates", body),
  createEnquiry: (body: any) => api.post<any>("/enquiries", body),

  // Auth
  login: (body: any) => api.post<any>("/auth/login", body),
  getMe: () => api.get<any>("/auth/me"),
  logout: () => api.post<any>("/auth/logout", {}),

  // Admin CMS CRUD
  adminGetServices: () => api.get<any>("/admin/services"),
  adminGetServiceById: (id: string) => api.get<any>(`/admin/services/${id}`),
  adminCreateService: (body: any) => api.post<any>("/admin/services", body),
  adminUpdateService: (id: string, body: any) => api.patch<any>(`/admin/services/${id}`, body),
  adminDeleteService: (id: string) => api.delete<any>(`/admin/services/${id}`),

  adminGetPackages: (serviceId: string) => api.get<any>(`/admin/services/${serviceId}/packages`),
  adminCreatePackage: (serviceId: string, body: any) => api.post<any>(`/admin/services/${serviceId}/packages`, body),
  adminUpdatePackage: (id: string, body: any) => api.patch<any>(`/admin/packages/${id}`, body),
  adminDeletePackage: (id: string) => api.delete<any>(`/admin/packages/${id}`),

  adminGetComponents: (serviceId: string) => api.get<any>(`/admin/services/${serviceId}/pricing-components`),
  adminCreateComponent: (serviceId: string, body: any) => api.post<any>(`/admin/services/${serviceId}/pricing-components`, body),
  adminUpdateComponent: (id: string, body: any) => api.patch<any>(`/admin/pricing-components/${id}`, body),
  adminDeleteComponent: (id: string) => api.delete<any>(`/admin/pricing-components/${id}`),

  adminGetQuestions: (serviceId: string) => api.get<any>(`/admin/services/${serviceId}/questions`),
  adminCreateQuestion: (serviceId: string, body: any) => api.post<any>(`/admin/services/${serviceId}/questions`, body),
  adminUpdateQuestion: (id: string, body: any) => api.patch<any>(`/admin/questions/${id}`, body),
  adminDeleteQuestion: (id: string) => api.delete<any>(`/admin/questions/${id}`),

  adminGetFAQs: (serviceId: string) => api.get<any>(`/admin/services/${serviceId}/faqs`),
  adminCreateFAQ: (serviceId: string, body: any) => api.post<any>(`/admin/services/${serviceId}/faqs`, body),
  adminUpdateFAQ: (id: string, body: any) => api.patch<any>(`/admin/faqs/${id}`, body),
  adminDeleteFAQ: (id: string) => api.delete<any>(`/admin/faqs/${id}`),

  adminGetMultipliers: () => api.get<any>("/admin/multipliers"),
  adminCreateMultiplier: (body: any) => api.post<any>("/admin/multipliers", body),
  adminUpdateMultiplier: (id: string, body: any) => api.patch<any>(`/admin/multipliers/${id}`, body),
  adminDeleteMultiplier: (id: string) => api.delete<any>(`/admin/multipliers/${id}`),

  adminGetSettings: () => api.get<any>("/admin/settings"),
  adminUpdateSettings: (body: any) => api.patch<any>("/admin/settings", body),

  adminGetEstimates: (page = 1, limit = 10) => api.get<any>(`/admin/estimates?page=${page}&limit=${limit}`),
  adminGetEstimateById: (id: string) => api.get<any>(`/admin/estimates/${id}`),
  adminDeleteEstimate: (id: string) => api.delete<any>(`/admin/estimates/${id}`),
  adminUpdateEstimateStatus: (id: string, status: string) => api.patch<any>(`/admin/estimates/${id}/status`, { status }),

  adminGetEnquiries: (page = 1, limit = 10) => api.get<any>(`/admin/enquiries?page=${page}&limit=${limit}`),
  adminGetEnquiryById: (id: string) => api.get<any>(`/admin/enquiries/${id}`),
  adminDeleteEnquiry: (id: string) => api.delete<any>(`/admin/enquiries/${id}`),
  adminUpdateEnquiryStatus: (id: string, status: string) => api.patch<any>(`/admin/enquiries/${id}/status`, { status }),

  adminGetAuditLogs: () => api.get<any>("/admin/audit-logs"),
};

export const prepareEstimatePayload = (
  selectedServiceIds: string[],
  answers: Record<string, Record<string, unknown>> = {},
  projectModifiers: { complexity?: string; urgency?: string; quality?: string } = {},
  customer?: any
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
