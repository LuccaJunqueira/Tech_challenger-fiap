import { cn } from './utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full px-4 py-3 rounded-[var(--radius-input)]',
          'bg-bg-surface border border-border',
          'text-foreground placeholder:text-muted-foreground text-sm',
          'focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/30',
          'transition-all duration-200',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          className
        )}
        {...props}
      />
      {error && (
        <span id={errorId} className="text-[10px] text-destructive" role="alert" aria-live="polite">{error}</span>
      )}
    </div>
  );
}
