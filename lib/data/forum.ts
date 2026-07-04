import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function getForumPosts(search?: string, timeFilter?: string) {
  const where: Prisma.ForumPostWhereInput = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  if (timeFilter && timeFilter !== "ALL") {
    const now = new Date();
    if (timeFilter === "24H") {
      where.createdAt = { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
    } else if (timeFilter === "7D") {
      where.createdAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (timeFilter === "30D") {
      where.createdAt = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }
  }

  return prisma.forumPost.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          role: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
  });
}

export async function getForumPostById(postId: string) {
  return prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          role: true,
          bio: true,
          mentorProfile: {
            select: {
              id: true,
              headline: true,
            },
          },
        },
      },
      replies: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function getRelatedPosts(postId: string, tagsCsv: string | null) {
  if (!tagsCsv) return [];
  const tags = tagsCsv.split(",").map((t) => t.trim()).filter(Boolean);
  if (tags.length === 0) return [];

  return prisma.forumPost.findMany({
    where: {
      id: { not: postId },
      OR: tags.map((tag) => ({
        tag: { contains: tag, mode: "insensitive" },
      })),
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUserCreatedPosts(userId: string) {
  return prisma.forumPost.findMany({
    where: { authorId: userId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          role: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUserSavedPosts(userId: string) {
  const saved = await prisma.savedPost.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              role: true,
            },
          },
          _count: {
            select: { replies: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return saved.map((s) => s.post);
}

export async function isPostSavedByUser(postId: string, userId: string) {
  const count = await prisma.savedPost.count({
    where: { postId, userId },
  });
  return count > 0;
}

export async function getAllForumPostsForAdmin() {
  return prisma.forumPost.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
