import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import i18n from "@/lib/i18n";
import I18nProvider from "@/components/I18nProvider";
import LanguageToggle from "@/components/LanguageToggle";

function setup() {
  render(
    <I18nProvider>
      <LanguageToggle />
    </I18nProvider>,
  );
}

describe("LanguageToggle", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage("es");
  });

  it("switches to EN and persists it", async () => {
    window.localStorage.setItem("app_language", "es");
    setup();
    fireEvent.click(screen.getByRole("button", { name: /EN|English|Inglés/ }));
    await waitFor(() => expect(i18n.language).toBe("en"));
    expect(window.localStorage.getItem("app_language")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(screen.getByText("EN")).toHaveAttribute("aria-pressed", "true");
  });

  it("switches back to ES and persists it", async () => {
    window.localStorage.setItem("app_language", "en");
    setup();
    await waitFor(() => expect(i18n.language).toBe("en"));
    fireEvent.click(screen.getByText("ES"));
    await waitFor(() => expect(i18n.language).toBe("es"));
    expect(window.localStorage.getItem("app_language")).toBe("es");
    expect(screen.getByText("ES")).toHaveAttribute("aria-pressed", "true");
  });
});
