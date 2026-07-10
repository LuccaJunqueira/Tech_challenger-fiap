import { cn } from '@bytebank/ui';

type BadgeVariant = 'cyan' | 'purple' | 'pink' | 'green' | 'red' | 'blue';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  const colors: Record<BadgeVariant, string> = {
    cyan:   'bg-neon-cyan/10   border-neon-cyan/20   text-neon-cyan',
    purple: 'bg-neon-purple/10 border-neon-purple/20 text-neon-purple',
    pink:   'bg-neon-pink/10   border-neon-pink/20   text-neon-pink',
    green:  'bg-neon-green/10  border-neon-green/20  text-neon-green',
    red:    'bg-red-500/10     border-red-500/20     text-red-400',
    blue:   'bg-neon-blue/10   border-neon-blue/20   text-neon-blue',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5',
        'rounded-pill border',
        'text-[9.5px] font-mono font-semibold uppercase tracking-wider',
        colors[variant],
        className
      )}
    >
      {children}
    </span>
  );
}