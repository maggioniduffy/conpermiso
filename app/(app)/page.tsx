// app/(app)/page.tsx
import { auth } from "@/auth";
import HomeMapScreen from "@/components/Maps/HomeMapScreen";

interface Params {
  searchParams: Promise<{ query?: string; lat?: string; lng?: string }>;
}

export default async function Home({ searchParams }: Params) {
  const { query, lat, lng } = await searchParams;
  const session = await auth();

  const searchCenter =
    lat && lng
      ? { latitude: parseFloat(lat), longitude: parseFloat(lng), pin: !query }
      : null;

  return (
    <HomeMapScreen
      searchCenter={searchCenter}
      query={query}
      lat={lat}
      lng={lng}
      isLoggedIn={!!session?.user}
    />
  );
}
