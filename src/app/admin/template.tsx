"use client";

import { motion } from "framer-motion";

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] // Custom spring-like easing for super smooth feel
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
