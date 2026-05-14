import { MessageSquarePlus } from "lucide-react";

const MAIL = "contacto@kkapp.es";

export default function FeedbackButton() {
  return (
    <a
      href={`mailto:${MAIL}?subject=Sugerencia%20KKapp&body=Hola%2C%20quería%20comentar%20que...`}
      className="flex items-center gap-2 text-sm text-jet-600 hover:text-principal transition-colors"
    >
      <MessageSquarePlus className="size-4" />
      Reportar un problema o sugerencia
    </a>
  );
}
