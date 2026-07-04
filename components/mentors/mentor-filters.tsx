"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

const DOMAINS = [
  { id: "Engineering", label: "Engineering" },
  { id: "Finance", label: "Finance" },
  { id: "Design", label: "Design" },
  { id: "Product Management", label: "Product Management" },
];

const EXPERIENCE_LEVELS = [
  { id: "all", label: "Any Experience" },
  { id: "junior", label: "Junior (1-3 yrs)" },
  { id: "mid", label: "Mid-Level (4-7 yrs)" },
  { id: "senior", label: "Senior (8+ yrs)" },
];

export default function MentorFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Helper to update search params
  const updateQuery = (key: string, value: string | string[] | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.delete(key);
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
    
    // Reset page to 1 when filters change
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Get active domain values
  const activeDomains = searchParams.getAll("domain");

  const handleDomainChange = (domainId: string, checked: boolean) => {
    const nextDomains = checked
      ? [...activeDomains, domainId]
      : activeDomains.filter((d) => d !== domainId);
    updateQuery("domain", nextDomains);
  };

  // Get active experience level
  const activeExp = searchParams.get("experience") || "all";

  // Get active availability check
  const activeAvailability = searchParams.get("available") === "true";

  return (
    <div className={`space-y-6 bg-white border border-[#E2E8F0] p-6 rounded-[4px] h-fit transition-opacity ${isPending ? "opacity-75" : ""}`}>
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-[#0F172A]">Filters</h2>
        <Separator className="mt-4" />
      </div>

      {/* Domain Checkboxes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#0F172A]">Domain</h3>
        <div className="space-y-2">
          {DOMAINS.map((domain) => (
            <div key={domain.id} className="flex items-center space-x-2 select-none cursor-pointer">
              <Checkbox
                id={`domain-${domain.id}`}
                checked={activeDomains.includes(domain.id)}
                onCheckedChange={(checked: boolean | "indeterminate") => handleDomainChange(domain.id, !!checked)}
                className="rounded-[2px] border-[#E2E8F0] data-[state=checked]:bg-[#4f46e5] data-[state=checked]:border-[#4f46e5]"
              />
              <Label
                htmlFor={`domain-${domain.id}`}
                className="text-sm font-medium text-[#64748B] cursor-pointer select-none"
              >
                {domain.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Experience Level Radios */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#0F172A]">Experience Level</h3>
        <RadioGroup
          value={activeExp}
          onValueChange={(val: string) => updateQuery("experience", val === "all" ? null : val)}
          className="space-y-2"
        >
          {EXPERIENCE_LEVELS.map((level) => (
            <div key={level.id} className="flex items-center space-x-2 cursor-pointer select-none">
              <RadioGroupItem
                value={level.id}
                id={`exp-${level.id}`}
                className="border-[#E2E8F0] text-[#4f46e5] focus:ring-[#4f46e5]"
              />
              <Label
                htmlFor={`exp-${level.id}`}
                className="text-sm font-medium text-[#64748B] cursor-pointer select-none"
              >
                {level.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Availability Checkbox */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#0F172A]">Availability</h3>
        <div className="flex items-center space-x-2 cursor-pointer select-none">
          <Checkbox
            id="available"
            checked={activeAvailability}
            onCheckedChange={(checked: boolean | "indeterminate") => updateQuery("available", checked ? "true" : null)}
            className="rounded-[2px] border-[#E2E8F0] data-[state=checked]:bg-[#4f46e5] data-[state=checked]:border-[#4f46e5]"
          />
          <Label
            htmlFor="available"
            className="text-sm font-medium text-[#64748B] cursor-pointer select-none"
          >
            Accepting Mentees
          </Label>
        </div>
      </div>
    </div>
  );
}
