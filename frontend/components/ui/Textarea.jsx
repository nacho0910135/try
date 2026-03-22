import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }) {
  return <textarea className={cn("input-base min-h-[140px]", className)} {...props} />;
}

