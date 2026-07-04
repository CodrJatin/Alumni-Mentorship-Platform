"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";
import { bookingRequestSchema } from "@/lib/validations/booking";
import { BookingStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createBookingRequestAction(
  mentorId: string,
  formData: { topic: string; message: string; preferredAt?: string | null }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in to request a session." };
    }

    // Retrieve requesting user profile
    const studentProfile = await prisma.userProfile.findUnique({
      where: { authUserId: user.id },
    });

    if (!studentProfile) {
      return { success: false, error: "User profile not found." };
    }

    // Strictly enforce STUDENT role for requesting sessions
    if (studentProfile.role !== UserRole.STUDENT) {
      return { success: false, error: "Only students are authorized to request mentorship sessions." };
    }

    // Validate request data
    const validatedData = bookingRequestSchema.parse(formData);

    // Verify target mentor exists
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      include: { user: true },
    });

    if (!mentorProfile) {
      return { success: false, error: "The target mentor profile was not found." };
    }

    // Ensure they aren't booking with themselves
    if (mentorProfile.user.authUserId === user.id) {
      return { success: false, error: "You cannot request a mentorship session with yourself." };
    }

    // Create the booking request
    const booking = await prisma.bookingRequest.create({
      data: {
        studentId: studentProfile.id,
        mentorId: mentorProfile.id,
        topic: validatedData.topic,
        message: validatedData.message,
        preferredAt: validatedData.preferredAt ? new Date(validatedData.preferredAt) : null,
        status: BookingStatus.PENDING,
      },
    });

    revalidatePath(`/mentors/${mentorId}`);
    revalidatePath("/dashboard/requests");
    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Booking error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function respondToBookingRequestAction(
  bookingId: string,
  status: "ACCEPTED" | "REJECTED",
  responseNote?: string | null
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    // Find mentor profile for current user
    const mentorProfile = await prisma.mentorProfile.findFirst({
      where: { user: { authUserId: user.id } },
    });

    if (!mentorProfile) {
      return { success: false, error: "Only active mentors can respond to requests." };
    }

    // Retrieve request
    const bookingRequest = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
    });

    if (!bookingRequest) {
      return { success: false, error: "Booking request not found." };
    }

    // Verify booking request is for this mentor
    if (bookingRequest.mentorId !== mentorProfile.id) {
      return { success: false, error: "Unauthorized: You are not the mentor for this request." };
    }

    // Update status
    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: {
        status: status === "ACCEPTED" ? BookingStatus.ACCEPTED : BookingStatus.REJECTED,
        responseNote: responseNote || null,
      },
    });

    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred.";
    return { success: false, error: message };
  }
}

export async function cancelBookingRequestAction(bookingId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    const bookingRequest = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: { student: true },
    });

    if (!bookingRequest) {
      return { success: false, error: "Booking request not found." };
    }

    // Verify booking request belongs to this student
    if (bookingRequest.student.authUserId !== user.id) {
      return { success: false, error: "Unauthorized: You did not create this request." };
    }

    // Can only cancel pending requests
    if (bookingRequest.status !== BookingStatus.PENDING) {
      return { success: false, error: "Only pending requests can be cancelled." };
    }

    // Update status to CANCELLED
    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred.";
    return { success: false, error: message };
  }
}

export async function adminUpdateBookingStatusAction(bookingId: string, status: BookingStatus) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
    if (user.email !== adminEmail) {
      return { success: false, error: "Unauthorized: Admin access required." };
    }

    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: { status },
    });

    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred.";
    return { success: false, error: message };
  }
}

export async function adminDeleteBookingRequestAction(bookingId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
    if (user.email !== adminEmail) {
      return { success: false, error: "Unauthorized: Admin access required." };
    }

    await prisma.bookingRequest.delete({
      where: { id: bookingId },
    });

    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred.";
    return { success: false, error: message };
  }
}
