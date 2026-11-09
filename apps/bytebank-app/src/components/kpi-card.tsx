import { Card } from "@bytebank/ui";

interface KpiCardProps {
  title: string;
  value: number;
  subtitle?: string;
  variant?: "cyan" | "green" | "pink";
}

const variantColors: Record<string, string> = {
  cyan: "text-neon-cyan",
  green: "text-neon-green",
  pink: "text-neon-pink",
};

export function KpiCard({
  title,
  value,
  subtitle,
  variant = "cyan",
}: KpiCardProps) {
  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  }

  return (
    <Card className="space-y-2" role="region" aria-label={title}>
      <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <p
        className={`text-3xl font-mono font-bold ${variantColors[variant] ?? variantColors.cyan}`}
      >
        R$ {formatCurrency(value)}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </Card>
  );
}
