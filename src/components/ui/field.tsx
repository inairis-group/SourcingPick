import { useId, type ReactElement, type ReactNode, cloneElement } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
};

/**
 * Form field wrapper — pairs a label with a single form control, wires the
 * label htmlFor + aria-describedby for error/hint text automatically.
 *
 * Usage:
 *   <Field label="Email" hint="We'll never share this" required>
 *     <Input type="email" />
 *   </Field>
 */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {cloneElement(children, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
