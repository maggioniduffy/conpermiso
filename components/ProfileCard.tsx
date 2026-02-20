"use client";

import { useBackendUser } from "@/hooks/use-backend-user";

import { HoverCard } from "@/components/ui/hover-card";
import Image from "next/image";
import Link from "next/link";

interface Props {
  name?: string;
  email?: string;
  image?: string;
}

export default function ProfileCard({
  name = "Faustino Maggioni",
  email = "fausmaggioni5@gmail.com",
  image = "/icons/cool_avatar.png",
}: Props) {
  const { user, loading } = useBackendUser();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Error</p>;

  return (
    <HoverCard>
      <div className="flex items-center gap-3">
        <Image
          className="shrink-0 rounded-full drop-shadow-lg"
          src={user.image || image}
          width={40}
          height={40}
          alt="Avatar"
        />
        <div className="space-y-0.5">
          <p>
            <Link
              className="text-sm font-medium hover:underline"
              href="/profile"
            >
              {user.name}
            </Link>
          </p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
      </div>
    </HoverCard>
  );
}
