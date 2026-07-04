import prisma from "@/lib/db/prisma";

export async function getAllUsersForAdmin() {
  try {
    const users = await prisma.userProfile.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            forumPosts: true,
            forumReplies: true,
            bookingRequests: true,
          },
        },
        mentorProfile: {
          select: {
            id: true,
            domain: true,
            isActive: true,
            _count: {
              select: {
                bookingRequests: true,
              },
            },
          },
        },
      },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Failed to fetch all users for admin:", error);
    return { success: false, error: "Could not retrieve users list." };
  }
}
