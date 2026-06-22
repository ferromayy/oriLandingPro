import Link from "next/link";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { normalizeEducationMarkdown } from "@/lib/education/markdown";

const headingClass =
  "mt-10 mb-3 border-b border-gray-200 pb-2 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl";

const markdownComponents: Components = {
  h1: ({ children }) => <h2 className={headingClass}>{children}</h2>,
  h2: ({ children }) => <h2 className={headingClass}>{children}</h2>,
  h3: ({ children }) => (
    <h3 className="mt-8 mb-2 text-lg font-semibold text-gray-900">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 mb-2 text-base font-semibold text-gray-900">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-sm leading-relaxed text-gray-600 sm:text-base">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-5 text-sm text-gray-600 sm:text-base">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm text-gray-600 sm:text-base">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-gray-300 pl-4 text-sm italic text-gray-600 sm:text-base">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => {
    if (!href) return <span>{children}</span>;

    const className =
      "font-medium text-gray-900 underline underline-offset-4 transition-colors hover:text-gray-600";

    if (href.startsWith("/")) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  },
  hr: () => <hr className="my-8 border-gray-200" />,
};

type Props = {
  content: string;
  noteTitle?: string;
  className?: string;
};

export function EducationNoteContent({ content, noteTitle, className = "" }: Props) {
  const prepared = normalizeEducationMarkdown(content, noteTitle);

  return (
    <div className={`education-note-content ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={markdownComponents}
      >
        {prepared}
      </ReactMarkdown>
    </div>
  );
}
