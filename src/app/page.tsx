"use client";

import React, { useState, useEffect } from "react";
import { DezproxLogo } from "@/components/ui/logo";
import { PremiumBackground } from "@/components/ui/premium-background";
import { Hero } from "@/components/estimator/hero";
import { ServiceSelector } from "@/components/estimator/service-selector";
import { DynamicForm } from "@/components/estimator/dynamic-form";
import { PriceSummary } from "@/components/estimator/price-summary";
import { ContactData } from "@/components/estimator/contact-form";
import { SuccessMessage } from "@/components/estimator/success-message";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { ShieldCheck, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { endpoints, prepareEstimatePayload } from "@/lib/api/endpoints";

const FLOW_STEPS = [
  "Choose Services",
  "Configure Options",
  "Review Estimate",
  "Get Proposal"
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, Record<string, unknown>>>({});
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [backendEstimateId, setBackendEstimateId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Project-wide multipliers state
  const [projectModifiers, setProjectModifiers] = useState({
    complexity: "simple",
    urgency: "normal",
    quality: "standard"
  });

  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const [servicesRes, settingsRes, multipliersRes] = await Promise.all([
          endpoints.getPublicServices(),
          endpoints.getPublicSettings(),
          endpoints.getPublicMultipliers()
        ]);

        if (servicesRes.success) {
          localStorage.setItem("dezprox_services", JSON.stringify(servicesRes.data));
        }
        if (settingsRes.success) {
          localStorage.setItem("dezprox_settings", JSON.stringify(settingsRes.data));
        }
        if (multipliersRes.success) {
          const mults = multipliersRes.data;
          localStorage.setItem("dezprox_multipliers", JSON.stringify(mults));
        }
      } catch (err) {
        console.error("Failed to sync backend config to local storage:", err);
      } finally {
        setSynced(true);
      }
    };

    syncWithBackend();
  }, []);

  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (selectedServiceIds.length === 0) {
      const t = setTimeout(() => {
        setCalculationResult(null);
      }, 0);
      return () => clearTimeout(t);
    }

    setIsCalculating(true);
    const timer = setTimeout(async () => {
      try {
        const payload = prepareEstimatePayload(selectedServiceIds, answers, projectModifiers);
        const res = await endpoints.calculateEstimate(payload);
        if (res.success) {
          setCalculationResult(res.data);
        }
      } catch (err) {
        console.error("Calculation failed:", err);
      } finally {
        setIsCalculating(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedServiceIds, answers, projectModifiers]);

  const handleAnswerChange = (serviceId: string, questionId: string, value: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || {}),
        [questionId]: value
      }
    }));
    setBackendEstimateId(null);
  };

  const handleStart = () => setCurrentStep(1);
  const handleNextFromSelector = () => setCurrentStep(2);
  const handleNextFromForm = () => setCurrentStep(3);
  const handleNextFromSummary = () => setCurrentStep(4);

  const handleBackToSelector = () => setCurrentStep(1);
  const handleBackToForm = () => setCurrentStep(2);

  const handleReset = () => {
    setSelectedServiceIds([]);
    setAnswers({});
    setContactData(null);
    setProjectModifiers({
      complexity: "simple",
      urgency: "normal",
      quality: "standard"
    });
    setBackendEstimateId(null);
    setCurrentStep(0);
  };

  const stepperIndex = currentStep > 0 ? currentStep - 1 : -1;

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      {/* Premium Animated SaaS-Style Background */}
      <PremiumBackground currentStep={currentStep} />

      {/* Premium Header */}
      <header className={`border-b border-gray-100 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 print:hidden relative transition-opacity duration-200 ${isModalOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <DezproxLogo showTagline={true} />

          <div className="flex items-center space-x-6 text-sm font-sans font-bold text-gray-500">
            <span className="hidden md:inline-flex items-center gap-1.5 hover:text-dezprox-primary transition-colors cursor-pointer">
              <ShieldCheck className="w-4 h-4 text-dezprox-accent" />
              Secure Data Guarantee
            </span>
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1.5 text-dezprox-primary hover:text-dezprox-accent transition-colors border border-gray-200 hover:border-dezprox-accent/20 bg-white/50 hover:bg-dezprox-accent/5 px-4 py-2 rounded-full text-xs transition-all shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-dezprox-accent" />
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Flow Orchestrator */}
      <main className="flex-1 w-full flex flex-col items-center relative z-10">
        {/* Stepper container (Shown when not on Hero or Success Page) */}
        {currentStep > 0 && currentStep < 4 && (
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
                  onChange={(ids) => {
                    setSelectedServiceIds(ids);
                    setBackendEstimateId(null);
                  }}
                  onNext={handleNextFromSelector}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start px-4"
              >
                {/* Form Questionnaire (Left Column) */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DynamicForm
                      selectedServiceIds={selectedServiceIds}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      onBack={handleBackToSelector}
                      onNext={handleNextFromForm}
                    />
                  </motion.div>
                </div>

                {/* Live Sidebar Calculator Widget (Right Column) */}
                <div className="lg:col-span-1 py-8 hidden lg:block sticky top-24 self-start">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PriceSummary
                      selectedServiceIds={selectedServiceIds}
                      answers={answers}
                      sidebarMode={true}
                      projectModifiers={projectModifiers}
                      calculationResult={calculationResult}
                    />
                  </motion.div>
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
                  projectModifiers={projectModifiers}
                  contactData={contactData}
                  onContactSave={(data) => setContactData(data)}
                  calculationResult={calculationResult}
                />
              </motion.div>
            )}

             {currentStep === 4 && (
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
                  onBack={() => setCurrentStep(3)}
                  projectModifiers={projectModifiers}
                  onContactSave={(data) => setContactData(data)}
                  onModalStateChange={(isOpen) => setIsModalOpen(isOpen)}
                  calculationResult={calculationResult}
                  backendEstimateId={backendEstimateId}
                  setBackendEstimateId={setBackendEstimateId}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {currentStep > 0 && currentStep < 4 && (
          <div className="lg:hidden print:hidden">
            <PriceSummary
              selectedServiceIds={selectedServiceIds}
              answers={answers}
              sidebarMode={true}
              projectModifiers={projectModifiers}
              isMobileSheet={true}
              calculationResult={calculationResult}
            />
          </div>
        )}
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
