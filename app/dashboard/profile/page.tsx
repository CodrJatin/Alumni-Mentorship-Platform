// Force refresh of TS server typings
import prisma from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MentorProfileForm from "@/components/mentors/mentor-profile-form";
import StudentProfileForm from "@/components/dashboard/student-profile-form";
import { UserRole } from "@prisma/client";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const baseProfile = await ensureUserProfile(user);

  if (!baseProfile) {
    redirect("/login");
  }

  // Fetch full profile and mentor relationship details
  const profile = await prisma.userProfile.findUnique({
    where: { id: baseProfile.id },
    include: {
      mentorProfile: {
        include: {
          backgroundEntries: {
            orderBy: {
              startYear: "desc",
            },
          },
        },
      },
    },
  });

  if (!profile) {
    redirect("/login");
  }

  const isMentor = profile.role === UserRole.MENTOR;

  if (isMentor) {
    // Return the full mentor profile editor
    return (
      <MentorProfileForm
        initialData={{
          name: profile.name,
          imageUrl: profile.imageUrl,
          mentorProfile: profile.mentorProfile,
        }}
      />
    );
  }

  // Render the student profile form with database values
  return (
    <StudentProfileForm
      initialData={{
        name: profile.name,
        email: profile.email,
        imageUrl: profile.imageUrl,
        major: profile.major,
        yearOfStudy: profile.yearOfStudy,
        bio: profile.bio,
        skills: profile.skills,
        linkedinUrl: profile.linkedinUrl,
      }}
    />
  );
}
