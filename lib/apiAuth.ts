export async function exchangeToken() {
  const res = await fetch("/api/exchange", {
    method: "POST",
  });

  if (!res.ok) throw new Error("Exchange failed");

  const { accessToken } = await res.json();

  localStorage.setItem("accessToken", accessToken);

  return accessToken;
}
