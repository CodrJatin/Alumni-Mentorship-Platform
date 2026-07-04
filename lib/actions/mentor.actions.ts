"use server";

import { createClient } from "@/lib/supabase/server";
// Force refresh of TS server typings
import prisma from "@/lib/db/prisma";
import { mentorProfileSchema, MentorProfileInput } from "@/lib/validations/mentor";
import { ZodError } from "zod";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function upsertMentorProfile(data: MentorProfileInput) {
  try {
    const validatedData = mentorProfileSchema.parse(data);
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    // 2. Fetch UserProfile to check role
    const userProfile = await prisma.userProfile.findUnique({
      where: { authUserId: authUser.id },
    });

    if (!userProfile) {
      return { success: false, error: "User profile not found." };
    }

    if (userProfile.role !== UserRole.MENTOR) {
      return { success: false, error: "Access denied. Only mentors can create/edit profiles." };
    }

    // 3. Update UserProfile Name if it changed
    if (userProfile.name !== validatedData.name) {
      await prisma.userProfile.update({
        where: { id: userProfile.id },
        data: { name: validatedData.name },
      });
    }

    // 4. Perform upsert of MentorProfile and replace background entries inside a transaction
    const mentorProfile = await prisma.$transaction(async (tx) => {
      const profile = await tx.mentorProfile.upsert({
        where: { userId: userProfile.id },
        create: {
          userId: userProfile.id,
          domain: validatedData.domain,
          experienceYears: validatedData.experienceYears,
          headline: validatedData.headline,
          bio: validatedData.bio,
          institution: validatedData.institution,
          skills: validatedData.skills,
          availabilityStatus: validatedData.availabilityStatus,
          availabilityNote: validatedData.availabilityNote,
          isActive: true,
        },
        update: {
          domain: validatedData.domain,
          experienceYears: validatedData.experienceYears,
          headline: validatedData.headline,
          bio: validatedData.bio,
          institution: validatedData.institution,
          skills: validatedData.skills,
          availabilityStatus: validatedData.availabilityStatus,
          availabilityNote: validatedData.availabilityNote,
        },
      });

      // Clear existing background entries
      await tx.backgroundEntry.deleteMany({
        where: { mentorProfileId: profile.id },
      });

      // Insert new background entries
      if (validatedData.backgroundEntries && validatedData.backgroundEntries.length > 0) {
        await tx.backgroundEntry.createMany({
          data: validatedData.backgroundEntries.map((entry) => ({
            mentorProfileId: profile.id,
            title: entry.title,
            institution: entry.institution,
            startYear: entry.startYear,
            endYear: entry.endYear,
            description: entry.description,
          })),
        });
      }

      return profile;
    });

    return { success: true, mentorProfileId: mentorProfile.id };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const err = error as Error;
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function uploadAvatarUrlAction(imageUrl: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized." };
    }

    await prisma.userProfile.update({
      where: { authUserId: authUser.id },
      data: { imageUrl },
    });

    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to update profile photo." };
  }
}

export async function toggleMentorActiveStatusAction(mentorProfileId: string) {
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

    const targetMentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorProfileId },
    });

    if (!targetMentor) {
      return { success: false, error: "Mentor profile not found." };
    }

    await prisma.mentorProfile.update({
      where: { id: mentorProfileId },
      data: { isActive: !targetMentor.isActive },
    });

    revalidatePath("/dashboard/mentors");
    revalidatePath("/mentors");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle mentor active status:", error);
    return { success: false, error: "Failed to toggle mentor status." };
  }
}

export async function toggleMentorFeaturedStatusAction(mentorProfileId: string, isFeatured: boolean) {
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

    await prisma.mentorProfile.update({
      where: { id: mentorProfileId },
      data: { isFeatured },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle mentor featured status:", error);
    return { success: false, error: "Failed to toggle featured status." };
  }
}
