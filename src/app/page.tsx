"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Background Canvas particle animation (re-runs/resizes on step transitions)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const particleCount = 60;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
      });
    }

    // Mouse movement interaction coordinates
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Render and connect dots
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary checks
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(63, 167, 64, 0.25)"; // Dezprox accent green shade
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(63, 167, 64, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Connect with mouse cursor
        if (mouse.x > -500) {
          const distToMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (distToMouse < 160) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(23, 26, 53, ${0.08 * (1 - distToMouse / 160)})`; // Primary color shade
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [currentStep]);

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
      {/* Interactive canvas animation */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-75"
      />

      {/* Premium Header */}
      <header className="border-b border-gray-100 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 print:hidden relative">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* SVG Logo representing Dezprox */}
            <div className="w-10 h-10 bg-dezprox-primary rounded-full flex items-center justify-center font-sans font-extrabold text-white text-base tracking-tighter">
              Dpx
            </div>
            <span className="font-sans font-bold text-xl text-dezprox-primary tracking-tight">
              DEZPROX
            </span>
          </div>

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
