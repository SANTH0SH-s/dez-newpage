"use client";

import React, { useState } from "react";
import { DezproxLogo } from "@/components/ui/logo";
import { PremiumBackground } from "@/components/ui/premium-background";
import { Hero } from "@/components/estimator/hero";
import { ServiceSelector } from "@/components/estimator/service-selector";
import { DynamicForm } from "@/components/estimator/dynamic-form";
import { PriceSummary } from "@/components/estimator/price-summary";
import { ContactForm, ContactData } from "@/components/estimator/contact-form";
import { SuccessMessage } from "@/components/estimator/success-message";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { ShieldCheck, HelpCircle, Layers, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Steps defined for the ProgressStepper
const FLOW_STEPS = [
  "Choose Services",
  "Configure Options",
  "Review Estimate",
  "Contact Info",
  "Complete"
];

export default function Home() {
  // Stepper state:
  // 0: Hero page (prior to stepper visual)
  // 1: Service Selection (maps to Stepper index 0)
  // 2: Dynamic Questionnaire (maps to Stepper index 1)
  // 3: Standalone Price Summary (maps to Stepper index 2)
  // 4: Contact Form (maps to Stepper index 3)
  // 5: Success Message (maps to Stepper index 4)
  const [currentStep, setCurrentStep] = useState(0);

  // Selections & Configuration State
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, Record<string, any>>>({});
  
  // Submission contact details
  const [contactData, setContactData] = useState<ContactData | null>(null);

  // Update question answers
  const handleAnswerChange = (serviceId: string, questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || {}),
        [questionId]: value
      }
    }));
  };

  // Navigations
  const handleStart = () => setCurrentStep(1);
  const handleNextFromSelector = () => setCurrentStep(2);
  const handleNextFromForm = () => setCurrentStep(3);
  const handleNextFromSummary = () => setCurrentStep(4);
  
  const handleContactSubmit = (data: ContactData) => {
    setContactData(data);
    setCurrentStep(5);
  };

  const handleBackToSelector = () => setCurrentStep(1);
  const handleBackToForm = () => setCurrentStep(2);
  const handleBackToSummary = () => setCurrentStep(3);

  const handleReset = () => {
    setSelectedServiceIds([]);
    setAnswers({});
    setContactData(null);
    setCurrentStep(0);
  };

  // Maps workflow step active index to ProgressStepper index
  // Returns -1 if we are on Hero screen (step 0)
  const stepperIndex = currentStep > 0 ? currentStep - 1 : -1;

  return (
    <div className="flex flex-col min-h-screen bg-white relative overflow-hidden">
      {/* Premium Animated SaaS-Style Background */}
      <PremiumBackground currentStep={currentStep} />

      {/* Premium Header */}
      <header className="border-b border-gray-100 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 print:hidden relative">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <DezproxLogo showTagline={true} />

          <div className="flex items-center space-x-6 text-sm font-sans font-bold text-gray-500">
            <span className="hidden md:inline-flex items-center gap-1.5 hover:text-dezprox-primary transition-colors cursor-pointer">
              <ShieldCheck className="w-4 h-4 text-dezprox-accent" />
              Secure Data Guarantee
            </span>
            <a 
              href="mailto:support@dezprox.com"
              className="text-dezprox-primary hover:underline flex items-center gap-1 font-semibold"
            >
              Need Support?
            </a>
          </div>
        </div>
      </header>

      {/* Main Flow Orchestrator */}
      <main className="flex-1 w-full flex flex-col items-center relative z-10">
        {/* Stepper container (Shown when not on Hero or Success Page) */}
        {currentStep > 0 && currentStep < 5 && (
          <div className="w-full max-w-[1280px] mx-auto pt-10 pb-6 print:hidden">
            <ProgressStepper 
              steps={FLOW_STEPS} 
              currentStep={stepperIndex} 
              onStepClick={(idx) => setCurrentStep(idx + 1)}
            />
          </div>
        )}

        {/* Dynamic Step Viewport with Slide Fades */}
        <div className="w-full max-w-[1280px] mx-auto flex-1 flex flex-col justify-center py-6">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Hero onStart={handleStart} />
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="selector"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <ServiceSelector
                  selectedServiceIds={selectedServiceIds}
                  onChange={setSelectedServiceIds}
                  onNext={handleNextFromSelector}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start px-4"
              >
                {/* Form Questionnaire (Left Column) */}
                <div className="lg:col-span-2">
                  <DynamicForm
                    selectedServiceIds={selectedServiceIds}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    onBack={handleBackToSelector}
                    onNext={handleNextFromForm}
                  />
                </div>

                {/* Live Sidebar Calculator Widget (Right Column) */}
                <div className="lg:col-span-1 py-8 hidden lg:block">
                  <PriceSummary
                    selectedServiceIds={selectedServiceIds}
                    answers={answers}
                    sidebarMode={true}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <PriceSummary
                  selectedServiceIds={selectedServiceIds}
                  answers={answers}
                  onBack={handleBackToForm}
                  onNext={handleNextFromSummary}
                  sidebarMode={false}
                />
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <ContactForm
                  selectedServiceIds={selectedServiceIds}
                  answers={answers}
                  onSubmit={handleContactSubmit}
                  onBack={handleBackToSummary}
                />
              </motion.div>
            )}

            {currentStep === 5 && contactData && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <SuccessMessage
                  selectedServiceIds={selectedServiceIds}
                  answers={answers}
                  contactData={contactData}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50/50 text-center text-xs text-gray-400 font-sans font-semibold mt-16 px-4 print:hidden">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Dezprox. All rights reserved. Dynamic Service Pricing & Estimation Portal.</p>
          <div className="flex space-x-6">
            <span className="hover:text-dezprox-primary transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-dezprox-primary transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-dezprox-primary transition-colors cursor-pointer">Platform Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
