import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring-2",
        props.className,
      )}
    />
  );
}
