import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import i18n from "@/lib/i18n";
import { AppLinkBanner } from "@/components/AppLinkBanner";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: () => <img alt="" />,
}));

function setup() {
  return render(<AppLinkBanner />);
}

describe("AppLinkBanner", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    document.documentElement.style.removeProperty("--app-banner-h");
    await i18n.changeLanguage("es");
    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (Linux; Android 14) Chrome/120",
    );
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(72);
  });

  it("renders translated strings and publishes --app-banner-h", async () => {
    setup();
    expect(await screen.findByText("Abrir en la app")).toBeInTheDocument();
    expect(screen.getByText("Seguir en el navegador")).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Abrir KKapp en la app" }),
    ).toBeInTheDocument();
    expect(
      document.documentElement.style.getPropertyValue("--app-banner-h"),
    ).toBe("72px");
  });

  it("resets --app-banner-h to 0px after dismiss", async () => {
    setup();
    fireEvent.click(await screen.findByText("Seguir en el navegador"));
    await waitFor(() =>
      expect(
        document.documentElement.style.getPropertyValue("--app-banner-h"),
      ).toBe("0px"),
    );
  });

  it("renders English strings", async () => {
    await i18n.changeLanguage("en");
    setup();
    expect(await screen.findByText("Open in app")).toBeInTheDocument();
    expect(screen.getByText("Stay in browser")).toBeInTheDocument();
  });
});
