import React from "react";

export const metadata = {
  title: "Auth | KKapp",
};

// La página redirige a /auth: sólo envuelve sin el panel lateral.
const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <div className="flex w-full">{children}</div>;
};

export default layout;
