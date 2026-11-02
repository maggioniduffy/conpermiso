import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { APP_STORE_URL } from "@/lib/store";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <footer />,
}));

import PrivacyPage from "@/app/privacy/page";

describe("PrivacyPage", () => {
  it("renders the lockup logo", () => {
    render(<PrivacyPage />);
    expect(screen.getByAltText("KKapp logo").getAttribute("src")).toContain(
      "logo-lockup",
    );
  });

  it("mentions Apple, Resend and Sentry", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("Apple");
    expect(text).toContain("Resend");
    expect(text).toContain("Sentry");
  });

  it("mentions account deletion path", () => {
    const { container } = render(<PrivacyPage />);
    expect(container.textContent).toContain("Eliminar Cuenta");
  });

  it("shows the last update date", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/noviembre 2026/)).toBeInTheDocument();
  });

  it("links to the App Store", () => {
    const { container } = render(<PrivacyPage />);
    expect(
      container.querySelector(`a[href="${APP_STORE_URL}"]`),
    ).toBeInTheDocument();
  });

  it("no longer claims Sentry has no personal data", () => {
    const { container } = render(<PrivacyPage />);
    expect(container.textContent).not.toContain("No incluye datos personales");
  });
});
