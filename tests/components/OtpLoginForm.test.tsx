import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import OtpLoginForm from "@/components/Auth/OtpLoginForm";
import { signIn } from "next-auth/react";
import { apiFetch } from "@/lib/apiFetch";

vi.mock("@/lib/apiFetch", () => ({
  apiFetch: vi.fn(),
}));

describe("OtpLoginForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email step initially", () => {
    render(<OtpLoginForm />);
    expect(screen.getByPlaceholderText("tu@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument();
  });

  it("shows error for invalid email", async () => {
    render(<OtpLoginForm />);
    const input = screen.getByPlaceholderText("tu@email.com");
    fireEvent.change(input, { target: { value: "invalidemail" } });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Ingresá un email válido.")).toBeInTheDocument();
    });
  });

  it("sends OTP and transitions to OTP step on valid email", async () => {
    (apiFetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Código enviado" }),
    });

    render(<OtpLoginForm />);
    const input = screen.getByPlaceholderText("tu@email.com");
    fireEvent.change(input, { target: { value: "test@example.com" } });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("auth/otp/send", expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "test@example.com" }),
      }));
      expect(screen.getByText("Revisá tu email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("123456")).toBeInTheDocument();
    });
  });

  it("verifies 6-digit OTP code successfully", async () => {
    (apiFetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Código enviado" }),
    });
    (signIn as any).mockResolvedValueOnce({ ok: true, error: null });

    const onSuccess = vi.fn();
    render(<OtpLoginForm onSuccess={onSuccess} />);

    // Step 1
    const emailInput = screen.getByPlaceholderText("tu@email.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.submit(emailInput.closest("form")!);

    // Wait for step 2
    await waitFor(() => {
      expect(screen.getByPlaceholderText("123456")).toBeInTheDocument();
    });

    // Step 2
    const codeInput = screen.getByPlaceholderText("123456");
    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.submit(codeInput.closest("form")!);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        code: "123456",
        redirect: false,
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows error on invalid OTP code", async () => {
    (apiFetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Código enviado" }),
    });
    (signIn as any).mockResolvedValueOnce({ ok: false, error: "CredentialsSignin" });

    render(<OtpLoginForm />);

    // Step 1
    const emailInput = screen.getByPlaceholderText("tu@email.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("123456")).toBeInTheDocument();
    });

    // Step 2
    const codeInput = screen.getByPlaceholderText("123456");
    fireEvent.change(codeInput, { target: { value: "000000" } });
    fireEvent.submit(codeInput.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Código inválido o expirado.")).toBeInTheDocument();
    });
  });

  it("allows going back to email step when clicking 'Usar otro email'", async () => {
    (apiFetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Código enviado" }),
    });

    render(<OtpLoginForm />);

    const emailInput = screen.getByPlaceholderText("tu@email.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Usar otro email")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Usar otro email"));

    expect(screen.getByPlaceholderText("tu@email.com")).toBeInTheDocument();
  });
});
