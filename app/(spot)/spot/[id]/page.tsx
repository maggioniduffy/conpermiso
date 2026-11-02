// app/(spot)/spot/[id]/page.tsx
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Bath, Day } from "@/utils/models";
import SpotDetailView from "./SpotDetailView";

async function getBath(id: string): Promise<Bath | null> {
  const res = await fetch(`${process.env.BACKEND_URL}/baths/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

function isShiftOpenNow(shifts: Bath["shifts"], timezone: string): boolean {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "0";

    const weekdayMap: Record<string, number> = {
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
      Sun: 7,
    };

    const currentDay = weekdayMap[get("weekday")] ?? 1;
    const hours = parseInt(get("hour"), 10) % 24;
    const minutes = parseInt(get("minute"), 10);
    const currentMinutes = hours * 60 + minutes;

    return shifts.some((shift) => {
      if (!shift.days.includes(currentDay as Day)) return false;
      if (shift.allDay) return true;
      if (!shift.from || !shift.to) return false;

      const from = Number(shift.from.hour) * 60 + Number(shift.from.minute);
      const to = Number(shift.to.hour) * 60 + Number(shift.to.minute);

      if (from > to) return currentMinutes >= from || currentMinutes <= to;
      return currentMinutes >= from && currentMinutes <= to;
    });
  } catch {
    return false;
  }
}

export default async function SpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bath = await getBath(id);
  if (!bath) return notFound();

  const session = await auth();
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "admin";

  const { shifts, timezone } = bath;
  const isOpen =
    shifts && shifts.length > 0
      ? isShiftOpenNow(shifts, timezone ?? "UTC")
      : null;

  return (
    <SpotDetailView
      bath={{ ...bath, _id: bath._id ?? id }}
      isOpen={isOpen}
      isAdmin={isAdmin}
      isLoggedIn={!!session?.user}
    />
  );
}
