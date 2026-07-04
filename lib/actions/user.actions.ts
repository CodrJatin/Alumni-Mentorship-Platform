"use server";

import prisma from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { studentProfileSchema, StudentProfileInput } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

export async function updateStudentProfileAction(data: StudentProfileInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    // Validate request data
    const validatedData = studentProfileSchema.parse(data);

    // Update student UserProfile
    await prisma.userProfile.update({
      where: { authUserId: user.id },
      data: {
        name: validatedData.name,
        imageUrl: validatedData.imageUrl || null,
        major: validatedData.major || null,
        yearOfStudy: validatedData.yearOfStudy || null,
        bio: validatedData.bio || null,
        skills: validatedData.skills,
        linkedinUrl: validatedData.linkedinUrl || null,
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function updateUserRoleAction(targetUserId: string, newRole: UserRole) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized." };
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
    if (authUser.email !== adminEmail) {
      return { success: false, error: "Forbidden. Admin access required." };
    }

    // Update target user's role
    await prisma.userProfile.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/mentors");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: "Failed to update user role." };
  }
}

export async function toggleUserActiveStatusAction(targetUserId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized." };
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
    if (authUser.email !== adminEmail) {
      return { success: false, error: "Forbidden. Admin access required." };
    }

    const targetUser = await prisma.userProfile.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    await prisma.userProfile.update({
      where: { id: targetUserId },
      data: { isActive: !targetUser.isActive },
    });

    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/mentors");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle user active status:", error);
    return { success: false, error: "Failed to toggle user status." };
  }
}
