"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Read "next" redirect param or default to dashboard
  const redirectTo = searchParams.get("next") ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmail(data);
      if (result.success) {
        toast.success("Welcome back! Signed in successfully.");
        router.refresh();
        if (data.email === "admin@alumentor.com") {
          router.push("/admin");
        } else {
          router.push(redirectTo);
        }
      } else {
        toast.error(result.error || "Authentication failed.");
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
        {errors.password && (
          <p className="text-xs text-destructive font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            disabled={isLoading}
            {...register("rememberMe")}
          />
          <Label
            htmlFor="rememberMe"
            className="text-sm font-medium text-muted-foreground select-none cursor-pointer"
          >
            Remember me
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-[#4f46e5] hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white py-6 text-base font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
