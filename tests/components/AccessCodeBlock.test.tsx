import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
}));
vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/hooks", () => ({ useBackendUser: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import i18n from "@/lib/i18n";
import { apiFetch } from "@/lib/apiFetch";
import { useBackendUser } from "@/hooks";
import { AccessCodeBlock } from "@/components/Spots/AccessCodeBlock";
import { Bath } from "@/utils/models";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;
const mockUser = useBackendUser as ReturnType<typeof vi.fn>;

const baseBath = { _id: "b1", name: "Baño" } as Bath;

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

beforeEach(() => {
  push.mockReset();
  mockApiFetch.mockReset();
  mockUser.mockReturnValue({ user: { _id: "u1" }, loading: false });
});

describe("AccessCodeBlock", () => {
  it("shows only the '¿Pide código?' action when the bath does not require a code", () => {
    render(<AccessCodeBlock bath={baseBath} />);
    expect(screen.queryByTestId("access-code-block")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "¿Pide código?" })).toBeInTheDocument();
  });

  it("treats an absent requiresCode (OSM / old baths) as not requiring a code", () => {
    render(<AccessCodeBlock bath={{ ...baseBath, requiresCode: undefined }} />);
    expect(screen.queryByTestId("access-code-block")).not.toBeInTheDocument();
  });

  it("shows the current code and the date it was added", () => {
    render(
      <AccessCodeBlock
        bath={{
          ...baseBath,
          requiresCode: true,
          accessCode: "4821",
          accessCodeUpdatedAt: "2025-03-15T12:00:00.000Z",
        }}
      />,
    );
    expect(screen.getByTestId("access-code-value")).toHaveTextContent("4821");
    expect(screen.getByTestId("access-code-added-on")).toHaveTextContent(
      /Añadido el \d{2}\/\d{2}\/2025/,
    );
    expect(screen.getByRole("button", { name: "Actualizar código" })).toBeInTheDocument();
  });

  it("shows the 'unknown' copy when a code is required but not known", () => {
    render(<AccessCodeBlock bath={{ ...baseBath, requiresCode: true, accessCode: null }} />);
    expect(screen.getByText("Requiere código. Pídelo en el local.")).toBeInTheDocument();
    expect(screen.queryByTestId("access-code-value")).not.toBeInTheDocument();
    expect(screen.queryByTestId("access-code-added-on")).not.toBeInTheDocument();
  });

  it("sends guests to /auth instead of opening the sheet", () => {
    mockUser.mockReturnValue({ user: null, loading: false });
    render(<AccessCodeBlock bath={baseBath} />);
    fireEvent.click(screen.getByTestId("access-code-update-btn"));
    expect(push).toHaveBeenCalledWith("/auth");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lets a logged-in user update the code via PATCH /baths/:id/access-code", async () => {
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          requiresCode: true,
          accessCode: "9999",
          accessCodeUpdatedAt: "2025-04-01T12:00:00.000Z",
        }),
    });
    const onUpdated = vi.fn();
    render(<AccessCodeBlock bath={baseBath} onUpdated={onUpdated} />);

    fireEvent.click(screen.getByTestId("access-code-update-btn"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("access-code-switch"));
    fireEvent.change(screen.getByTestId("access-code-input"), {
      target: { value: " 9999 " },
    });
    fireEvent.click(screen.getByTestId("access-code-save-btn"));

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(1));
    const [url, init] = mockApiFetch.mock.calls[0];
    expect(url).toBe("/baths/b1/access-code");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ requiresCode: true, accessCode: "9999" });

    await waitFor(() => expect(onUpdated).toHaveBeenCalled());
    expect(onUpdated.mock.calls[0][0]).toMatchObject({
      requiresCode: true,
      accessCode: "9999",
    });
    // the block now shows the new code and the sheet is closed
    expect(await screen.findByTestId("access-code-value")).toHaveTextContent("9999");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sends accessCode null when the toggle is off", async () => {
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ requiresCode: false, accessCode: null }),
    });
    render(
      <AccessCodeBlock bath={{ ...baseBath, requiresCode: true, accessCode: "1111" }} />,
    );
    fireEvent.click(screen.getByTestId("access-code-update-btn"));
    fireEvent.click(screen.getByTestId("access-code-switch"));
    fireEvent.click(screen.getByTestId("access-code-save-btn"));

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());
    expect(JSON.parse(mockApiFetch.mock.calls[0][1].body)).toEqual({
      requiresCode: false,
      accessCode: null,
    });
  });

  it("keeps the sheet open when the backend rejects the update", async () => {
    mockApiFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "nope" }),
    });
    render(<AccessCodeBlock bath={baseBath} />);
    fireEvent.click(screen.getByTestId("access-code-update-btn"));
    fireEvent.click(screen.getByTestId("access-code-save-btn"));
    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
