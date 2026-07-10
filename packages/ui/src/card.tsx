import { cn } from './utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-card border border-white/8 rounded-r16 p-5', className)}>
      {children}
    </div>
  );
}
