import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/hooks", () => ({
  useBackendUser: vi.fn(),
}));

// Slider mock — renders an input range for simplicity
vi.mock("@/components/ui/slider", () => ({
  Slider: ({ value, onValueChange, "aria-label": ariaLabel }: any) => (
    <input
      type="range"
      min={1}
      max={5}
      value={value[0]}
      aria-label={ariaLabel}
      onChange={(e) => onValueChange([Number(e.target.value)])}
    />
  ),
}));

import RankSpot from "@/components/Spots/RankSpot";
import { apiFetch } from "@/lib/apiFetch";
import { useBackendUser } from "@/hooks";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;
const mockUseBackendUser = useBackendUser as ReturnType<typeof vi.fn>;

describe("RankSpot", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("renders nothing when user is not logged in", () => {
    mockUseBackendUser.mockReturnValue({ user: null });
    const { container } = render(
      <RankSpot bathId="b1" alreadyReviewed={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders already-reviewed state when alreadyReviewed is true", () => {
    mockUseBackendUser.mockReturnValue({ user: { _id: "u1" } });
    render(<RankSpot bathId="b1" alreadyReviewed={true} />);
    expect(screen.getByText("Ya valoraste este baño")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Enviar/i })).not.toBeInTheDocument();
  });

  it("renders rating form for authenticated user who hasn't reviewed", () => {
    mockUseBackendUser.mockReturnValue({ user: { _id: "u1" } });
    render(<RankSpot bathId="b1" alreadyReviewed={false} />);
    expect(screen.getByRole("button", { name: /Enviar valoración/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Valoración" })).toBeInTheDocument();
  });

  it("renders emoji labels", () => {
    mockUseBackendUser.mockReturnValue({ user: { _id: "u1" } });
    render(<RankSpot bathId="b1" alreadyReviewed={false} />);
    expect(screen.getByText("Mala")).toBeInTheDocument();
    expect(screen.getByText("Excelente")).toBeInTheDocument();
  });

  it("submits review and calls onReviewed on success", async () => {
    mockUseBackendUser.mockReturnValue({ user: { _id: "u1" } });
    mockApiFetch.mockResolvedValue({ ok: true, status: 200 });
    const onReviewed = vi.fn();

    render(<RankSpot bathId="b1" alreadyReviewed={false} onReviewed={onReviewed} />);
    fireEvent.click(screen.getByRole("button", { name: /Enviar valoración/i }));

    await waitFor(() => expect(onReviewed).toHaveBeenCalledOnce());
    expect(mockApiFetch).toHaveBeenCalledWith("/reviews", expect.objectContaining({ method: "POST" }));
  });

  it("shows error message on API failure", async () => {
    mockUseBackendUser.mockReturnValue({ user: { _id: "u1" } });
    mockApiFetch.mockRejectedValue(new Error("network"));

    render(<RankSpot bathId="b1" alreadyReviewed={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Enviar valoración/i }));

    await waitFor(() =>
      expect(screen.getByText(/Hubo un error al enviar tu valoración/i)).toBeInTheDocument()
    );
  });

  it("calls onReviewed and shows error when status 400 (duplicate)", async () => {
    mockUseBackendUser.mockReturnValue({ user: { _id: "u1" } });
    mockApiFetch.mockResolvedValue({
      status: 400,
      json: () => Promise.resolve({ message: "Ya valoraste este baño" }),
    });
    const onReviewed = vi.fn();

    render(<RankSpot bathId="b1" alreadyReviewed={false} onReviewed={onReviewed} />);
    fireEvent.click(screen.getByRole("button", { name: /Enviar valoración/i }));

    await waitFor(() => expect(onReviewed).toHaveBeenCalledOnce());
    expect(screen.getByText("Ya valoraste este baño")).toBeInTheDocument();
  });

  it("shows 'Enviando...' while the request is in flight", async () => {
    mockUseBackendUser.mockReturnValue({ user: { _id: "u1" } });
    let resolveCall!: (v: any) => void;
    mockApiFetch.mockReturnValue(new Promise((res) => { resolveCall = res; }));

    render(<RankSpot bathId="b1" alreadyReviewed={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Enviar valoración/i }));

    expect(await screen.findByText("Enviando...")).toBeInTheDocument();
    resolveCall({ ok: true, status: 200 });
  });

  it("allows typing in the optional comment textarea", () => {
    mockUseBackendUser.mockReturnValue({ user: { _id: "u1" } });
    render(<RankSpot bathId="b1" alreadyReviewed={false} />);
    const textarea = screen.getByPlaceholderText(/Contanos tu experiencia/i);
    fireEvent.change(textarea, { target: { value: "Muy limpio!" } });
    expect(textarea).toHaveValue("Muy limpio!");
  });
});
