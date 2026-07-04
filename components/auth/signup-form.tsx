"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "@/lib/validations/auth";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, GraduationCap, Landmark } from "lucide-react";
export default function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
  });

  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const result = await signUpWithEmail(data);
      if (result.success) {
        toast.success("Account created successfully! Welcome to AluMentor.");
        router.refresh();
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Signup failed.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold text-foreground">
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Dr. Jane Doe"
          className="w-full border-border bg-background focus-visible:ring-primary/20"
          disabled={isLoading}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive font-medium">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold text-foreground">
          Institutional Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="user@university.edu"
          className="w-full border-border bg-background focus-visible:ring-primary/20"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Role</Label>
        <div className="grid grid-cols-2 gap-4">
          {/* Student Option Card */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setValue("role", "STUDENT")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-[4px] border text-sm font-semibold transition-all cursor-pointer select-none outline-none ${
              selectedRole === "STUDENT"
                ? "bg-indigo-50 border-[#4f46e5] text-[#4f46e5]"
                : "bg-background border-border text-muted-foreground hover:border-gray-400 hover:text-foreground"
            }`}
          >
            <GraduationCap className="h-5 w-5 flex-shrink-0" />
            Student
          </button>

          {/* Alumni Mentor Option Card */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setValue("role", "MENTOR")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-[4px] border text-sm font-semibold transition-all cursor-pointer select-none outline-none ${
              selectedRole === "MENTOR"
                ? "bg-indigo-50 border-[#4f46e5] text-[#4f46e5]"
                : "bg-background border-border text-muted-foreground hover:border-gray-400 hover:text-foreground"
            }`}
          >
            <Landmark className="h-5 w-5 flex-shrink-0" />
            Alumni Mentor
          </button>
        </div>
        {errors.role && (
          <p className="text-xs text-destructive font-medium">
            {errors.role.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-semibold text-foreground">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full border-border bg-background focus-visible:ring-primary/20"
          disabled={isLoading}
          {...register("password")}
        />
        <span className="block text-xs text-muted-foreground font-medium">
          At least 8 characters
        </span>
        {errors.password && (
          <p className="text-xs text-destructive font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white py-6 text-base font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      <div className="text-center text-sm font-medium text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#4f46e5] hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
}
