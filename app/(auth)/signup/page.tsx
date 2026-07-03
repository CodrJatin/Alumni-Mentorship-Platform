"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SignupForm from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Panel: Quote & Branding (hidden on mobile) */}
      <section className="hidden lg:flex lg:w-1/2 bg-[#f4f6ff] flex-col justify-between p-16 relative overflow-hidden border-r border-border">
        {/* Abstract lines/box geometry in code */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[30%] left-[10%] w-[380px] h-[260px] border border-indigo-200/50 rounded-[8px] -translate-y-6 translate-x-6" />
          <div className="absolute top-[30%] left-[10%] w-[380px] h-[260px] border border-indigo-200/50 rounded-[8px] translate-y-6 -translate-x-6" />
        </div>

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h1 className="text-4xl font-bold tracking-tight text-[#171717]">
            EliteMentorship
          </h1>
          <p className="mt-2 text-base text-muted-foreground font-medium">
            Academic Professionalism Guaranteed.
          </p>
        </motion.div>

        {/* Testimonial Quote */}
        <div className="relative z-10 max-w-md mx-auto my-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-background/80 backdrop-blur-sm border border-indigo-100 rounded-[8px] p-8 shadow-sm relative"
          >
            <blockquote className="text-lg italic font-semibold text-foreground leading-relaxed">
              &quot;The connection between a dedicated mentor and a driven student is the foundation of institutional excellence.&quot;
            </blockquote>
            <cite className="block mt-4 text-sm font-medium text-muted-foreground not-italic">
              — Dean of Academic Affairs
            </cite>
          </motion.div>
        </div>

        {/* Footer info in left panel */}
        <div className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} EliteMentorship. All rights reserved.
        </div>
      </section>

      {/* Right Panel: Signup Form */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto w-full max-w-md"
        >
          {/* Header Tabs */}
          <div className="flex border-b border-border mb-8">
            <Link
              href="/login"
              className="flex-1 text-center pb-3 text-sm font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center pb-3 text-sm font-semibold border-b-2 border-[#4f46e5] text-[#171717]"
            >
              Create Account
            </Link>
          </div>

          {/* Form Header */}
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Join EliteMentorship
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Create your institutional account to start your journey.
            </p>
          </div>

          {/* Form Content */}
          <SignupForm />
        </motion.div>
      </section>
    </main>
  );
}
