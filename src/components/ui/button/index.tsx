import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-r12',
    'transition-all duration-200',
    'active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ];

  const variants = {
    primary: [
      'bg-gradient-to-r from-neon-cyan to-neon-purple',
      'text-white',
      'hover:-translate-y-px hover:shadow-glow-pink',
    ],
    secondary: [
      'bg-white/5 border border-white/10',
      'text-foreground',
      'hover:bg-white/10',
    ],
    outline: [
      'border border-neon-cyan/25',
      'text-neon-cyan',
      'hover:bg-neon-cyan/10',
    ],
    danger: [
      'bg-red-500/10 border border-red-500/20',
      'text-red-400',
      'hover:bg-red-500/20',
    ],
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}