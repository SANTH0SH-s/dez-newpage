import React, { useState, useEffect, useMemo } from "react";
import { getIcon } from "@/data/servicesData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { motion, Variants } from "framer-motion";
import { Service } from "@/lib/types";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 14
    }
  }
};

interface ServiceSelectorProps {
  selectedServiceIds: string[];
  onChange: (selectedIds: string[]) => void;
  onNext: () => void;
}

export const ServiceSelector = ({ selectedServiceIds, onChange, onNext }: ServiceSelectorProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const services = useMemo<Service[]>(() => {
    if (!mounted) return [];
    const raw = localStorage.getItem("dezprox_services");
    if (!raw) return [];
    try {
      return (JSON.parse(raw) as Service[]).filter((s) => s.status === "active");
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

  if (!mounted) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-150 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-xl border border-gray-100 bg-gray-50/50 p-6 space-y-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleToggle = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      onChange(selectedServiceIds.filter((item) => item !== id));
    } else {
      onChange([...selectedServiceIds, id]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-dezprox-primary">
            Select Your Project Services
          </h2>
          <p className="text-dezprox-text/60 font-sans text-sm mt-1">
            Choose all the capabilities you require for this custom project.
          </p>
        </div>
        
        {selectedServiceIds.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-sm font-sans font-semibold text-dezprox-text/40 hover:text-dezprox-primary transition-colors cursor-pointer"
          >
            Clear selection ({selectedServiceIds.length})
          </button>
        )}
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {services.map((service) => {
          const IconComponent = getIcon(service.iconName);
          const isSelected = selectedServiceIds.includes(service.id);

          return (
            <motion.div
              key={service.id}
              variants={cardVariants}
              className="h-full"
            >
              <Card
                hoverable
                selected={isSelected}
                onClick={() => handleToggle(service.id)}
                className="relative overflow-hidden cursor-pointer h-full flex flex-col"
              >
                <div 
                  className={twMerge(
                     "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 z-10",
                     isSelected ? "bg-dezprox-accent" : "bg-transparent"
                  )}
                />

                {service.cardImage && (
                  <div className="w-full h-32 overflow-hidden border-b border-gray-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={service.cardImage} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                )}

                <CardHeader className="flex flex-row items-start space-x-4 p-6 pb-2 relative">
                  <div 
                    className={twMerge(
                      "p-3 rounded-xl transition-all duration-300 shrink-0",
                      isSelected 
                        ? "bg-dezprox-accent/15 text-dezprox-primary" 
                        : "bg-gray-50 text-gray-500 group-hover:bg-gray-100"
                    )}
                  >
                    {service.iconImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={service.iconImage} alt={service.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-6">
                    <CardTitle className="text-lg font-bold font-sans text-dezprox-primary truncate">
                      {service.name}
                    </CardTitle>
                    {service.basePrice > 0 && (
                      <span className="text-xs font-sans text-dezprox-text/50 font-bold block mt-0.5">
                        Starts at {currency}{service.basePrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-dezprox-accent text-dezprox-primary p-1 rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                  )}
                </CardHeader>

                 <CardContent className="p-6 pt-2 font-sans text-sm text-dezprox-text/60 leading-relaxed">
                  {service.description}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-12 flex justify-center md:justify-end border-t border-gray-100 pt-8">
        <Button
          variant={selectedServiceIds.length > 0 ? "accent" : "outline"}
          disabled={selectedServiceIds.length === 0}
          onClick={onNext}
          className="w-full md:w-auto flex items-center justify-center gap-2 group cursor-pointer"
        >
          Continue to Configuration
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};
