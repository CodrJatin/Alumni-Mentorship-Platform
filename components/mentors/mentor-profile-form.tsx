"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mentorProfileSchema, MentorProfileInput, BackgroundEntryInput } from "@/lib/validations/mentor";
import { upsertMentorProfile, uploadAvatarUrlAction } from "@/lib/actions/mentor.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, X, GraduationCap, Building2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MentorProfileFormProps {
  initialData: {
    name: string;
    imageUrl: string | null;
    mentorProfile: {
      id: string;
      headline: string;
      institution: string | null;
      domain: string;
      skills: string[];
      bio: string;
      availabilityStatus: "AVAILABLE" | "LIMITED" | "UNAVAILABLE";
      availabilityNote: string | null;
      backgroundEntries: {
        id?: string;
        title: string;
        institution: string;
        startYear: string;
        endYear: string;
        description: string | null;
      }[];
    } | null;
  };
}

export default function MentorProfileForm({ initialData }: MentorProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imageUrlValue, setImageUrlValue] = useState(initialData.imageUrl || "");
  
  // Background entries dialog state
  const [bgDialogOpen, setBgDialogOpen] = useState(false);
  const [bgTitle, setBgTitle] = useState("");
  const [bgInstitution, setBgInstitution] = useState("");
  const [bgStartYear, setBgStartYear] = useState("");
  const [bgEndYear, setBgEndYear] = useState("");
  const [bgDescription, setBgDescription] = useState("");
  const [bgErrors, setBgErrors] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<MentorProfileInput>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      headline: initialData.mentorProfile?.headline || "",
      institution: initialData.mentorProfile?.institution || "",
      domain: initialData.mentorProfile?.domain || "Engineering",
      experienceYears: 5, // Default or mock fallback
      bio: initialData.mentorProfile?.bio || "",
      skills: initialData.mentorProfile?.skills || [],
      availabilityStatus: initialData.mentorProfile?.availabilityStatus || "AVAILABLE",
      availabilityNote: initialData.mentorProfile?.availabilityNote || "",
      backgroundEntries: initialData.mentorProfile?.backgroundEntries.map(e => ({
        title: e.title,
        institution: e.institution,
        startYear: e.startYear,
        endYear: e.endYear,
        description: e.description,
      })) || [],
    },
  });

  const skills = useWatch({ control, name: "skills" }) || [];
  const backgroundEntries = useWatch({ control, name: "backgroundEntries" }) || [];

  // Add tag handler
  const handleAddTag = (e: React.MouseEvent | React.KeyboardEvent | React.FormEvent) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !skills.includes(tag)) {
      setValue("skills", [...skills, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue("skills", skills.filter((s) => s !== tagToRemove));
  };

  // Add background entry handler
  const handleAddBgEntry = (e: React.MouseEvent) => {
    e.preventDefault();
    setBgErrors(null);

    // Simple validation
    if (!bgTitle.trim() || !bgInstitution.trim() || !bgStartYear.trim() || !bgEndYear.trim()) {
      setBgErrors("Title, Institution, and Years are required.");
      return;
    }

    if (!/^\d{4}$/.test(bgStartYear) || (bgEndYear !== "Present" && !/^\d{4}$/.test(bgEndYear))) {
      setBgErrors("Years must be 4 digits or 'Present'.");
      return;
    }

    const newEntry: BackgroundEntryInput = {
      title: bgTitle.trim(),
      institution: bgInstitution.trim(),
      startYear: bgStartYear.trim(),
      endYear: bgEndYear.trim(),
      description: bgDescription.trim() || null,
    };

    setValue("backgroundEntries", [...backgroundEntries, newEntry]);
    
    // Reset fields
    setBgTitle("");
    setBgInstitution("");
    setBgStartYear("");
    setBgEndYear("");
    setBgDescription("");
    setBgDialogOpen(false);
  };

  const handleRemoveBgEntry = (indexToRemove: number) => {
    setValue("backgroundEntries", backgroundEntries.filter((_, i) => i !== indexToRemove));
  };

  const onSubmit = async (data: MentorProfileInput) => {
    setIsLoading(true);
    try {
      // Update image URL if changed
      if (imageUrlValue !== initialData.imageUrl) {
        const uploadRes = await uploadAvatarUrlAction(imageUrlValue);
        if (!uploadRes.success) {
          toast.error(uploadRes.error || "Failed to update profile photo.");
          setIsLoading(false);
          return;
        }
      }

      const res = await upsertMentorProfile(data);
      if (res.success) {
        toast.success("Profile saved successfully!");
        router.push(`/mentors/${res.mentorProfileId}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save profile.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Edit Profile</h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Manage your public academic profile and mentorship details.
          </p>
        </div>
        <div className="flex gap-2">
          {initialData.mentorProfile && (
            <a
              href={`/mentors/${initialData.mentorProfile.id}`}
              className="inline-flex items-center border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] font-semibold text-sm rounded-[4px] px-4 py-2 bg-white"
            >
              View Public Profile
            </a>
          )}
          <Button
            type="submit"
            form="mentor-profile-form"
            disabled={isLoading}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-sm rounded-[4px] px-4 py-2 cursor-pointer border-0 h-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      <form id="mentor-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Basic Information */}
        <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#0F172A]">Basic Information</CardTitle>
            <CardDescription className="text-xs text-[#64748B] font-medium">
              Update your general details, professional title, and institution affiliation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center w-full">
              {/* Circular Avatar with URL Preview */}
              <Avatar className="h-24 w-24 border border-[#E2E8F0] rounded-full flex-shrink-0">
                <AvatarImage src={imageUrlValue || ""} alt={initialData.name} />
                <AvatarFallback className="bg-indigo-50 text-indigo-700 text-3xl font-bold rounded-full">
                  {initialData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1.5 flex-1 w-full">
                <Label htmlFor="imageUrl" className="text-sm font-semibold text-[#0f172a]">
                  Profile Picture URL
                </Label>
                <Input
                  id="imageUrl"
                  placeholder="Paste an image URL (e.g. https://images.unsplash.com/...)"
                  value={imageUrlValue}
                  onChange={(e) => setImageUrlValue(e.target.value)}
                  className="border-[#E2E8F0] rounded-[4px] focus-visible:ring-1 focus-visible:ring-[#4f46e5] focus-visible:border-[#4f46e5]"
                />
                <span className="block text-[10px] text-slate-400 font-medium leading-normal pt-0.5">
                  Provide a direct link to an image. Real-time preview will display on the left.
                </span>
              </div>

              {/* Text Fields */}
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-semibold text-[#0f172a]">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    className="border-[#E2E8F0] rounded-[4px]"
                    disabled={isLoading}
                    {...register("name")}
                  />
                  {errors.name && <p className="text-xs text-red-600 font-semibold">{errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="headline" className="text-sm font-semibold text-[#0f172a]">
                    Professional Title
                  </Label>
                  <Input
                    id="headline"
                    placeholder="e.g. Senior Research Fellow, Tech Lead"
                    className="border-[#E2E8F0] rounded-[4px]"
                    disabled={isLoading}
                    {...register("headline")}
                  />
                  {errors.headline && <p className="text-xs text-red-600 font-semibold">{errors.headline.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="institution" className="text-sm font-semibold text-[#0f172a]">
                    Organization / Institution
                  </Label>
                  <Input
                    id="institution"
                    placeholder="e.g. Stanford University, Google"
                    className="border-[#E2E8F0] rounded-[4px]"
                    disabled={isLoading}
                    {...register("institution")}
                  />
                  {errors.institution && <p className="text-xs text-red-600 font-semibold">{errors.institution.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="domain" className="text-sm font-semibold text-[#0f172a]">
                    Primary Domain
                  </Label>
                  <Select
                    defaultValue={initialData.mentorProfile?.domain || "Engineering"}
                    onValueChange={(val) => { if (val) setValue("domain", val); }}
                  >
                    <SelectTrigger className="border-[#E2E8F0] rounded-[4px]">
                      <SelectValue placeholder="Select primary domain" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] rounded-[4px]">
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Product Management">Product Management</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.domain && <p className="text-xs text-red-600 font-semibold">{errors.domain.message}</p>}
                </div>

                {/* Availability Status */}
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="availabilityStatus" className="text-sm font-semibold text-[#0f172a]">
                    Availability Status
                  </Label>
                  <Select
                    defaultValue={initialData.mentorProfile?.availabilityStatus || "AVAILABLE"}
                    onValueChange={(val) => { if (val) setValue("availabilityStatus", val as "AVAILABLE" | "LIMITED" | "UNAVAILABLE"); }}
                  >
                    <SelectTrigger className="border-[#E2E8F0] rounded-[4px]">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] rounded-[4px]">
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="LIMITED">At Capacity</SelectItem>
                      <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biography */}
        <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#0F172A]">Biography</CardTitle>
            <CardDescription className="text-xs text-[#64748B] font-medium">
              Provide a comprehensive overview of your academic journey and mentorship philosophy. This is prominently displayed on your public profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Textarea
                id="bio"
                placeholder="Write your professional bio here (min 40 characters)..."
                className="min-h-36 border-[#E2E8F0] rounded-[4px] leading-relaxed"
                disabled={isLoading}
                {...register("bio")}
              />
              {errors.bio && <p className="text-xs text-red-600 font-semibold">{errors.bio.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Areas of Expertise */}
        <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#0F172A]">Areas of Expertise</CardTitle>
            <CardDescription className="text-xs text-[#64748B] font-medium">
              Add custom skills or academic topics tags to help students search for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Cognitive Neuroscience, M&A, UX Strategy"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(e);
                  }
                }}
                className="border-[#E2E8F0] rounded-[4px]"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold px-4 rounded-[4px]"
              >
                Add
              </Button>
            </div>

            {/* Render added tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="rounded-[4px] bg-[#f8fafc] border border-[#E2E8F0] text-[#0F172A] font-semibold text-xs py-1 px-3 flex items-center gap-1.5"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(skill)}
                    className="hover:text-red-600 focus:outline-none transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-400 italic font-medium">
                  No expertise tags added yet.
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Academic & Professional Background Timeline */}
        <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-[#0F172A]">
                Academic & Professional Background
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B] font-medium mt-1">
                Configure your background history timeline.
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={() => setBgDialogOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4f46e5] hover:underline bg-transparent border-0"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {backgroundEntries.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-[#E2E8F0] rounded-[4px] overflow-hidden bg-slate-50/20">
                {backgroundEntries.map((entry, index) => (
                  <div key={index} className="p-4 bg-white flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-[#4f46e5]">
                        {entry.startYear} - {entry.endYear}
                      </span>
                      <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-[#64748B]" />
                        {entry.title}
                      </h4>
                      <p className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-300" />
                        {entry.institution}
                      </p>
                      {entry.description && (
                        <p className="text-xs text-[#64748B] leading-relaxed mt-2 pl-5 italic border-l border-slate-100">
                          {entry.description}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveBgEntry(index)}
                      className="text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-[4px] shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic font-medium py-2">
                No history timeline entries. Click &apos;Add Entry&apos; to include your academic degrees or past titles.
              </p>
            )}
          </CardContent>
        </Card>

      </form>

      {/* Add Background Entry Dialog */}
      <Dialog open={bgDialogOpen} onOpenChange={setBgDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white border border-[#E2E8F0] rounded-[4px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#0F172A]">
              Add Academic Entry
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B] font-medium">
              Create an item for your background timeline.
            </DialogDescription>
          </DialogHeader>

          {bgErrors && (
            <div className="p-3 border border-red-100 bg-red-50 text-red-700 text-xs font-bold rounded-[4px]">
              {bgErrors}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="bg-title" className="text-sm font-semibold text-[#0f172a]">
                Title / Position
              </Label>
              <Input
                id="bg-title"
                placeholder="e.g. Ph.D. in Cognitive Psychology"
                value={bgTitle}
                onChange={(e) => setBgTitle(e.target.value)}
                className="border-[#E2E8F0] rounded-[4px]"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="bg-institution" className="text-sm font-semibold text-[#0f172a]">
                Institution / Organization
              </Label>
              <Input
                id="bg-institution"
                placeholder="e.g. Stanford University"
                value={bgInstitution}
                onChange={(e) => setBgInstitution(e.target.value)}
                className="border-[#E2E8F0] rounded-[4px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="bg-start" className="text-sm font-semibold text-[#0f172a]">
                  Start Year
                </Label>
                <Input
                  id="bg-start"
                  placeholder="e.g. 2008"
                  value={bgStartYear}
                  onChange={(e) => setBgStartYear(e.target.value)}
                  className="border-[#E2E8F0] rounded-[4px]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bg-end" className="text-sm font-semibold text-[#0f172a]">
                  End Year
                </Label>
                <Input
                  id="bg-end"
                  placeholder="e.g. 2013 or Present"
                  value={bgEndYear}
                  onChange={(e) => setBgEndYear(e.target.value)}
                  className="border-[#E2E8F0] rounded-[4px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bg-desc" className="text-sm font-semibold text-[#0f172a]">
                Brief Description (Optional)
              </Label>
              <Textarea
                id="bg-desc"
                placeholder="Details of research, advisor name, dissertation thesis, etc..."
                value={bgDescription}
                onChange={(e) => setBgDescription(e.target.value)}
                className="min-h-20 border-[#E2E8F0] rounded-[4px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBgDialogOpen(false)}
              className="border-[#E2E8F0] rounded-[4px] font-semibold text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddBgEntry}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-[4px] font-semibold text-sm"
            >
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
