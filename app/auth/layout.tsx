import React from "react";

export const metadata = {
  title: "Auth | KKapp",
};

const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <div className="flex w-full">{children}</div>;
};

export default layout;
