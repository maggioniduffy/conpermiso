"use client";

import { Shift } from "@/utils/models";
import OpenBadge from "./OpenBadge";
import { isOpenWithTimezone } from "@/lib/utils";

interface Props {
  shifts: Shift[];
  timezone?: string;
  variant?: "soft" | "solid";
}

export default function OpenStatus({
  shifts,
  timezone = "UTC",
  variant = "soft",
}: Props) {
  return (
    <OpenBadge isOpen={isOpenWithTimezone(shifts, timezone)} variant={variant} />
  );
}
