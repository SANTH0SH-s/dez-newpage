import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateProjectCosts } from "@/utils/pricingCalculator";
import { ArrowLeft, Send } from "lucide-react";

interface ContactFormProps {
  selectedServiceIds: string[];
  answers: Record<string, Record<string, any>>;
  onSubmit: (contactData: ContactData) => void;
  onBack: () => void;
}

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

export const ContactForm = ({
  selectedServiceIds,
  answers,
  onSubmit,
  onBack
}: ContactFormProps) => {
  const result = calculateProjectCosts(selectedServiceIds, answers);
  
  const [formData, setFormData] = useState<ContactData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactData, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactData, string>> = {};
    
    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-8 font-sans">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="accent" className="mb-3 px-3 py-1 font-sans text-xs">
          Step 4: Contact Information
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-dezprox-primary">
          Submit Your Custom Estimate Inquiry
        </h2>
        <p className="text-dezprox-text/60 mt-2 text-sm">
          Provide your details below to link your configuration with your account. A Dezprox manager will review your setup and reach out.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Details Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card className="border-gray-100/70 p-6">
            <CardContent className="p-0 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-bold text-dezprox-primary uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}
                  />
                  {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-bold text-dezprox-primary uppercase tracking-wider block">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="johndoe@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}
                  />
                  {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="space-y-1">
                  <label htmlFor="phone" className="text-xs font-bold text-dezprox-primary uppercase tracking-wider block">
                    Phone Number *
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}
                  />
                  {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                </div>

                {/* Company Name */}
                <div className="space-y-1">
                  <label htmlFor="company" className="text-xs font-bold text-dezprox-primary uppercase tracking-wider block">
                    Company Name
                  </label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Dezprox Corp"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label htmlFor="notes" className="text-xs font-bold text-dezprox-primary uppercase tracking-wider block">
                  Project Notes & Details
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Tell us a bit more about your targets, features, timelines..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2 cursor-pointer"
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="accent"
              className="flex items-center gap-2 cursor-pointer"
            >
              Submit Estimate Request
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Selected Specifications Panel */}
        <div className="lg:col-span-1">
          <Card className="border-gray-100/70 p-6 bg-gray-50/20">
            <CardContent className="p-0 space-y-6">
              <h3 className="font-bold text-base text-dezprox-primary border-b border-gray-100 pb-3">
                Selected Estimate
              </h3>
              
              <div className="bg-dezprox-primary text-white rounded-xl p-5 text-center">
                <span className="text-xs font-bold text-dezprox-accent uppercase tracking-widest block">
                  Estimate Range
                </span>
                <span className="text-2xl font-extrabold block mt-2">
                  ${result.estimatedMin.toLocaleString()} - ${result.estimatedMax.toLocaleString()}
                </span>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-dezprox-text/40 uppercase tracking-widest block">
                  Configured Services
                </span>
                <ul className="space-y-2">
                  {result.services.map((srv) => (
                    <li key={srv.serviceId} className="flex justify-between items-center text-sm font-sans text-dezprox-text/75">
                      <span className="truncate pr-4 font-semibold">{srv.serviceName}</span>
                      <span className="font-bold text-dezprox-primary text-xs shrink-0">
                        ${Math.round(srv.totalCost).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
