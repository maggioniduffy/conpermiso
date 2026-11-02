"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";
import FeedbackButton from "@/components/ui/FeedbackButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import BackButton from "./BackButton";
import BlockedUsersList from "./BlockedUsersList";
import DeleteAccountButton from "./DeleteAccountButton";
import FavoritesList from "./FavoritesList";
import MyOwnList from "./MyOwnList";
import SignOutButton from "./SignOutButton";
import UserProfileCard from "./UserProfileCard";

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export default function ProfileScreen({ user }: Props) {
  const { t } = useTranslation();

  return (
    <div className="w-full flex flex-col bg-mywhite overflow-hidden h-[calc(100dvh-3.5rem)]">
      <div className="flex-1 min-h-0 overflow-y-auto w-full md:w-3xl mx-auto px-4 py-4 flex flex-col gap-6 pb-10">
        <BackButton />

        <section className="flex flex-col gap-3">
          <h1 className="text-xl font-semibold text-jet">{t("profile.title")}</h1>
          <UserProfileCard user={user} />
        </section>

        <ErrorBoundary>
          <BlockedUsersList />
        </ErrorBoundary>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-jet">{t("profile.saved")}</h2>
          <ErrorBoundary>
            <FavoritesList />
          </ErrorBoundary>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-jet">{t("profile.added")}</h2>
          <ErrorBoundary>
            <MyOwnList />
          </ErrorBoundary>
        </section>

        <section className="flex flex-col gap-3 border-t border-gray-100 pt-6">
          <h2 className="text-xl font-semibold text-jet">
            {t("profile.settings")}
          </h2>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 px-4 py-2.5">
              <Globe className="size-4 text-jet" />
              <span className="flex-1 text-sm font-medium text-jet">
                {t("language.label")}
              </span>
              <LanguageToggle />
            </div>
            <FeedbackButton />
            <SignOutButton />
            <DeleteAccountButton />
          </div>
        </section>
      </div>
    </div>
  );
}
