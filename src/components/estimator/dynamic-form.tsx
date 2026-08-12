import React, { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio } from "@/components/ui/radio";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Icons from "lucide-react";
import { ArrowLeft, ArrowRight, Cog } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Service, Question, PricingComponent, Package } from "@/lib/types";

interface DynamicFormProps {
  selectedServiceIds: string[];
  answers: Record<string, Record<string, unknown>>;
  onAnswerChange: (serviceId: string, questionId: string, value: unknown) => void;
  onBack: () => void;
  onNext: () => void;
}

export const DynamicForm = ({
  selectedServiceIds,
  answers,
  onAnswerChange,
  onBack,
  onNext
}: DynamicFormProps) => {
  const [mounted, setMounted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const services = useMemo(() => {
    if (!mounted) return [];
    const raw = localStorage.getItem("dezprox_services");
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Service[];
    } catch {
      return [];
    }
  }, [mounted]);

  const currency = useMemo(() => {
    if (!mounted) return "₹";
    const raw = localStorage.getItem("dezprox_settings");
    if (!raw) return "₹";
    try {
      return JSON.parse(raw).currency || "₹";
    } catch {
      return "₹";
    }
  }, [mounted]);

  // Auto-select first active package for all selected services if none is selected yet
  useEffect(() => {
    if (services.length > 0 && selectedServiceIds.length > 0) {
      selectedServiceIds.forEach((serviceId) => {
        const srv = services.find((s) => s.id === serviceId);
        if (srv && srv.packages) {
          const activePkgs = srv.packages.filter((p: Package) => p.status === "active");
          if (activePkgs.length > 0 && !answers[srv.id]?.["selected-package"]) {
            onAnswerChange(srv.id, "selected-package", activePkgs[0].id);
          }
        }
      });
    }
  }, [services, selectedServiceIds, answers, onAnswerChange]);

  const activeServices = services.filter((s) => selectedServiceIds.includes(s.id));

  if (!mounted) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-4 w-96 bg-gray-150 rounded" />
          </div>
        </div>
        <div className="h-96 rounded-xl border border-gray-100 bg-gray-50/50 p-6 animate-pulse" />
      </div>
    );
  }

  if (activeServices.length === 0) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 py-16 text-center font-sans">
        <Icons.Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-dezprox-primary">No Configured Services Found</h3>
        <p className="text-gray-500 text-sm mt-2">Please go back and select at least one service to configure.</p>
        <Button onClick={onBack} className="mt-6 flex items-center justify-center gap-2 mx-auto cursor-pointer" variant="outline">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </div>
    );
  }

  const handleNextStep = () => {
    const errors = validateQuestions();
    setFieldErrors(errors);
    
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      // Scroll to the first error
      const firstErrorKey = errorKeys[0];
      const element = document.getElementById(`field-container-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    onNext();
  };

  const validateQuestions = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    selectedServiceIds.forEach((serviceId) => {
      const srv = services.find((s) => s.id === serviceId);
      if (!srv) return;
      
      const srvAnswers = answers[serviceId] || {};
      const selectedPkgId = srvAnswers["selected-package"];
      
      let list: Question[] = [...(srv.questions || [])];
      if (selectedPkgId && srv.packages) {
        const pkg = srv.packages.find((p) => p.id === selectedPkgId);
        if (pkg && pkg.questions) {
          list = [...list, ...pkg.questions];
        }
      }
      const combined = list.sort((a, b) => a.displayOrder - b.displayOrder);
      
      combined.forEach((q) => {
        const isQuestionVisibleLocal = (quest: Question) => {
          if (!quest.conditionalParentId) return true;
          const parentVal = srvAnswers[quest.conditionalParentId];
          if (parentVal === undefined || parentVal === null || parentVal === "") return false;
          
          if (Array.isArray(parentVal)) {
            return parentVal.includes(quest.conditionalParentValue);
          }
          return String(parentVal) === String(quest.conditionalParentValue);
        };

        if (!isQuestionVisibleLocal(q)) return;
        
        const val = srvAnswers[q.id];
        const hasValue = val !== undefined && val !== null && val !== "" && (!Array.isArray(val) || val.length > 0);
        
        const errorKey = `${serviceId}_${q.id}`;
        
        if (q.isRequired && !hasValue) {
          newErrors[errorKey] = "This field is required.";
          return;
        }
        
        if (hasValue && q.validationRules) {
          const { min, max, pattern, message } = q.validationRules;
          const msg = message || "Invalid input value.";
          
          if (q.type === "text" && typeof val === "string") {
            if (min !== undefined && min !== null && val.length < min) {
              newErrors[errorKey] = `Must be at least ${min} characters long.`;
            }
            if (max !== undefined && max !== null && val.length > max) {
              newErrors[errorKey] = `Must not exceed ${max} characters.`;
            }
            if (pattern) {
              try {
                const regex = new RegExp(pattern);
                if (!regex.test(val)) {
                  newErrors[errorKey] = msg;
                }
              } catch (err) {
                console.error("Invalid regex pattern", err);
              }
            }
          }
          
          if (["counter", "number"].includes(q.type)) {
            const numVal = parseFloat(String(val));
            if (!isNaN(numVal)) {
              if (min !== undefined && min !== null && numVal < min) {
                newErrors[errorKey] = `Minimum value is ${min}.`;
              }
              if (max !== undefined && max !== null && numVal > max) {
                newErrors[errorKey] = `Maximum value is ${max}.`;
              }
            }
          }
        }
      });
    });
    
    return newErrors;
  };

  const handleOptionToggle = (serviceId: string, questionId: string, optionValue: string, isCheckbox: boolean) => {
    const srvAnswers = answers[serviceId] || {};
    const currentValue = srvAnswers[questionId];

    if (isCheckbox) {
      const currentList = Array.isArray(currentValue) ? currentValue : [];
      if (currentList.includes(optionValue)) {
        onAnswerChange(serviceId, questionId, currentList.filter((v) => v !== optionValue));
      } else {
        onAnswerChange(serviceId, questionId, [...currentList, optionValue]);
      }
    } else {
      onAnswerChange(serviceId, questionId, optionValue);
    }
  };

  // Check if any package is selected across all services
  const isAnyPackageMissing = activeServices.some((service) => {
    const servicePackages = service.packages ? service.packages.filter((p: Package) => p.status === "active") : [];
    const selectedPackageId = answers[service.id]?.["selected-package"];
    return servicePackages.length > 0 && !selectedPackageId;
  });

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 font-sans space-y-12">
      {activeServices.map((service, index) => {
        const serviceAnswers = answers[service.id] || {};
        const servicePackages = service.packages ? service.packages.filter((p: Package) => p.status === "active") : [];
        const selectedPackageId = serviceAnswers["selected-package"];

        // Get combined questions for this service
        let list: Question[] = [...(service.questions || [])];
        if (selectedPackageId && service.packages) {
          const pkg = service.packages.find((p) => p.id === selectedPackageId);
          if (pkg && pkg.questions) {
            list = [...list, ...pkg.questions];
          }
        }
        const combinedQuestions = list.sort((a, b) => a.displayOrder - b.displayOrder);

        return (
          <div key={service.id} className="border border-gray-200 rounded-3xl p-6 md:p-8 bg-white/50 backdrop-blur-sm space-y-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                {service.thumbnail ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={service.thumbnail} alt={service.name} className="w-10 h-10 rounded-xl object-cover border border-gray-150 shadow-sm shrink-0" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-dezprox-accent/15 text-dezprox-primary shrink-0">
                    <Cog className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-black text-dezprox-accent uppercase tracking-wider block">
                    Service Setup {index + 1} of {selectedServiceIds.length}
                  </span>
                  <h3 className="text-base font-extrabold text-dezprox-primary">
                    Configuring: {service.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Packages Selector */}
            {servicePackages.length > 0 && (
              <div className="space-y-4 pb-8 border-b border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight flex items-center gap-2">
                  <span>Select Service Package Tier</span>
                  <span className="text-[10px] px-2 py-0.5 bg-dezprox-accent/15 text-dezprox-primary rounded-full font-bold">
                    Required
                  </span>
                </h4>

                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm pt-2 w-full">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs min-w-[580px] table-fixed" style={{ tableLayout: "fixed" }}>
                      <thead>
                        {/* Badges Row */}
                        <tr className="bg-gray-50">
                          <th className="py-2 px-3" style={{ width: "24%" }}></th>
                          {servicePackages.map((pkg: Package) => {
                            const isSelected = selectedPackageId === pkg.id;
                            return (
                              <th 
                                key={`badge-${pkg.id}`}
                                className={twMerge(
                                  "py-2 px-2 text-center transition-all",
                                  isSelected ? "bg-dezprox-accent/5" : ""
                                )}
                                style={{ width: `${76 / servicePackages.length}%` }}
                              >
                                <div className="flex flex-col gap-1 items-center justify-center min-h-[40px]">
                                  {pkg.isRecommended && (
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-dezprox-accent text-white px-2 py-0.5 rounded-full shadow-sm text-center leading-none">
                                      Recommended
                                    </span>
                                  )}
                                  {pkg.isPopular && (
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-dezprox-primary text-white px-2 py-0.5 rounded-full shadow-sm text-center leading-none border border-white/10">
                                      Popular
                                    </span>
                                  )}
                                  {pkg.isBestValue && (
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm text-center leading-none">
                                      Best Value
                                    </span>
                                  )}
                                  {pkg.isNew && (
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm text-center leading-none">
                                      New
                                    </span>
                                  )}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                        {/* Plan Headings Row */}
                        <tr className="bg-gray-50 border-b border-gray-150">
                          <th 
                            className="py-3.5 px-3 font-black text-gray-500 uppercase tracking-wider text-xs"
                            style={{ width: "24%" }}
                          >
                            Comparison Plan
                          </th>
                          {servicePackages.map((pkg: Package) => {
                            const isSelected = selectedPackageId === pkg.id;
                            return (
                              <th 
                                key={pkg.id} 
                                onClick={() => onAnswerChange(service.id, "selected-package", pkg.id)}
                                className={twMerge(
                                  "py-3.5 px-2 text-center cursor-pointer select-none transition-all text-sm font-black",
                                  isSelected ? "bg-dezprox-accent/5 text-dezprox-accent" : "text-dezprox-primary hover:bg-gray-50/50"
                                )}
                                style={{ width: `${76 / servicePackages.length}%` }}
                              >
                                {pkg.name.replace("No-Code ", "No-Code\n").split("\n").map((part: string, idx: number) => (
                                  <span key={idx} className="block leading-tight">
                                    {part}
                                  </span>
                                ))}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Price Row */}
                        <tr className="border-b border-gray-150">
                          <td className="py-3.5 px-3 font-bold text-gray-500 uppercase tracking-wide text-xs break-words">Estimated Price</td>
                          {servicePackages.map((pkg: Package) => (
                            <td key={pkg.id} className={twMerge("py-3.5 px-2 text-center font-extrabold text-sm text-dezprox-primary break-words", selectedPackageId === pkg.id ? "bg-dezprox-accent/5" : "")}>
                              {currency}{pkg.price.toLocaleString()}
                            </td>
                          ))}
                        </tr>

                        {/* Default Page Count Row */}
                        {service.id === "website-dev" && (
                          <tr className="border-b border-gray-150">
                            <td className="py-3.5 px-3 font-bold text-gray-500 uppercase tracking-wide text-xs break-words">Default Page Count</td>
                            {servicePackages.map((pkg: Package) => (
                              <td key={pkg.id} className={twMerge("py-3.5 px-2 text-center font-bold text-xs text-dezprox-primary break-words", selectedPackageId === pkg.id ? "bg-dezprox-accent/5" : "")}>
                                4 Pages
                              </td>
                            ))}
                          </tr>
                        )}

                        {/* Delivery Timeline row */}
                        <tr className="border-b border-gray-150">
                          <td className="py-3.5 px-3 font-bold text-gray-500 uppercase tracking-wide text-xs break-words">Delivery Duration</td>
                          {servicePackages.map((pkg: Package) => (
                            <td key={pkg.id} className={twMerge("py-3.5 px-2 text-center font-bold text-xs text-dezprox-primary break-words", selectedPackageId === pkg.id ? "bg-dezprox-accent/5" : "")}>
                              {pkg.timeline}
                            </td>
                          ))}
                        </tr>

                        {/* Description row */}
                        <tr className="border-b border-gray-150">
                          <td className="py-3.5 px-3 font-bold text-gray-500 uppercase tracking-wide text-xs break-words">Tier Description</td>
                          {servicePackages.map((pkg: Package) => (
                            <td key={pkg.id} className={twMerge("py-3.5 px-2 text-center text-dezprox-text/80 leading-relaxed font-normal text-xs break-words", selectedPackageId === pkg.id ? "bg-dezprox-accent/5" : "")}>
                              {(() => {
                                const desc = (pkg.description || "").replace(/\s*Note:.*$/gi, "").trim();
                                const parts = desc.split(/(\bwith\b|\bwithout\b)/i);
                                return parts.map((part: string, idx: number) => {
                                  const lower = part.toLowerCase();
                                  if (lower === "with" || lower === "without") {
                                    return (
                                      <span key={idx} className="font-extrabold text-dezprox-primary">
                                        {part}
                                      </span>
                                    );
                                  }
                                  return part;
                                });
                              })()}
                            </td>
                          ))}
                        </tr>

                        {/* Pricing Notes row */}
                        {(() => {
                          const hasNotes = servicePackages.some((pkg: Package) => 
                            (service.id === "website-dev" && (pkg.id === "web-nocode" || pkg.id.includes("web-std") || pkg.id === "web-dyn")) ||
                            (service.id === "ecommerce-dev" && pkg.id === "ecom-nocode")
                          );
                          
                          if (!hasNotes) return null;

                          return (
                            <tr className="border-b border-gray-150 bg-amber-50/20">
                              <td className="py-3.5 px-3 font-bold text-gray-500 uppercase tracking-wide text-xs break-words">Pricing Notes</td>
                              {servicePackages.map((pkg: Package) => {
                                let noteText = "";
                                if (service.id === "website-dev") {
                                  if (pkg.id === "web-nocode") {
                                    noteText = "The price mentioned is only for Development and Deployment. Platform fee has to be paid to the platform directly.";
                                  } else if (pkg.id.includes("web-std") || pkg.id === "web-dyn") {
                                    const pageCost = pkg.id === "web-dyn" ? "3,500" : "2,500";
                                    noteText = `Adding each page will cost ₹${pageCost} | AMC ₹2,000 - Website content updates & SEO will be updated once in every 3 months.`;
                                  }
                                } else if (service.id === "ecommerce-dev") {
                                  if (pkg.id === "ecom-nocode") {
                                    noteText = "The price mentioned is exclusive of platform and subscription fees.";
                                  }
                                }

                                const isSelected = selectedPackageId === pkg.id;
                                return (
                                  <td 
                                    key={`note-${pkg.id}`} 
                                    className={twMerge(
                                      "py-3.5 px-2 text-center text-amber-900 leading-normal font-semibold text-xs break-words", 
                                      isSelected ? "bg-dezprox-accent/5" : ""
                                    )}
                                  >
                                    {noteText ? (
                                      noteText.split(/(₹[\d,]+|Rs\.?\s*[\d,]+)/g).map((part: string, idx: number) => {
                                        if (/^(₹|Rs)/i.test(part)) {
                                          return (
                                            <span 
                                              key={idx} 
                                              className="font-black text-indigo-600"
                                            >
                                              {part}
                                            </span>
                                          );
                                        }
                                        return part;
                                      })
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })()}

                        {/* Features checklist rows */}
                        {(() => {
                          const allUniqueFeatures = Array.from(
                            new Set(servicePackages.flatMap((p: Package) => p.features || []))
                          );
                          
                          return allUniqueFeatures.map((feat) => (
                            <tr key={feat} className="border-b border-gray-150 hover:bg-gray-50/20">
                              <td className="py-3 px-3 font-semibold text-dezprox-text text-xs leading-snug break-words">{feat}</td>
                              {servicePackages.map((pkg: Package) => {
                                const hasFeature = pkg.features?.includes(feat);
                                const isSelected = selectedPackageId === pkg.id;
                                return (
                                  <td 
                                    key={pkg.id} 
                                    className={twMerge(
                                      "py-3 px-2 text-center",
                                      isSelected ? "bg-dezprox-accent/5" : ""
                                    )}
                                  >
                                    {hasFeature ? (
                                      <Icons.Check className="w-4 h-4 text-emerald-500 mx-auto" />
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ));
                        })()}

                        {/* Selector Row */}
                        <tr>
                          <td className="py-3 px-3"></td>
                          {servicePackages.map((pkg: Package) => {
                            const isSelected = selectedPackageId === pkg.id;
                            return (
                              <td key={pkg.id} className={twMerge("py-3 px-2 text-center", isSelected ? "bg-dezprox-accent/5" : "")}>
                                <Button
                                  onClick={() => onAnswerChange(service.id, "selected-package", pkg.id)}
                                  variant={isSelected ? "accent" : "outline"}
                                  className="w-full font-bold text-[11px] py-2 px-1 rounded-lg cursor-pointer"
                                >
                                  {isSelected ? "Selected" : "Select Tier"}
                                </Button>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Questions Stack */}
            {combinedQuestions.length > 0 && (
              <div className="space-y-6 pt-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">
                  Configuration Settings
                </h4>
                <div className="space-y-6">
                  {combinedQuestions.map((question) => {
                    const isQVisible = () => {
                      if (!question.conditionalParentId) return true;
                      const parentVal = serviceAnswers[question.conditionalParentId];
                      if (parentVal === undefined || parentVal === null || parentVal === "") return false;
                      
                      if (Array.isArray(parentVal)) {
                        return parentVal.includes(question.conditionalParentValue);
                      }
                      return String(parentVal) === String(question.conditionalParentValue);
                    };
                    if (!isQVisible()) return null;
                    
                    const selectedValue = serviceAnswers[question.id];
                    const errorKey = `${service.id}_${question.id}`;
                    const hasError = !!fieldErrors[errorKey];
                    const errorMessage = fieldErrors[errorKey];

                    return (
                      <div 
                        key={question.id} 
                        id={`field-container-${errorKey}`} 
                        className="space-y-3 p-5 rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.01)] transition-all hover:border-gray-150 relative"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-dezprox-primary leading-tight">
                              {question.text}
                              {question.isRequired && <span className="text-red-500 ml-1 font-bold">*</span>}
                            </h4>
                            {question.description && (
                              <p className="text-[10px] text-dezprox-text/50 mt-1 font-normal leading-normal">
                                {question.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {question.type === "radio" || question.type === "select" ? (
                          <div className="grid grid-cols-1 gap-3 pt-1">
                            {question.options?.map((opt) => {
                              const isOptSelected = selectedValue === opt.value;
                              return (
                                <div
                                  key={opt.value}
                                  onClick={() => {
                                    onAnswerChange(service.id, question.id, opt.value);
                                    if (fieldErrors[errorKey]) setFieldErrors(prev => ({ ...prev, [errorKey]: "" }));
                                  }}
                                  className={twMerge(
                                    "flex items-start p-3.5 border rounded-xl cursor-pointer transition-all select-none hover:bg-gray-50/40",
                                    isOptSelected 
                                      ? "border-dezprox-primary bg-dezprox-primary/5 shadow-sm" 
                                      : "border-gray-150 bg-white"
                                  )}
                                >
                                  <div className="mr-3 mt-0.5">
                                    <Radio checked={isOptSelected} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-dezprox-primary leading-tight block">
                                      {opt.label}
                                    </span>
                                    {opt.description && (
                                      <span className="text-[10px] text-dezprox-text/55 mt-1 leading-normal block font-normal">
                                        {opt.description}
                                      </span>
                                    )}
                                  </div>
                                  {opt.priceModifier !== 0 && (
                                    <div className="text-xs font-extrabold text-dezprox-primary ml-4 shrink-0">
                                      {opt.modifierType === "flat" ? (
                                        `+${currency}${opt.priceModifier.toLocaleString()}`
                                      ) : (
                                        `+${Math.round((opt.priceModifier - 1) * 100)}%`
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : question.type === "checkbox" ? (
                          <div className="grid grid-cols-1 gap-3 pt-1">
                            {question.options?.map((opt) => {
                              const currentList = Array.isArray(selectedValue) ? selectedValue : [];
                              const isOptSelected = currentList.includes(opt.value);
                              return (
                                <div
                                  key={opt.value}
                                  onClick={() => handleOptionToggle(service.id, question.id, opt.value, true)}
                                  className={twMerge(
                                    "flex items-start p-3.5 border rounded-xl cursor-pointer transition-all select-none hover:bg-gray-50/40",
                                    isOptSelected 
                                      ? "border-dezprox-primary bg-dezprox-primary/5 shadow-sm" 
                                      : "border-gray-150 bg-white"
                                  )}
                                >
                                  <div className="mr-3 mt-0.5">
                                    <Checkbox checked={isOptSelected} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-dezprox-primary leading-tight block">
                                      {opt.label}
                                    </span>
                                    {opt.description && (
                                      <span className="text-[10px] text-dezprox-text/55 mt-1 leading-normal block font-normal">
                                        {opt.description}
                                      </span>
                                    )}
                                  </div>
                                  {opt.priceModifier !== 0 && (
                                    <div className="text-xs font-extrabold text-dezprox-primary ml-4 shrink-0">
                                      {opt.modifierType === "flat" ? (
                                        `+${currency}${opt.priceModifier.toLocaleString()}`
                                      ) : (
                                        `+${Math.round((opt.priceModifier - 1) * 100)}%`
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : question.type === "toggle" ? (
                          <div className="flex items-center pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = !selectedValue;
                                onAnswerChange(service.id, question.id, nextVal);
                                if (fieldErrors[errorKey]) setFieldErrors(prev => ({ ...prev, [errorKey]: "" }));
                              }}
                              className={twMerge(
                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                selectedValue ? "bg-dezprox-primary" : "bg-gray-200"
                              )}
                            >
                              <span
                                className={twMerge(
                                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                  selectedValue ? "translate-x-5" : "translate-x-0"
                                )}
                              />
                            </button>
                            <span className="text-xs font-bold text-gray-500 ml-3">
                              {selectedValue ? "Yes" : "No"}
                            </span>
                          </div>
                        ) : question.type === "counter" ? (
                          <div className="flex items-center space-x-3 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const val = parseInt(String(selectedValue)) || 0;
                                const nextVal = Math.max(0, val - 1);
                                onAnswerChange(service.id, question.id, nextVal);
                              }}
                              className="w-8 h-8 rounded-lg border border-gray-200 hover:border-gray-300 text-dezprox-primary flex items-center justify-center font-bold text-sm select-none hover:bg-gray-50 active:scale-95 transition-all"
                            >
                              -
                            </button>
                            <span className="w-12 text-center text-sm font-black text-dezprox-primary">
                              {(selectedValue !== undefined && selectedValue !== null) ? String(selectedValue) : String(question.defaultValue || 0)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const val = parseInt(String(selectedValue)) || 0;
                                const nextVal = val + 1;
                                onAnswerChange(service.id, question.id, nextVal);
                                if (fieldErrors[errorKey]) setFieldErrors(prev => ({ ...prev, [errorKey]: "" }));
                              }}
                              className="w-8 h-8 rounded-lg border border-gray-200 hover:border-gray-300 text-dezprox-primary flex items-center justify-center font-bold text-sm select-none hover:bg-gray-50 active:scale-95 transition-all"
                            >
                              +
                            </button>
                          </div>
                        ) : question.type === "number" ? (
                          <div className="pt-1">
                            <Input
                              type="number"
                               min={question.validationRules?.min ?? undefined}
                              max={question.validationRules?.max ?? undefined}
                              placeholder="Enter value..."
                              value={(selectedValue !== undefined && selectedValue !== null) ? String(selectedValue) : ""}
                              onChange={(e) => {
                                const val = e.target.value !== "" ? parseFloat(e.target.value) : "";
                                onAnswerChange(service.id, question.id, val);
                                if (fieldErrors[errorKey]) setFieldErrors(prev => ({ ...prev, [errorKey]: "" }));
                              }}
                              className={hasError ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}
                            />
                          </div>
                        ) : (
                          <div className="pt-1">
                            <Input
                              type="text"
                              placeholder="Enter details..."
                              value={(selectedValue !== undefined && selectedValue !== null) ? String(selectedValue) : ""}
                              onChange={(e) => {
                                onAnswerChange(service.id, question.id, e.target.value);
                                if (fieldErrors[errorKey]) setFieldErrors(prev => ({ ...prev, [errorKey]: "" }));
                              }}
                              className={hasError ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}
                            />
                          </div>
                        )}

                        {/* Validation Error Message */}
                        {hasError && (
                          <p className="text-[11px] text-red-500 font-bold mt-1">
                            {errorMessage}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Pricing Components Section */}
            {((service.pricingComponents || []).filter((comp) => comp.status !== "inactive")).length > 0 && (() => {
              const activeComponents = (service.pricingComponents || []).filter((comp) => comp.status !== "inactive");
              const groups: Record<string, PricingComponent[]> = {};
              activeComponents.forEach((comp) => {
                const cat = comp.category || "Integrations";
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(comp);
              });

              return (
                <div className="space-y-6 pt-8 border-t border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight flex items-center gap-2">
                    <span>Select Add-on Features & Components</span>
                    <span className="text-[10px] px-2 py-0.5 bg-dezprox-accent/15 text-dezprox-primary rounded-full font-bold">
                      Optional
                    </span>
                  </h4>
                  
                  {Object.entries(groups).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        {category}
                      </span>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {items.map((comp) => {
                          const selectedComponents = (serviceAnswers["pricing-components"] as string[]) || [];
                          const componentUnits = (serviceAnswers["pricing-component-units"] as Record<string, number>) || {};
                          const isSelected = selectedComponents.includes(comp.id);
                          const units = componentUnits[comp.id] || 1;

                          const handleToggleComponent = (e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            let newList = [...selectedComponents];
                            if (isSelected) {
                              newList = newList.filter((id) => id !== comp.id);
                            } else {
                              newList.push(comp.id);
                            }
                            onAnswerChange(service.id, "pricing-components", newList);
                          };

                          const handleUnitChangeLocal = (val: number) => {
                            let nextVal = Math.max(1, val);
                            if (comp.maxQuantity !== undefined && comp.maxQuantity > 0) {
                              nextVal = Math.min(nextVal, comp.maxQuantity);
                            }
                            const newUnits = { ...componentUnits, [comp.id]: nextVal };
                            onAnswerChange(service.id, "pricing-component-units", newUnits);
                          };

                          return (
                            <Card
                              key={comp.id}
                              hoverable
                              selected={isSelected}
                              onClick={handleToggleComponent}
                              className="relative p-4 cursor-pointer select-none border border-gray-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.015)] transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start flex-1 min-w-0">
                                  <div className="mt-0.5 mr-3" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => {
                                        let newList = [...selectedComponents];
                                        if (isSelected) {
                                          newList = newList.filter((id) => id !== comp.id);
                                        } else {
                                          newList.push(comp.id);
                                        }
                                        onAnswerChange(service.id, "pricing-components", newList);
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 pr-6">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-bold text-dezprox-primary leading-tight">
                                        {comp.name}
                                      </span>
                                    </div>
                                    {comp.description && (
                                      <span className="text-[10px] text-dezprox-text/50 mt-1 leading-relaxed block pl-6">
                                        {comp.description}
                                      </span>
                                    )}
                                    {comp.note && (
                                      <span className="text-[10px] text-amber-750 font-semibold mt-2 leading-relaxed block pl-6 bg-amber-50/40 p-2 rounded-lg border border-amber-100/40">
                                        {comp.note}
                                      </span>
                                    )}
                                    {isSelected && comp.type === "per-unit" && (
                                      <div 
                                        className="mt-3 flex items-center space-x-2 pl-6"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="text-[11px] text-gray-500 font-semibold">
                                          Quantity ({service.unitType || "units"}):
                                        </span>
                                        <input
                                          type="number"
                                          min="1"
                                          max={comp.maxQuantity}
                                          value={units}
                                          onChange={(e) => handleUnitChangeLocal(parseInt(e.target.value) || 1)}
                                          className="w-16 h-8 rounded-lg border border-gray-200 px-2 text-xs font-bold text-center focus:outline-none focus:border-dezprox-accent"
                                        />
                                        {comp.maxQuantity !== undefined && comp.maxQuantity > 0 && (
                                          <span className="text-[10px] text-gray-400">
                                            (Max: {comp.maxQuantity})
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right text-xs font-bold text-dezprox-primary self-center whitespace-nowrap">
                                  {comp.type === "fixed" ? (
                                    `+${currency}${comp.fixedPrice.toLocaleString()}`
                                  ) : (
                                    `+${currency}${comp.perUnitPrice.toLocaleString()} / ${service.unitType || "unit"}`
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {servicePackages.length === 0 && combinedQuestions.length === 0 && ((service.pricingComponents || []).filter((comp) => comp.status !== "inactive")).length === 0 && (
              <div className="bg-white/70 border border-gray-150 rounded-2xl p-8 text-center space-y-4 shadow-sm my-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-dezprox-accent/15 flex items-center justify-center text-dezprox-accent">
                  <Icons.MessageSquare className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-sm font-extrabold text-dezprox-primary uppercase tracking-wider">
                  Contact Our Team
                </h4>
                <p className="text-xs text-dezprox-text/60 max-w-md mx-auto leading-relaxed font-normal">
                  This specialized service requires custom scoping to match your precise specifications and business objectives. Click next to request a callback or contact our team directly for a detailed discovery session.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Form Controls */}
      <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-gray-100 pt-8 gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center justify-center gap-2 cursor-pointer text-xs font-bold py-3 px-4 rounded-xl w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Service Selection
        </Button>

        <Button
          variant={isAnyPackageMissing ? "outline" : "accent"}
          disabled={isAnyPackageMissing}
          onClick={handleNextStep}
          className="flex items-center justify-center gap-2 cursor-pointer text-xs font-bold py-3 px-5 rounded-xl w-full sm:w-auto"
        >
          <span>Review Cost Estimate</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
