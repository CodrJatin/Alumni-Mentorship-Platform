import prisma from "@/lib/db/prisma";

export async function getStudentBookings(authUserId: string) {
  return prisma.bookingRequest.findMany({
    where: {
      student: { authUserId },
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          email: true,
          major: true,
          yearOfStudy: true,
          bio: true,
          skills: true,
          linkedinUrl: true,
        },
      },
      mentor: {
        include: {
          user: {
            select: {
              name: true,
              imageUrl: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getMentorBookings(authUserId: string) {
  return prisma.bookingRequest.findMany({
    where: {
      mentor: {
        user: { authUserId },
      },
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          email: true,
          major: true,
          yearOfStudy: true,
          bio: true,
          skills: true,
          linkedinUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAdminBookings() {
  return prisma.bookingRequest.findMany({
    include: {
      student: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          email: true,
          major: true,
          yearOfStudy: true,
          bio: true,
          skills: true,
          linkedinUrl: true,
        },
      },
      mentor: {
        include: {
          user: {
            select: {
              name: true,
              imageUrl: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getBookingDetails(bookingId: string) {
  return prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          email: true,
          role: true,
          major: true,
          yearOfStudy: true,
          bio: true,
          skills: true,
          linkedinUrl: true,
        },
      },
      mentor: {
        include: {
          user: {
            select: {
              name: true,
              imageUrl: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
