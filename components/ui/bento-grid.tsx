import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
}

const colSpanClasses: Record<number, string> = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
};

const rowSpanClasses: Record<number, string> = {
  2: "md:row-span-2",
};

export function BentoItem({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
}: BentoItemProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-[var(--glass)] backdrop-blur-sm",
        colSpan > 1 && colSpanClasses[colSpan],
        rowSpan > 1 && rowSpanClasses[rowSpan],
        className
      )}
    >
      {children}
    </div>
  );
}
