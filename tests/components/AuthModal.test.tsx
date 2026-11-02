import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import i18n from "@/lib/i18n";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

import AuthPage from "@/app/auth/page";
import AuthModal from "@/components/Auth/AuthModal";
import { signIn } from "next-auth/react";

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

describe("Auth page", () => {
  it("renders lockup, tagline, email field and Continuar", () => {
    render(<AuthPage />);
    expect(screen.getByAltText("KKapp")).toBeInTheDocument();
    expect(screen.getByText("Encuentra baños cerca de ti")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("tu@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
  });

  it("renders divider, Google button, terms and guest link to '/'", () => {
    render(<AuthPage />);
    expect(screen.getByText("o")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar con Google/ })).toBeInTheDocument();
    expect(screen.getByText(/Al continuar aceptas los términos de uso/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar como invitado" })).toHaveAttribute("href", "/");
  });

  it("has no Apple button", () => {
    render(<AuthPage />);
    expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();
  });

  it("starts Google sign-in", () => {
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("button", { name: /Continuar con Google/ }));
    expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
  });
});

describe("AuthModal", () => {
  it("shows the same content and copy as the auth page, without Apple", () => {
    const onClose = vi.fn();
    render(<AuthModal open onClose={onClose} />);
    expect(screen.getByText("Encuentra baños cerca de ti")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("tu@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar con Google/ })).toBeInTheDocument();
    expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();
    const guest = screen.getByRole("link", { name: "Continuar como invitado" });
    expect(guest).toHaveAttribute("href", "/");
    fireEvent.click(guest);
    expect(onClose).toHaveBeenCalled();
  });
});
