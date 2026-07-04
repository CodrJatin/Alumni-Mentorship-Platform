// Force refresh of TS server typings
import { getMentorsList } from "@/lib/data/mentors";
import MentorCard from "@/components/mentors/mentor-card";
import MentorFilters from "@/components/mentors/mentor-filters";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    domain?: string | string[];
    experience?: string | string[];
    available?: string;
    page?: string;
  }>;
}

export default async function MentorsDirectoryPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // Normalize params
  const search = resolvedParams.search || "";
  const domain = resolvedParams.domain
    ? Array.isArray(resolvedParams.domain)
      ? resolvedParams.domain
      : [resolvedParams.domain]
    : [];
  const experience = resolvedParams.experience
    ? Array.isArray(resolvedParams.experience)
      ? resolvedParams.experience
      : [resolvedParams.experience]
    : [];
  const available = resolvedParams.available === "true";
  const currentPage = parseInt(resolvedParams.page || "1", 10);

  // Fetch mentors list
  const result = await getMentorsList({
    search,
    domain,
    experienceLevel: experience,
    acceptingMentees: available,
    page: currentPage,
    limit: 12,
  });

  const totalResults = result.total || 0;
  const totalPages = result.totalPages || 0;
  const mentors = result.mentors || [];

  // Helper to build pagination URL
  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (available) params.set("available", "true");
    domain.forEach((d) => params.append("domain", d));
    experience.forEach((e) => params.append("experience", e));
    params.set("page", pageNumber.toString());
    return `/mentors?${params.toString()}`;
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Filter Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <MentorFilters />
        </aside>

        {/* Right Side: Listings Grid */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
                Mentor Directory
              </h1>
              <p className="text-sm text-[#64748B] mt-1.5 font-medium">
                Connect with industry experts to guide your academic and professional journey.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#64748B] sm:text-right shrink-0">
              Showing {totalResults} result{totalResults !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Top Search & Availability Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6 bg-slate-50/50 p-4 rounded-[4px] border border-slate-100">
            {/* Search Input */}
            <form method="GET" action="/mentors" className="relative flex items-center w-full sm:max-w-md">
              <Search className="absolute left-3 h-4 w-4 text-[#64748B]" />
              <Input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search mentors by name, headline, skills..."
                className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-[4px] text-sm text-[#0F172A] placeholder-[#64748B] bg-white focus-visible:ring-1 focus-visible:ring-[#4f46e5] focus-visible:border-[#4f46e5]"
              />
              {available && <input type="hidden" name="available" value="true" />}
              {domain.map((d) => (
                <input key={d} type="hidden" name="domain" value={d} />
              ))}
              {experience.map((e) => (
                <input key={e} type="hidden" name="experience" value={e} />
              ))}
            </form>

            {/* Availability pills */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                href={`/mentors?${(() => {
                  const p = new URLSearchParams();
                  if (search) p.set("search", search);
                  domain.forEach((d) => p.append("domain", d));
                  experience.forEach((e) => p.append("experience", e));
                  return p.toString();
                })()}`}
                className={`flex-1 sm:flex-initial text-center px-4 py-2 text-xs font-semibold rounded-[4px] border transition-colors ${
                  !available
                    ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                    : "bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0f172a] hover:border-slate-300"
                }`}
              >
                All
              </Link>
              <Link
                href={`/mentors?${(() => {
                  const p = new URLSearchParams();
                  if (search) p.set("search", search);
                  p.set("available", "true");
                  domain.forEach((d) => p.append("domain", d));
                  experience.forEach((e) => p.append("experience", e));
                  return p.toString();
                })()}`}
                className={`flex-1 sm:flex-initial text-center px-4 py-2 text-xs font-semibold rounded-[4px] border transition-colors ${
                  available
                    ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                    : "bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0f172a] hover:border-slate-300"
                }`}
              >
                Available Only
              </Link>
            </div>
          </div>

          {/* Mentors Grid */}
          {mentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          ) : (
            <div className="border border-[#E2E8F0] rounded-[4px] bg-white p-16 text-center space-y-4">
              <h3 className="text-lg font-bold text-[#0F172A]">No Mentors Found</h3>
              <p className="text-sm text-[#64748B] max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any mentors matching your search or filters. Try adjusting your filter checkboxes or clearing your search query.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              {/* Prev Button */}
              {currentPage > 1 ? (
                <Link
                  href={getPageUrl(currentPage - 1)}
                  className="h-10 w-10 border border-[#E2E8F0] rounded-[4px] flex items-center justify-center hover:bg-slate-50 transition-colors text-[#64748B]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              ) : (
                <button
                  disabled
                  className="h-10 w-10 border border-[#E2E8F0] rounded-[4px] flex items-center justify-center text-slate-300 cursor-not-allowed bg-slate-50/50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isCurrent = pageNum === currentPage;
                return (
                  <Link
                    key={pageNum}
                    href={getPageUrl(pageNum)}
                    className={`h-10 w-10 border rounded-[4px] flex items-center justify-center text-sm font-semibold transition-colors ${
                      isCurrent
                        ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                        : "border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 bg-white"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {/* Next Button */}
              {currentPage < totalPages ? (
                <Link
                  href={getPageUrl(currentPage + 1)}
                  className="h-10 w-10 border border-[#E2E8F0] rounded-[4px] flex items-center justify-center hover:bg-slate-50 transition-colors text-[#64748B]"
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              ) : (
                <button
                  disabled
                  className="h-10 w-10 border border-[#E2E8F0] rounded-[4px] flex items-center justify-center text-slate-300 cursor-not-allowed bg-slate-50/50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
