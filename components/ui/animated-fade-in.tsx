"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedFadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export default function AnimatedFadeIn({
  children,
  delay = 0,
  duration = 0.35,
  yOffset = 12,
}: AnimatedFadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
