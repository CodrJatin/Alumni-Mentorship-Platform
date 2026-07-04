import prisma from "@/lib/db/prisma";
// Force refresh of TS server typings
import { AvailabilityStatus, UserRole, Prisma } from "@prisma/client";

export interface MentorFilters {
  search?: string;
  domain?: string[];
  experienceLevel?: string[]; // "junior", "mid", "senior"
  acceptingMentees?: boolean;
  page?: number;
  limit?: number;
}

export async function getMentorsList(filters: MentorFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const skip = (page - 1) * limit;

  // Build prisma filter conditions
  const whereConditions: Prisma.MentorProfileWhereInput = {
    isActive: true,
    user: {
      role: UserRole.MENTOR,
    },
  };

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.trim();
    whereConditions.OR = [
      {
        user: {
          name: {
            contains: searchLower,
            mode: "insensitive",
          },
        },
      },
      {
        headline: {
          contains: searchLower,
          mode: "insensitive",
        },
      },
      {
        institution: {
          contains: searchLower,
          mode: "insensitive",
        },
      },
      {
        bio: {
          contains: searchLower,
          mode: "insensitive",
        },
      },
      {
        skills: {
          hasSome: [searchLower],
        },
      },
    ];
  }

  // Domain filters
  if (filters.domain && filters.domain.length > 0) {
    whereConditions.domain = {
      in: filters.domain,
    };
  }

  // Experience level filters
  if (filters.experienceLevel && filters.experienceLevel.length > 0) {
    const expConditions: Prisma.MentorProfileWhereInput[] = [];
    filters.experienceLevel.forEach((level) => {
      if (level === "junior") {
        expConditions.push({ experienceYears: { gte: 1, lte: 3 } });
      } else if (level === "mid") {
        expConditions.push({ experienceYears: { gte: 4, lte: 7 } });
      } else if (level === "senior") {
        expConditions.push({ experienceYears: { gte: 8 } });
      }
    });

    if (expConditions.length > 0) {
      if (whereConditions.OR) {
        // If OR condition is already present (e.g. from search), wrap both conditions in an AND block
        const searchOR = whereConditions.OR;
        delete whereConditions.OR;
        whereConditions.AND = [
          { OR: searchOR },
          { OR: expConditions }
        ];
      } else {
        whereConditions.OR = expConditions;
      }
    }
  }

  // Availability filter
  if (filters.acceptingMentees) {
    whereConditions.availabilityStatus = AvailabilityStatus.AVAILABLE;
  }

  // Perform Prisma transactions to get count and records
  try {
    const [total, mentors] = await Promise.all([
      prisma.mentorProfile.count({
        where: whereConditions,
      }),
      prisma.mentorProfile.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              name: true,
              imageUrl: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      success: true,
      total,
      mentors,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Failed to fetch mentors list:", error);
    return {
      success: false,
      total: 0,
      mentors: [],
      page: 1,
      totalPages: 0,
      error: "Could not retrieve mentors list.",
    };
  }
}

export async function getMentorById(mentorId: string) {
  try {
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
            email: true,
          },
        },
        backgroundEntries: {
          orderBy: {
            startYear: "desc",
          },
        },
      },
    });

    return { success: true, mentor };
  } catch (error) {
    console.error(`Failed to fetch mentor with ID ${mentorId}:`, error);
    return { success: false, error: "Could not fetch mentor details." };
  }
}

export async function getMentorByUserId(userId: string) {
  try {
    const mentor = await prisma.mentorProfile.findUnique({
      where: { userId },
      include: {
        backgroundEntries: {
          orderBy: {
            startYear: "desc",
          },
        },
      },
    });

    return { success: true, mentor };
  } catch (error) {
    console.error(`Failed to fetch mentor for user ID ${userId}:`, error);
    return { success: false, error: "Could not fetch mentor profile." };
  }
}

export async function getAllMentorsForAdmin() {
  try {
    const mentors = await prisma.mentorProfile.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            bookingRequests: true,
          },
        },
      },
    });

    return { success: true, mentors };
  } catch (error) {
    console.error("Failed to fetch all mentors for admin:", error);
    return { success: false, error: "Could not retrieve mentors list." };
  }
}

