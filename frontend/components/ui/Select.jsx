import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }) {
  return (
    <select className={cn("input-base appearance-none", className)} {...props}>
      {children}
    </select>
  );
}

