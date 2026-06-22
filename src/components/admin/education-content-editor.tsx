"use client";

import { useRef, useState } from "react";
import { EducationNoteContent } from "@/components/site/education-note-content";

type Props = {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
};

type ToolbarAction = {
  label: string;
  title: string;
  prefix: string;
  suffix?: string;
  block?: boolean;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: "Negrita", title: "Negrita (**texto**)", prefix: "**", suffix: "**" },
  { label: "Subtítulo", title: "Subtítulo (##)", prefix: "## ", block: true },
  { label: "Sección", title: "Sección menor (###)", prefix: "### ", block: true },
  { label: "Lista", title: "Lista con viñetas", prefix: "- ", block: true },
];

function inputClass(hasError: boolean): string {
  return `w-full rounded-lg border px-3 py-2 font-mono text-sm ${
    hasError ? "border-red-400 bg-red-50" : "border-zinc-300"
  }`;
}

export function EducationContentEditor({ value, onChange, hasError = false }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  function applyAction(action: ToolbarAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);

    let nextValue = value;
    let selectionStart = start;
    let selectionEnd = end;

    if (action.block) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = value.indexOf("\n", end);
      const lineEndIndex = lineEnd === -1 ? value.length : lineEnd;
      const line = value.slice(lineStart, lineEndIndex);
      const stripped = line.replace(/^#{1,6}\s+|^[-*+]\s+/, "");
      const nextLine = `${action.prefix}${stripped}`;

      nextValue = value.slice(0, lineStart) + nextLine + value.slice(lineEndIndex);
      selectionStart = lineStart;
      selectionEnd = lineStart + nextLine.length;
    } else {
      const wrapped = `${action.prefix}${selected || "texto"}${action.suffix ?? ""}`;
      nextValue = value.slice(0, start) + wrapped + value.slice(end);
      selectionStart = start + action.prefix.length;
      selectionEnd = selectionStart + (selected || "texto").length;
    }

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.title}
            onClick={() => applyAction(action)}
            className="rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowPreview((current) => !current)}
          className="ml-auto rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          {showPreview ? "Editar" : "Vista previa"}
        </button>
      </div>

      {showPreview ? (
        <div className="min-h-[240px] rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          {value.trim() ? (
            <EducationNoteContent content={value} />
          ) : (
            <p className="text-sm text-zinc-500">Escribí contenido para ver la vista previa.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={14}
          className={inputClass(hasError)}
          placeholder={`Podés usar formato simple:

## Subtítulo
Texto normal con **negrita** e *cursiva*.

### Sección
- Punto de lista
- Otro punto

Dejá una línea en blanco entre párrafos.`}
        />
      )}

      <p className="text-xs text-zinc-500">
        Usá <code className="rounded bg-zinc-100 px-1">##</code> para subtítulos,{" "}
        <code className="rounded bg-zinc-100 px-1">**texto**</code> para negrita y{" "}
        <code className="rounded bg-zinc-100 px-1">-</code> para listas. Las notas
        anteriores sin formato siguen viéndose igual.
      </p>
    </div>
  );
}
