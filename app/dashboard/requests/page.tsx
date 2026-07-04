import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { getStudentBookings, getMentorBookings } from "@/lib/data/bookings";
import RequestsList from "@/components/dashboard/requests-list";
import { UserRole, BookingStatus } from "@prisma/client";

interface DBBookingRow {
  id: string;
  topic: string;
  message: string;
  preferredAt: Date | null;
  status: BookingStatus;
  responseNote: string | null;
  createdAt: Date;
  student: {
    id: string;
    name: string;
    imageUrl: string | null;
    email: string;
    major: string | null;
    yearOfStudy: string | null;
    bio: string | null;
    skills: string[];
    linkedinUrl: string | null;
  };
  mentor?: {
    id: string;
    user: {
      name: string;
      imageUrl: string | null;
      email: string;
    };
  } | null;
}

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
  if (user.email === adminEmail) {
    redirect("/admin");
  }

  // Retrieve user role
  const profile = await prisma.userProfile.findUnique({
    where: { authUserId: user.id },
  });

  if (!profile) {
    redirect("/login");
  }

  let bookings: DBBookingRow[] = [];

  if (profile.role === UserRole.STUDENT) {
    bookings = (await getStudentBookings(user.id)) as unknown as DBBookingRow[];
  } else if (profile.role === UserRole.MENTOR) {
    bookings = (await getMentorBookings(user.id)) as unknown as DBBookingRow[];
  }

  // Typecast or map items to match RequestsListProps.bookings structure
  const mappedBookings = bookings.map((booking) => ({
    id: booking.id,
    topic: booking.topic,
    message: booking.message,
    preferredAt: booking.preferredAt,
    status: booking.status,
    responseNote: booking.responseNote,
    createdAt: booking.createdAt,
    student: {
      id: booking.student.id,
      name: booking.student.name,
      imageUrl: booking.student.imageUrl,
      email: booking.student.email,
      major: booking.student.major,
      yearOfStudy: booking.student.yearOfStudy,
      bio: booking.student.bio,
      skills: booking.student.skills,
      linkedinUrl: booking.student.linkedinUrl,
    },
    ...(booking.mentor
      ? {
          mentor: {
            id: booking.mentor.id,
            user: {
              name: booking.mentor.user.name,
              imageUrl: booking.mentor.user.imageUrl,
              email: booking.mentor.user.email,
            },
          },
        }
      : {}),
  }));

  return <RequestsList bookings={mappedBookings} role={profile.role} />;
}
