import { UserRole, type UserProfile } from "@prisma/client";
import type { User } from "@supabase/supabase-js";
import prisma from "@/lib/db/prisma";

function getUserRole(user: User): UserRole {
  return user.user_metadata?.role === UserRole.MENTOR
    ? UserRole.MENTOR
    : UserRole.STUDENT;
}

function getUserName(user: User): string {
  const metadataName = user.user_metadata?.name;
  if (typeof metadataName === "string" && metadataName.trim().length > 0) {
    return metadataName.trim();
  }

  return user.email?.split("@")[0] || "AluMentor User";
}

export async function ensureUserProfile(user: User): Promise<UserProfile | null> {
  const profileByAuthId = await prisma.userProfile.findUnique({
    where: { authUserId: user.id },
  });

  if (profileByAuthId) {
    return profileByAuthId;
  }

  if (!user.email) {
    return null;
  }

  const profileByEmail = await prisma.userProfile.findUnique({
    where: { email: user.email },
  });

  if (profileByEmail) {
    return prisma.userProfile.update({
      where: { id: profileByEmail.id },
      data: { authUserId: user.id },
    });
  }

  return prisma.userProfile.create({
    data: {
      authUserId: user.id,
      email: user.email,
      name: getUserName(user),
      role: getUserRole(user),
    },
  });
}
