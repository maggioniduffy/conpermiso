"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

interface Props {
  className?: string;
  logoClassName?: string;
}

const AuthHeader = ({
  className = "text-center mb-10",
  logoClassName = "mx-auto h-16 w-auto",
}: Props) => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <Image
        src="/logo-lockup-3x.png"
        width={560}
        height={144}
        className={logoClassName}
        alt="KKapp"
        priority
      />
      <p className="mt-2 text-sm font-medium text-jet-700">{t("auth.tagline")}</p>
    </div>
  );
};

export default AuthHeader;
