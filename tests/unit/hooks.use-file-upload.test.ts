import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFileUpload, { formatBytes } from "@/hooks/use-file-upload";

// ── formatBytes ───────────────────────────────────────────────────────────────
describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("formats bytes (no space between number and unit)", () => {
    expect(formatBytes(500)).toBe("500Bytes");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1024 * 1024)).toBe("1MB");
  });

  it("respects decimal places", () => {
    expect(formatBytes(1500, 1)).toBe("1.5KB");
  });
});

// ── helpers ───────────────────────────────────────────────────────────────────
function makeFile(name: string, size: number, type = "image/jpeg"): File {
  const file = new File(["x".repeat(size)], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

// ── useFileUpload ─────────────────────────────────────────────────────────────
describe("useFileUpload", () => {
  it("initialises with empty files and no errors", () => {
    const { result } = renderHook(() => useFileUpload());
    const [state] = result.current;
    expect(state.files).toHaveLength(0);
    expect(state.errors).toHaveLength(0);
    expect(state.isDragging).toBe(false);
  });

  it("initialises with provided initialFiles", () => {
    const { result } = renderHook(() =>
      useFileUpload({
        initialFiles: [
          { id: "1", name: "img.jpg", size: 100, type: "image/jpeg", url: "blob:x" },
        ],
      }),
    );
    const [state] = result.current;
    expect(state.files).toHaveLength(1);
    expect(state.files[0].id).toBe("1");
  });

  it("adds a valid file", () => {
    const { result } = renderHook(() => useFileUpload({ multiple: true }));
    const file = makeFile("photo.jpg", 1000);
    act(() => {
      result.current[1].addFiles([file]);
    });
    const [state] = result.current;
    expect(state.files).toHaveLength(1);
    expect(state.files[0].file).toBe(file);
  });

  it("rejects a file that exceeds maxSize", () => {
    const { result } = renderHook(() =>
      useFileUpload({ maxSize: 100, multiple: true }),
    );
    const big = makeFile("big.jpg", 200);
    act(() => {
      result.current[1].addFiles([big]);
    });
    const [state] = result.current;
    expect(state.files).toHaveLength(0);
    expect(state.errors.length).toBeGreaterThan(0);
  });

  it("rejects a file with unaccepted MIME type", () => {
    const { result } = renderHook(() =>
      useFileUpload({ accept: "image/*", multiple: true }),
    );
    const pdf = makeFile("doc.pdf", 100, "application/pdf");
    act(() => {
      result.current[1].addFiles([pdf]);
    });
    const [state] = result.current;
    expect(state.files).toHaveLength(0);
    expect(state.errors.length).toBeGreaterThan(0);
  });

  it("skips duplicate files in multiple mode", () => {
    const { result } = renderHook(() => useFileUpload({ multiple: true }));
    const file = makeFile("photo.jpg", 1000);
    act(() => { result.current[1].addFiles([file]); });
    act(() => { result.current[1].addFiles([file]); });
    expect(result.current[0].files).toHaveLength(1);
  });

  it("respects maxFiles limit", () => {
    const { result } = renderHook(() =>
      useFileUpload({ multiple: true, maxFiles: 2 }),
    );
    const files = [
      makeFile("a.jpg", 100),
      makeFile("b.jpg", 100),
      makeFile("c.jpg", 100),
    ];
    act(() => { result.current[1].addFiles(files); });
    const [state] = result.current;
    expect(state.errors.length).toBeGreaterThan(0);
    expect(state.files).toHaveLength(0);
  });

  it("removes a file by id", () => {
    const { result } = renderHook(() => useFileUpload({ multiple: true }));
    const file = makeFile("photo.jpg", 100);
    act(() => { result.current[1].addFiles([file]); });
    const id = result.current[0].files[0].id;
    act(() => { result.current[1].removeFile(id); });
    expect(result.current[0].files).toHaveLength(0);
  });

  it("clears all files", () => {
    const { result } = renderHook(() => useFileUpload({ multiple: true }));
    act(() => { result.current[1].addFiles([makeFile("a.jpg", 100)]); });
    act(() => { result.current[1].addFiles([makeFile("b.jpg", 100)]); });
    act(() => { result.current[1].clearFiles(); });
    expect(result.current[0].files).toHaveLength(0);
  });

  it("clears errors", () => {
    const { result } = renderHook(() =>
      useFileUpload({ maxSize: 10, multiple: true }),
    );
    act(() => { result.current[1].addFiles([makeFile("big.jpg", 100)]); });
    expect(result.current[0].errors.length).toBeGreaterThan(0);
    act(() => { result.current[1].clearErrors(); });
    expect(result.current[0].errors).toHaveLength(0);
  });

  it("replaces the file in single-file mode", () => {
    const { result } = renderHook(() => useFileUpload({ multiple: false }));
    act(() => { result.current[1].addFiles([makeFile("first.jpg", 100)]); });
    act(() => { result.current[1].addFiles([makeFile("second.jpg", 100)]); });
    expect(result.current[0].files).toHaveLength(1);
    expect((result.current[0].files[0].file as File).name).toBe("second.jpg");
  });

  it("sets isDragging on dragEnter and clears on dragLeave", () => {
    const { result } = renderHook(() => useFileUpload());
    const fakeEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      relatedTarget: null,
      currentTarget: { contains: () => false },
    } as unknown as React.DragEvent<HTMLElement>;

    act(() => { result.current[1].handleDragEnter(fakeEvent); });
    expect(result.current[0].isDragging).toBe(true);

    act(() => { result.current[1].handleDragLeave(fakeEvent); });
    expect(result.current[0].isDragging).toBe(false);
  });

  it("getInputProps returns correct props", () => {
    const { result } = renderHook(() =>
      useFileUpload({ accept: "image/*", multiple: true }),
    );
    const props = result.current[1].getInputProps();
    expect(props.type).toBe("file");
    expect(props.accept).toBe("image/*");
    expect(props.multiple).toBe(true);
  });

  it("calls onFilesChange callback when files are added", () => {
    const onFilesChange = vi.fn();
    const { result } = renderHook(() =>
      useFileUpload({ multiple: true, onFilesChange }),
    );
    act(() => { result.current[1].addFiles([makeFile("a.jpg", 100)]); });
    expect(onFilesChange).toHaveBeenCalled();
  });

  it("calls onFilesAdded callback with newly added files", () => {
    const onFilesAdded = vi.fn();
    const { result } = renderHook(() =>
      useFileUpload({ multiple: true, onFilesAdded }),
    );
    const file = makeFile("a.jpg", 100);
    act(() => { result.current[1].addFiles([file]); });
    expect(onFilesAdded).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ file })]),
    );
  });
});
