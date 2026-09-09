import clsx from "clsx";
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Checkbox.module.css";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "type"
> & {
  id: string;
  label: ReactNode;
  error?: ReactNode;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { id, label, error, className, required, disabled, ...rest },
    ref,
  ) {
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={styles.field}>
        <div className={styles.row}>
          <input
            id={id}
            ref={ref}
            type="checkbox"
            className={clsx(styles.control, className)}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            {...rest}
          />
          <label className={styles.label} htmlFor={id}>
            <span>{label}</span>
            {required ? (
              <span className={styles.required} aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
        </div>
        {error ? (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
