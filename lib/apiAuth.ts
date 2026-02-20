export async function exchangeToken() {
  const res = await fetch("/api/exchange", {
    method: "POST",
  });

  if (!res.ok) throw new Error("Exchange failed");

  const { accessToken } = await res.json();

  console.log("Received access token:", accessToken);
  localStorage.setItem("accessToken", accessToken);

  return accessToken;
}
