import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      <div className="w-full h-screen bg-jet"></div>;
    </SessionProvider>
  );
}
