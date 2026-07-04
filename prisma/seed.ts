import dotenv from "dotenv";
dotenv.config();

import prisma from "../lib/db/prisma";
import { UserRole, BookingStatus, AvailabilityStatus } from "@prisma/client";

async function main() {
  console.log("Seeding database...");

  // 1. Clean up existing data to avoid conflicts
  console.log("Cleaning up existing tables...");
  await prisma.forumReply.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.bookingRequest.deleteMany();
  await prisma.backgroundEntry.deleteMany();
  await prisma.mentorProfile.deleteMany();
  await prisma.userProfile.deleteMany();

  // 2. Create Student User Profiles
  console.log("Creating students...");
  const studentsData = [
    {
      authUserId: "auth-student-1-uuid",
      name: "Alex Johnson",
      email: "student1@alumentor.com",
      role: UserRole.STUDENT,
      major: "Computer Science",
      yearOfStudy: "3rd Year",
      bio: "Aspiring software engineer passionate about web development, distributed systems, and open source contributions.",
      skills: ["React", "TypeScript", "Node.js", "Python"],
      linkedinUrl: "https://linkedin.com",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    },
    {
      authUserId: "auth-student-2-uuid",
      name: "Emily Davis",
      email: "student2@alumentor.com",
      role: UserRole.STUDENT,
      major: "Electrical Engineering",
      yearOfStudy: "4th Year",
      bio: "Focusing on embedded systems and IoT device design. Excited to connect with industry experts.",
      skills: ["C++", "Arduino", "Matlab", "IoT"],
      linkedinUrl: "https://linkedin.com",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    },
    {
      authUserId: "auth-student-3-uuid",
      name: "Marcus Aurelius",
      email: "student3@alumentor.com",
      role: UserRole.STUDENT,
      major: "Mechanical Engineering",
      yearOfStudy: "2nd Year",
      bio: "Design enthusiast curious about fluid dynamics and robotics.",
      skills: ["SolidWorks", "CAD", "Python"],
      linkedinUrl: "https://linkedin.com",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
    {
      authUserId: "auth-student-4-uuid",
      name: "Sophia Martinez",
      email: "student4@alumentor.com",
      role: UserRole.STUDENT,
      major: "Data Science",
      yearOfStudy: "3rd Year",
      bio: "Building data pipelines and machine learning models to solve business challenges.",
      skills: ["SQL", "Pandas", "Scikit-Learn", "R"],
      linkedinUrl: "https://linkedin.com",
      imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    },
    {
      authUserId: "auth-student-5-uuid",
      name: "Jordan Lee",
      email: "student5@alumentor.com",
      role: UserRole.STUDENT,
      major: "Bioinformatics",
      yearOfStudy: "4th Year",
      bio: "Interested in the intersection of biology and computational research.",
      skills: ["Python", "BioPython", "R", "Git"],
      linkedinUrl: "https://linkedin.com",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    },
  ];

  const students = [];
  for (const item of studentsData) {
    const s = await prisma.userProfile.create({ data: item });
    students.push(s);
  }

  // 3. Create Mentor Profiles
  console.log("Creating mentors...");
  const mentorsData = [
    {
      user: {
        authUserId: "auth-mentor-1-uuid",
        name: "Dr. Aris Thorne",
        email: "mentor1@alumentor.com",
        role: UserRole.MENTOR,
        major: "Computer Science Alumni",
        bio: "Principal Engineer at TechCorp. Over 10 years of experience in distributed backend architectures and cloud systems.",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      },
      mentor: {
        domain: "Software Engineering & Cloud Architectures",
        experienceYears: 12,
        headline: "Principal Engineer at TechCorp | Ex-Google Tech Lead",
        bio: "I guide students who want to build high-performance systems and succeed in competitive tech interviews.",
        institution: "TechCorp",
        skills: ["System Design", "Cloud Infrastructure", "Golang", "Kubernetes"],
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        availabilityNote: "Available on Friday afternoons for chat.",
        isFeatured: true,
      },
      backgrounds: [
        {
          title: "Principal Software Engineer",
          institution: "TechCorp",
          startYear: "2021",
          endYear: "Present",
          description: "Designing reliable cloud scale microservices and leading infrastructure projects.",
        },
        {
          title: "Senior Tech Lead",
          institution: "Google",
          startYear: "2017",
          endYear: "2021",
          description: "Architected systems in Google Cloud and mentored junior engineers.",
        },
      ],
    },
    {
      user: {
        authUserId: "auth-mentor-2-uuid",
        name: "Elena Rostova",
        email: "mentor2@alumentor.com",
        role: UserRole.MENTOR,
        major: "Electrical Engineering Alumni",
        bio: "Embedded Systems Lead at Robotics Labs. Alumna specialized in robotics, control loops, and micro-controllers.",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      },
      mentor: {
        domain: "Embedded Systems & Robotics",
        experienceYears: 8,
        headline: "Robotics Hardware Lead | IoT Architect",
        bio: "Helping students transition from academic theories to physical robotics hardware and firmware implementations.",
        institution: "Robotics Labs",
        skills: ["C", "RTOS", "PCB Design", "Embedded C++"],
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        availabilityNote: "Weekday evenings work best.",
        isFeatured: true,
      },
      backgrounds: [
        {
          title: "Hardware Robotics Lead",
          institution: "Robotics Labs",
          startYear: "2020",
          endYear: "Present",
          description: "Managing firmware and hardware design for industrial robotics pipelines.",
        },
      ],
    },
    {
      user: {
        authUserId: "auth-mentor-3-uuid",
        name: "David Chen",
        email: "mentor3@alumentor.com",
        role: UserRole.MENTOR,
        major: "Data Science Alumni",
        bio: "Senior Data Scientist at FinTech Group. Expert in financial predictive modeling and AI products.",
        imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
      },
      mentor: {
        domain: "Machine Learning & Big Data analytics",
        experienceYears: 7,
        headline: "Senior Data Scientist at FinTech Group | AI Consultant",
        bio: "I mentor students interested in quantitative research, model deployment pipelines, and financial analysis tools.",
        institution: "FinTech Group",
        skills: ["PyTorch", "Spark", "Data Engineering", "TensorFlow"],
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        availabilityNote: "Open to 1:1 sessions on weekends.",
        isFeatured: true,
      },
      backgrounds: [
        {
          title: "Senior Data Scientist",
          institution: "FinTech Group",
          startYear: "2022",
          endYear: "Present",
          description: "Building machine learning risk evaluation models.",
        },
      ],
    },
    {
      user: {
        authUserId: "auth-mentor-4-uuid",
        name: "Sarah Jenkins",
        email: "mentor4@alumentor.com",
        role: UserRole.MENTOR,
        major: "Mechanical Engineering Alumni",
        bio: "Aerospace Design Lead at Orbital Flight. Focus on aerodynamics, stress tests, and hardware prototype design.",
        imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
      },
      mentor: {
        domain: "Aerospace & Automotive Engineering",
        experienceYears: 10,
        headline: "Aerospace Structural Lead | CAD Mentor",
        bio: "Experienced in mechanical design workflows and structure validations. Ready to review student projects.",
        institution: "Orbital Flight",
        skills: ["Aerodynamics", "FEA Analysis", "Ansys", "SolidWorks"],
        availabilityStatus: AvailabilityStatus.LIMITED,
        availabilityNote: "Currently accepting limited requests.",
        isFeatured: false,
      },
      backgrounds: [
        {
          title: "Structural Lead",
          institution: "Orbital Flight",
          startYear: "2019",
          endYear: "Present",
          description: "Reviewing aerodynamics models and thermal tests.",
        },
      ],
    },
    {
      user: {
        authUserId: "auth-mentor-5-uuid",
        name: "Dr. Karen Vance",
        email: "mentor5@alumentor.com",
        role: UserRole.MENTOR,
        major: "Bioinformatics Alumni",
        bio: "Researcher at Genetics Institute. Specialized in genomic sequences, database mining, and software for clinics.",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      },
      mentor: {
        domain: "Genomics & Bio-Computation",
        experienceYears: 15,
        headline: "Principal Genetics Researcher | Biotech Advisor",
        bio: "I guide students on research papers, biology data modeling, and academic paper submissions.",
        institution: "Genetics Institute",
        skills: ["R Programming", "Sequence Analysis", "Perl", "NextFlow"],
        availabilityStatus: AvailabilityStatus.UNAVAILABLE,
        availabilityNote: "Not currently booking new requests.",
        isFeatured: false,
      },
      backgrounds: [
        {
          title: "Principal Researcher",
          institution: "Genetics Institute",
          startYear: "2015",
          endYear: "Present",
          description: "Leading genetic sequencing tool development and clinical database validations.",
        },
      ],
    },
  ];

  const mentors = [];
  for (const item of mentorsData) {
    const userProfile = await prisma.userProfile.create({ data: item.user });
    const mentorProfile = await prisma.mentorProfile.create({
      data: {
        ...item.mentor,
        userId: userProfile.id,
      },
    });

    for (const bg of item.backgrounds) {
      await prisma.backgroundEntry.create({
        data: {
          ...bg,
          mentorProfileId: mentorProfile.id,
        },
      });
    }

    mentors.push(mentorProfile);
  }

  // 4. Create Booking Requests
  console.log("Creating booking requests...");
  const bookingsData = [
    {
      studentId: students[0].id,
      mentorId: mentors[0].id,
      topic: "System Design Prep Advice",
      message: "Hi Dr. Thorne, I would love to get your advice on structural layout questions and distributed systems interview topics.",
      status: BookingStatus.PENDING,
      preferredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
    },
    {
      studentId: students[1].id,
      mentorId: mentors[1].id,
      topic: "PCB Validation Review",
      message: "Hi Elena, I've got a personal PCB layout design and want to ask if we could do a brief review session.",
      status: BookingStatus.ACCEPTED,
      preferredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
      responseNote: "Sure, let's schedule a video call. Please share your project details ahead of time.",
    },
    {
      studentId: students[2].id,
      mentorId: mentors[2].id,
      topic: "Predictive AI Research Guidance",
      message: "Hello David, I have a quantitative project using PyTorch and wanted to inquire about standard feature scaling practices.",
      status: BookingStatus.REJECTED,
      preferredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
      responseNote: "Sorry, I am out of office this week. Please check back next week.",
    },
    {
      studentId: students[3].id,
      mentorId: mentors[0].id,
      topic: "Mock Coding Interview",
      message: "Hi Dr. Thorne, I have a Google software engineer interview coming up next month and want to practice coding questions.",
      status: BookingStatus.COMPLETED,
      preferredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
      responseNote: "Great practice session! Keep refining your array partition answers.",
    },
    {
      studentId: students[4].id,
      mentorId: mentors[3].id,
      topic: "Aerodynamic Simulation Help",
      message: "Hello structural lead Sarah, I'm facing simulation convergence errors in Ansys and would appreciate a quick pointer.",
      status: BookingStatus.PENDING,
      preferredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
    },
  ];

  for (const b of bookingsData) {
    await prisma.bookingRequest.create({ data: b });
  }

  // 5. Create Forum Posts
  console.log("Creating forum posts...");
  const postsData = [
    {
      authorId: students[0].id,
      title: "How to prepare for System Design interviews in 3 months?",
      content: "I am a 3rd year CS student and finding system design topics like load balancers, caching, and database partitioning a bit overwhelming. What books, videos, or papers do you recommend starting with?",
      tag: "Career Advice, Software Engineering",
      isPinned: true,
      isLocked: false,
    },
    {
      authorId: students[1].id,
      title: "RTOS vs Bare Metal for high-performance IoT devices?",
      content: "I'm developing a low-latency sensor logging hub. Bare metal loop seems simple, but I might need to run async tasks. At what point does implementing FreeRTOS become worthwhile?",
      tag: "Embedded Systems, Hardware",
      isPinned: false,
      isLocked: false,
    },
    {
      authorId: students[3].id,
      title: "Is PyTorch preferred over TensorFlow in quantitative research nowadays?",
      content: "I'm starting a quantitative finance prediction research project. Most papers seem to use PyTorch, but some companies still request TensorFlow. Which framework should I focus on?",
      tag: "Machine Learning, Finance",
      isPinned: false,
      isLocked: false,
    },
    {
      authorId: students[2].id,
      title: "AluMentor Platform Launch Discussion!",
      content: "Welcome to the official AluMentor alumni portal. Connect with graduates, share advice, book mentorship sessions, and contribute to standard student-grad chats.",
      tag: "General, AluMentor",
      isPinned: true,
      isLocked: true,
    },
    {
      authorId: students[4].id,
      title: "Best tools for genomic sequence assembly in 2026?",
      content: "I am building a NextFlow pipeline to assemble raw genetic read databases. Are there any recommendations for fast alignment tools?",
      tag: "Bioinformatics, Research",
      isPinned: false,
      isLocked: false,
    },
  ];

  const posts = [];
  for (const p of postsData) {
    const post = await prisma.forumPost.create({ data: p });
    posts.push(post);
  }

  // 6. Create Forum Replies
  console.log("Creating forum replies...");
  const repliesData = [
    {
      postId: posts[0].id,
      authorId: students[1].id,
      content: "I recommend checking out Alex Xu's System Design Interview book! It explains basic blocks very well.",
    },
    {
      postId: posts[0].id,
      authorId: students[2].id,
      content: "Totally agree, Alex Xu is excellent. Also watch YouTube mock design interviews to learn how engineers talk about tradeoffs.",
    },
    {
      postId: posts[1].id,
      authorId: students[3].id,
      content: "RTOS becomes super useful once you need concurrency, semaphores, or if you're using Wi-Fi / Bluetooth stacks concurrently.",
    },
    {
      postId: posts[2].id,
      authorId: students[0].id,
      content: "Yes, PyTorch has definitely won the research world. It is highly pythonic and very easy to debug.",
    },
    {
      postId: posts[3].id,
      authorId: students[4].id,
      content: "So excited to connect with everyone here! Thanks for building AluMentor.",
    },
  ];

  for (const r of repliesData) {
    await prisma.forumReply.create({ data: r });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
