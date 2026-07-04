"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentProfileSchema, StudentProfileInput } from "@/lib/validations/user";
import { updateStudentProfileAction } from "@/lib/actions/user.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface StudentProfileFormProps {
  initialData: {
    name: string;
    email: string;
    imageUrl: string | null;
    major: string | null;
    yearOfStudy: string | null;
    bio: string | null;
    skills: string[];
    linkedinUrl: string | null;
  };
}

export default function StudentProfileForm({ initialData }: StudentProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Skills state management
  const [skills, setSkills] = useState<string[]>(initialData.skills || []);
  const [newSkill, setNewSkill] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StudentProfileInput>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: initialData.name,
      imageUrl: initialData.imageUrl || "",
      major: initialData.major || "",
      yearOfStudy: initialData.yearOfStudy || "",
      bio: initialData.bio || "",
      skills: initialData.skills || [],
      linkedinUrl: initialData.linkedinUrl || "",
    },
  });

  const avatarUrl = useWatch({ control, name: "imageUrl" });

  const onSubmit = async (data: StudentProfileInput) => {
    setIsSubmitting(true);
    try {
      const response = await updateStudentProfileAction({
        ...data,
        skills,
      });

      if (response.success) {
        toast.success("Profile updated successfully!");
        router.refresh();
      } else {
        toast.error(response.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSkill = newSkill.trim();
    if (!cleanSkill) return;

    if (skills.includes(cleanSkill)) {
      toast.error("Skill already added.");
      return;
    }

    setSkills([...skills, cleanSkill]);
    setNewSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Edit Profile</h1>
        <p className="text-sm text-[#64748B] mt-1 font-medium">
          Manage your student account settings and public details.
        </p>
      </div>

      <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#0F172A]">Personal Details</CardTitle>
          <CardDescription className="text-xs text-[#64748B] font-medium">
            Your primary avatar and display details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Avatar URL Input */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <Avatar className="h-20 w-20 border border-[#E2E8F0] rounded-full flex-shrink-0">
              <AvatarImage src={avatarUrl || ""} alt="Student Avatar" />
              <AvatarFallback className="bg-indigo-50 text-indigo-700 text-2xl font-bold rounded-full">
                {initialData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5 flex-1 w-full">
              <Label htmlFor="imageUrl" className="text-sm font-semibold text-[#0F172A]">
                Profile Picture URL
              </Label>
              <Input
                id="imageUrl"
                placeholder="Paste an image URL (e.g., https://images.unsplash.com/...)"
                {...register("imageUrl")}
                className="border-[#E2E8F0] rounded-[4px] focus-visible:ring-1 focus-visible:ring-[#4f46e5] focus-visible:border-[#4f46e5]"
              />
              <span className="block text-[10px] text-slate-400 font-medium leading-normal pt-0.5">
                Provide a direct link to an image. Real-time preview will display on the left.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-semibold text-[#0F172A]">
                Full Name
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="border-[#E2E8F0] rounded-[4px] focus-visible:ring-1 focus-visible:ring-[#4f46e5] focus-visible:border-[#4f46e5]"
              />
              {errors.name && (
                <p className="text-xs text-red-600 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-semibold text-[#64748B]">
                Institutional Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={initialData.email}
                disabled
                className="border-[#E2E8F0] rounded-[4px] bg-slate-50 text-[#64748B] cursor-not-allowed"
              />
              <span className="block text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">
                Managed by your university and cannot be changed.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#0F172A]">Academic & Professional Profile</CardTitle>
          <CardDescription className="text-xs text-[#64748B] font-medium">
            Academic records and career networking links.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Major */}
            <div className="space-y-1">
              <Label htmlFor="major" className="text-sm font-semibold text-[#0F172A]">
                Field of Study / Major
              </Label>
              <Input
                id="major"
                placeholder="e.g. Computer Science & Engineering"
                {...register("major")}
                className="border-[#E2E8F0] rounded-[4px]"
              />
              {errors.major && (
                <p className="text-xs text-red-600 font-medium">{errors.major.message}</p>
              )}
            </div>

            {/* Year of Study */}
            <div className="space-y-1">
              <Label htmlFor="yearOfStudy" className="text-sm font-semibold text-[#0F172A]">
                Year of Study
              </Label>
              <select
                id="yearOfStudy"
                {...register("yearOfStudy")}
                className="w-full h-10 border border-[#E2E8F0] rounded-[4px] text-sm text-[#0F172A] px-3 bg-white focus:outline-none focus:border-[#4f46e5]"
              >
                <option value="">Select current year</option>
                <option value="1st Year">1st Year / Freshman</option>
                <option value="2nd Year">2nd Year / Sophomore</option>
                <option value="3rd Year">3rd Year / Junior</option>
                <option value="4th Year">4th Year / Senior</option>
                <option value="Graduate Student">Graduate Student</option>
              </select>
            </div>
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-1">
            <Label htmlFor="linkedinUrl" className="text-sm font-semibold text-[#0F172A]">
              LinkedIn Profile Link
            </Label>
            <Input
              id="linkedinUrl"
              placeholder="e.g. https://linkedin.com/in/username"
              {...register("linkedinUrl")}
              className="border-[#E2E8F0] rounded-[4px]"
            />
            {errors.linkedinUrl && (
              <p className="text-xs text-red-600 font-medium">{errors.linkedinUrl.message}</p>
            )}
          </div>

          {/* Biography */}
          <div className="space-y-1">
            <Label htmlFor="bio" className="text-sm font-semibold text-[#0F172A]">
              Biography
            </Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Tell mentors a bit about yourself, your career goals, and what help you are looking for..."
              {...register("bio")}
              className="border-[#E2E8F0] rounded-[4px] resize-none"
            />
            {errors.bio && (
              <p className="text-xs text-red-600 font-medium">{errors.bio.message}</p>
            )}
          </div>

          {/* Skills pills input */}
          <div className="space-y-2 pt-1">
            <Label className="text-sm font-semibold text-[#0F172A]">
              Areas of Interest & Skills
            </Label>
            
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Web Development, UI/UX Design, Finance, Machine Learning"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(e);
                  }
                }}
                className="border-[#E2E8F0] rounded-[4px]"
              />
              <Button
                type="button"
                onClick={addSkill}
                className="bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] font-semibold rounded-[4px] px-4"
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1.5">
              {skills.length === 0 ? (
                <p className="text-xs text-[#64748B] font-medium italic">
                  No skills added yet. Add skills to stand out to mentors.
                </p>
              ) : (
                skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold text-xs px-2.5 py-1 flex items-center gap-1.5 rounded-full border-0"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-[#64748B] hover:text-red-600 focus:outline-none p-0 bg-transparent border-0 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-xs rounded-[4px] px-4 py-2 min-w-[120px] h-auto cursor-pointer border-0"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
