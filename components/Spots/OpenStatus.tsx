"use client";

import { Shift } from "@/utils/models";
import OpenBadge from "./OpenBadge";
import { isOpenWithTimezone } from "@/lib/utils";

interface Props {
  shifts: Shift[];
  timezone?: string;
}

export default function OpenStatus({ shifts, timezone = "UTC" }: Props) {
  return <OpenBadge isOpen={isOpenWithTimezone(shifts, timezone)} />;
}
