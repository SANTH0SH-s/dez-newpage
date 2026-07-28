import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio } from "@/components/ui/radio";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Cog } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { getServices, getGlobalSettings, Service } from "@/utils/db";

interface DynamicFormProps {
  selectedServiceIds: string[];
  answers: Record<string, Record<string, any>>;
  onAnswerChange: (serviceId: string, questionId: string, value: any) => void;
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
  const [services, setServices] = useState<Service[]>([]);
  const [currency, setCurrency] = useState("₹");
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  useEffect(() => {
    setServices(getServices());
    setCurrency(getGlobalSettings().currency);
  }, []);

  // Find current service object
  const currentServiceId = selectedServiceIds[currentServiceIndex];
  const service = services.find((s) => s.id === currentServiceId);

  if (!service) return null;

  const isFirstService = currentServiceIndex === 0;
  const isLastService = currentServiceIndex === selectedServiceIds.length - 1;

  const handleNextStep = () => {
    if (isLastService) {
      onNext();
    } else {
      setCurrentServiceIndex(currentServiceIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackStep = () => {
    if (isFirstService) {
      onBack();
    } else {
      setCurrentServiceIndex(currentServiceIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const serviceAnswers = answers[service.id] || {};

  const handleOptionToggle = (questionId: string, optionValue: string, isCheckbox: boolean) => {
    const currentValue = serviceAnswers[questionId];

    if (isCheckbox) {
      const currentList = Array.isArray(currentValue) ? currentValue : [];
      if (currentList.includes(optionValue)) {
        onAnswerChange(service.id, questionId, currentList.filter((v) => v !== optionValue));
      } else {
        onAnswerChange(service.id, questionId, [...currentList, optionValue]);
      }
    } else {
      onAnswerChange(service.id, questionId, optionValue);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 font-sans">
      {/* Questionnaire Progress Indicator */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-dezprox-accent/15 text-dezprox-primary">
            <Cog className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-xs font-bold text-dezprox-text/40 uppercase tracking-wider block">
              Service Setup {currentServiceIndex + 1} of {selectedServiceIds.length}
            </span>
            <h3 className="text-lg font-bold text-dezprox-primary">
              Configuring: {service.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-10">
        {service.questions && service.questions.map((question) => {
          const selectedValue = serviceAnswers[question.id];

          return (
            <div key={question.id} className="space-y-4">
              <h4 className="text-base font-bold text-dezprox-primary leading-tight">
                {question.text}
              </h4>

              {question.type === "select" ? (
                <Select
                  placeholder="Select option..."
                  options={question.options.map((opt: any) => ({
                    value: opt.value,
                    label: `${opt.label} (${opt.modifierType === "flat" ? "+" : ""}${currency}${opt.priceModifier.toLocaleString()}${opt.modifierType === "flat" ? "" : "x"})`
                  }))}
                  value={selectedValue || ""}
                  onChange={(e) => onAnswerChange(service.id, question.id, e.target.value)}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {question.options.map((option: any) => {
                    const isCheckbox = question.type === "checkbox";
                    const isSelected = isCheckbox
                      ? Array.isArray(selectedValue) && selectedValue.includes(option.value)
                      : selectedValue === option.value;

                    return (
                      <Card
                        key={option.value}
                        hoverable
                        selected={isSelected}
                        onClick={() => handleOptionToggle(question.id, option.value, isCheckbox)}
                        className="relative p-5 cursor-pointer select-none"
                      >
                        <div className="flex items-start">
                          <div className="mt-0.5 mr-3">
                            {isCheckbox ? (
                              <Checkbox 
                                checked={isSelected} 
                                readOnly 
                                className="pointer-events-none" 
                              />
                            ) : (
                              <Radio 
                                checked={isSelected} 
                                readOnly 
                                className="pointer-events-none" 
                              />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-6">
                            <span className="font-semibold text-sm text-dezprox-text leading-tight block">
                              {option.label}
                            </span>
                            {option.description && (
                              <span className="text-xs text-dezprox-text/50 mt-1 leading-relaxed block">
                                {option.description}
                              </span>
                            )}
                          </div>

                          <div className="text-right text-xs font-bold text-dezprox-primary self-center whitespace-nowrap">
                            {option.priceModifier !== 0 && (
                              <span>
                                {option.modifierType === "flat" ? (
                                  `+${currency}${option.priceModifier.toLocaleString()}`
                                ) : (
                                  `+${Math.round((option.priceModifier - 1) * 100)}%`
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Custom Pricing Components Section */}
        {service.pricingComponents && service.pricingComponents.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h4 className="text-base font-bold text-dezprox-primary leading-tight flex items-center gap-2">
              <span>Select Add-on Features & Components</span>
              <span className="text-xs px-2.5 py-0.5 bg-dezprox-accent/15 text-dezprox-primary rounded-full font-bold">
                Optional
              </span>
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {service.pricingComponents.map((comp) => {
                const selectedComponents = serviceAnswers["pricing-components"] || [];
                const componentUnits = serviceAnswers["pricing-component-units"] || {};
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

                const handleUnitChange = (val: number) => {
                  const newUnits = { ...componentUnits, [comp.id]: Math.max(1, val) };
                  onAnswerChange(service.id, "pricing-component-units", newUnits);
                };

                return (
                  <Card
                    key={comp.id}
                    hoverable
                    selected={isSelected}
                    onClick={handleToggleComponent}
                    className="relative p-5 cursor-pointer select-none"
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
                          <span className="font-semibold text-sm text-dezprox-text leading-tight block">
                            {comp.name}
                          </span>
                          {comp.description && (
                            <span className="text-xs text-dezprox-text/50 mt-1 leading-relaxed block">
                              {comp.description}
                            </span>
                          )}
                          {isSelected && comp.type === "per-unit" && (
                            <div 
                              className="mt-3 flex items-center space-x-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-xs text-gray-500 font-semibold">
                                Quantity ({service.unitType || "units"}):
                              </span>
                              <input
                                type="number"
                                min="1"
                                value={units}
                                onChange={(e) => handleUnitChange(parseInt(e.target.value) || 1)}
                                className="w-16 h-8 rounded-lg border border-gray-200 px-2 text-xs font-bold text-center focus:outline-none focus:border-dezprox-accent"
                              />
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
        )}
      </div>

      {/* Form Controls */}
      <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-8 gap-4">
        <Button
          variant="outline"
          onClick={handleBackStep}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          variant="accent"
          onClick={handleNextStep}
          className="flex items-center gap-2 cursor-pointer"
        >
          {isLastService ? "Review Price Estimate" : "Next Service Setup"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
