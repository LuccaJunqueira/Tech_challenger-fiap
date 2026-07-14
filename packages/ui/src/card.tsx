import { cn } from './utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('bg-card border border-white/8 rounded-r16 p-5', className)} {...props}>
      {children}
    </div>
  );
}
