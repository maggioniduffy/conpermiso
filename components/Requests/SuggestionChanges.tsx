"use client";

import { useTranslation } from "react-i18next";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";
import { costLabel } from "@/lib/i18n/labels";
import { SuggestionField, suggestionFields } from "@/utils/edit-suggestion";
import { BathAccess, BathRequest, Shift } from "@/utils/models";

interface Props {
  req: BathRequest;
}

// Campos propuestos por una sugerencia de edición (sólo lo nuevo).
export function SuggestionChanges({ req }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      {suggestionFields(req.changes).map((field) => (
        <div
          key={field}
          className="flex flex-col gap-1 rounded-[10px] bg-gray-50 p-2.5"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-jet-700">
            {t(`suggest.fields.${field}`)}
          </span>
          <FieldValue field={field} value={req.changes?.[field]} />
        </div>
      ))}
    </div>
  );
}

function FieldValue({
  field,
  value,
}: {
  field: SuggestionField;
  value: unknown;
}) {
  const { t } = useTranslation();

  if (field === "shifts") {
    const shifts = (value as Shift[] | undefined) ?? [];
    if (shifts.length === 0)
      return (
        <span className="text-sm font-medium text-jet">
          {t("suggest.noShifts")}
        </span>
      );
    return (
      <div>
        {shifts.map((shift, i) => (
          <ShiftVisualizer key={i} shift={shift} />
        ))}
      </div>
    );
  }

  let text: string;
  if (field === "cost") text = costLabel(value as string | number, t);
  else if (field === "type")
    text =
      value === BathAccess.PUBLIC
        ? t("spot.access.public")
        : t("spot.access.private");
  else if (field === "location") text = t("suggest.locationMoved");
  else text = String(value ?? "");

  return <span className="text-sm font-medium text-jet">{text}</span>;
}
