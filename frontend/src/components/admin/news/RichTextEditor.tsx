"use client";

import dynamic from "next/dynamic";
import { useId, type ReactNode } from "react";
import "react-quill-new/dist/quill.snow.css";
import styles from "./RichTextEditor.module.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className={styles.loading} aria-hidden="true">
      Загрузка редактора…
    </div>
  ),
});

/** Toolbar aligned with server NEWS HTML allowlist (no images/scripts). */
const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "blockquote",
  "link",
];

export type RichTextEditorProps = {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
};

export function RichTextEditor({
  id,
  label,
  value,
  onChange,
  onBlur,
  required,
  disabled,
  hint,
  error,
}: RichTextEditorProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        <span>{label}</span>
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      <div
        className={[
          styles.editor,
          error ? styles.invalid : undefined,
          disabled ? styles.disabled : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      >
        <ReactQuill
          id={fieldId}
          theme="snow"
          value={value}
          onChange={(next) => {
            onChange(next);
          }}
          onBlur={(_range, _source, editor) => {
            onChange(editor.getHTML());
            onBlur?.();
          }}
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          readOnly={disabled}
        />
      </div>

      {hint && !error ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
