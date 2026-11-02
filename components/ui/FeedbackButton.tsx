"use client";

import { MessageSquarePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

const MAIL = "contacto@kkapp.es";

interface Props {
  className?: string;
}

export default function FeedbackButton({
  className = "flex items-center gap-2 border-t border-gray-100 px-4 py-3.5 text-sm text-principal hover:underline",
}: Props) {
  const { t } = useTranslation();
  const subject = encodeURIComponent(t("profile.feedbackSubject"));
  const body = encodeURIComponent(t("profile.feedbackBody"));

  return (
    <a href={`mailto:${MAIL}?subject=${subject}&body=${body}`} className={className}>
      <MessageSquarePlus className="size-4 shrink-0" />
      {t("profile.feedback")}
    </a>
  );
}
