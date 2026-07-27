import React, { useState } from "react";
import { SERVICES_DATA, Service, Question, QuestionOption } from "@/data/servicesData";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio } from "@/components/ui/radio";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Cog } from "lucide-react";
import { twMerge } from "tailwind-merge";

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
  // Index of the currently active service's questionnaire
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  // Find current service object
  const currentServiceId = selectedServiceIds[currentServiceIndex];
  const service = SERVICES_DATA.find((s) => s.id === currentServiceId);

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
        {service.questions.map((question) => {
          const selectedValue = serviceAnswers[question.id];

          return (
            <div key={question.id} className="space-y-4">
              <h4 className="text-base font-bold text-dezprox-primary leading-tight">
                {question.text}
              </h4>

              {question.type === "select" ? (
                <Select
                  placeholder="Select option..."
                  options={question.options.map((opt) => ({
                    value: opt.value,
                    label: `${opt.label} (${opt.modifierType === "flat" ? "+" : ""}${opt.priceModifier}${opt.modifierType === "flat" ? "$" : "x"})`
                  }))}
                  value={selectedValue || ""}
                  onChange={(e) => onAnswerChange(service.id, question.id, e.target.value)}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {question.options.map((option) => {
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
                                  `+$${option.priceModifier.toLocaleString()}`
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
      </div>

      {/* Form Controls */}
      <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-8 gap-4">
        <Button
          variant="outline"
          onClick={handleBackStep}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleNextStep}
          className="flex items-center gap-2 cursor-pointer"
        >
          {isLastService ? "Proceed to Summary" : "Next Service"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
