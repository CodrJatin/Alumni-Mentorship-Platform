"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";
import { signupSchema, loginSchema, SignupInput, LoginInput } from "@/lib/validations/auth";
import { ZodError } from "zod";

export async function signUpWithEmail(data: SignupInput) {
  try {
    const validatedData = signupSchema.parse(data);
    const { name, email, password, role } = validatedData;

    const supabase = await createClient();

    // 1. Sign up user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const authUser = authData.user;
    if (!authUser) {
      return { success: false, error: "Authentication failed to initialize." };
    }

    // 2. Create the UserProfile record in PostgreSQL via Prisma
    try {
      await prisma.userProfile.create({
        data: {
          authUserId: authUser.id,
          name,
          email,
          role,
        },
      });
    } catch (dbError) {
      console.error("Database sync error during signup:", dbError);
      
      const err = dbError as { code?: string };
      if (err.code === "P2002") {
        return { success: false, error: "A user profile with this email already exists." };
      }
      return { success: false, error: "Failed to create user profile. Please try again." };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const err = error as Error;
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function signInWithEmail(data: LoginInput) {
  try {
    const validatedData = loginSchema.parse(data);
    const { email, password } = validatedData;

    const supabase = await createClient();

    // Custom check for admin@alumentor.com
    const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
    if (email === adminEmail) {
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      if (password !== adminPassword) {
        return { success: false, error: "Invalid credentials." };
      }

      // Try to sign in to Supabase first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Create user in Supabase Auth on the fly if sign-in fails (e.g. user does not exist yet)
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: "System Admin",
            },
          },
        });

        if (signUpError) {
          return { success: false, error: `Admin initialization failed: ${signUpError.message}` };
        }

        // Try to sign in again after creating
        const retryRes = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (retryRes.error) {
          return { success: false, error: retryRes.error.message };
        }
      }

      return { success: true };
    }

    // Normal sign in via Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const err = error as Error;
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}
