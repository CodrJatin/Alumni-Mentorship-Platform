import React from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="max-w-none text-sm text-[#0F172A] leading-relaxed break-words">
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 text-[#0F172A]" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-lg font-bold mt-4 mb-2 text-[#0F172A]" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-base font-bold mt-3 mb-1 text-[#0F172A]" {...props} />
          ),
          p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
          ul: ({ ...props }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1 text-[#0F172A]" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1 text-[#0F172A]" {...props} />
          ),
          li: ({ ...props }) => <li className="mb-0.5" {...props} />,
          a: ({ href, ...props }) => {
            const deployedUrl = process.env.NEXT_PUBLIC_DEPLOYED_URL || "https://alumentor";
            const isInternal =
              href?.startsWith("/") ||
              href?.startsWith("http://localhost") ||
              href?.startsWith(deployedUrl);
            if (isInternal && href) {
              return (
                <Link
                  href={href}
                  className="text-[#4f46e5] hover:underline font-semibold"
                  {...props}
                >
                  {props.children as React.ReactNode}
                </Link>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4f46e5] hover:underline font-semibold"
                {...props}
              />
            );
          },
          code: ({ className, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code
                className="bg-slate-100 text-slate-800 rounded px-1.5 py-0.5 text-xs font-semibold"
                {...props}
              />
            ) : (
              <pre className="bg-slate-900 text-[#E2E8F0] rounded-[4px] p-4 text-xs overflow-x-auto my-3 font-mono">
                <code {...props} />
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
