"use client";

import { useEffect } from "react";

export type ValidationIssue = {
  field: string;
  message: string;
};

function formatValidationSummary(issues: ValidationIssue[]): string {
  if (issues.length === 0) return "";
  if (issues.length === 1) return issues[0].message;
  return `${issues.length} campos requieren atención`;
}

type Props = {
  issues: ValidationIssue[];
  onDismiss: () => void;
};

export function FormToast({ issues, onDismiss }: Props) {
  useEffect(() => {
    if (issues.length === 0) return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [issues, onDismiss]);

  if (issues.length === 0) return null;

  return (
    <div
      role="alert"
      className="fixed right-4 top-4 z-[200] w-full max-w-sm rounded-xl border border-red-200 bg-white p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <span className="material-icons-outlined shrink-0 text-red-600">error_outline</span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-red-900">No se pudo guardar</p>
          <p className="mt-1 text-sm text-red-800">{formatValidationSummary(issues)}</p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-red-700">
            {issues.map((issue) => (
              <li key={`${issue.field}-${issue.message}`}>• {issue.message}</li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-zinc-400 hover:text-zinc-700"
          aria-label="Cerrar"
        >
          <span className="material-icons-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}

export function FormErrorBanner({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
    >
      <p className="font-medium">Revisá estos puntos antes de guardar:</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-red-800">
        {issues.map((issue) => (
          <li key={`${issue.field}-${issue.message}`}>{issue.message}</li>
        ))}
      </ul>
    </div>
  );
}

export function fieldHasError(issues: ValidationIssue[], field: string): boolean {
  return issues.some(
    (issue) => issue.field === field || issue.field.startsWith(`${field}.`),
  );
}

export const inputErrorClass =
  "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200";

export const sectionErrorClass = "rounded-lg ring-2 ring-red-300 ring-offset-2";
