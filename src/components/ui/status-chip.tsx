import type { AttendanceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const map: Record<AttendanceStatus, string> = {
  attending: "bg-emerald-100 text-emerald-700",
  maybe: "bg-amber-100 text-amber-700",
  declined: "bg-rose-100 text-rose-700",
};

export function StatusChip({ status }: { status: AttendanceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        map[status],
      )}
    >
      {status}
    </span>
  );
}
