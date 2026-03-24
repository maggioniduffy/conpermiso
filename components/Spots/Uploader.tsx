"use client";

import { AlertCircleIcon, ImageUpIcon, XIcon } from "lucide-react";
import { useFileUpload } from "@/hooks";
import { useEffect, useMemo } from "react";

interface Props {
  onChange?: (files: File[]) => void;
  maxFiles?: number; // ✅ nuevo
}

export default function Uploader({ onChange, maxFiles = 5 }: Props) {
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
    multiple: true,
  });

  const inputProps = getInputProps();

  // ✅ limitar archivos
  const limitedFiles = useMemo(() => {
    return files.slice(0, maxFiles);
  }, [files, maxFiles]);

  // ✅ enviar al parent SOLO los permitidos
  useEffect(() => {
    onChange?.(limitedFiles.map((f) => f.file as File));
  }, [limitedFiles]);

  const isMaxReached = files.length >= maxFiles;

  return (
    <div className="flex flex-col gap-2 bg-mywhite">
      <div className="relative">
        {/* DROP ZONE */}
        <div
          role="button"
          onClick={() => !isMaxReached && openFileDialog()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={(e) => {
            if (isMaxReached) return;
            handleDrop(e);
          }}
          data-dragging={isDragging || undefined}
          className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 relative flex min-h-40 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors"
        >
          <input
            {...inputProps}
            onChange={(e) => {
              inputProps.onChange?.(e);
              if (e.target.files) {
                const newFiles = Array.from(e.target.files).slice(
                  0,
                  maxFiles - files.length,
                );
                onChange?.(newFiles);
              }
            }}
            className="sr-only"
            type="file"
            name="files"
            multiple
          />

          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div className="bg-background mb-2 flex size-11 items-center justify-center rounded-full border">
              <ImageUpIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">
              {isMaxReached
                ? "Máximo alcanzado"
                : "Arrastrá imágenes o hacé click"}
            </p>
            <p className="text-muted-foreground text-xs">
              Máx {maxFiles} imágenes · {maxSizeMB}MB c/u
            </p>
          </div>
        </div>
      </div>

      {/* PREVIEW */}
      {limitedFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {limitedFiles.map((f) => (
            <div
              key={f.id}
              className="relative aspect-square rounded-xl overflow-hidden"
            >
              <img
                src={f.preview}
                alt={f.file?.name}
                className="w-full h-full object-cover"
              />

              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="absolute top-1 right-1 size-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* errores */}
      {(errors.length > 0 || files.length > maxFiles) && (
        <div className="text-destructive flex items-center gap-1 text-xs">
          <AlertCircleIcon className="size-3" />
          <span>
            {errors[0] ||
              `Máximo ${maxFiles} imágenes permitidas (${files.length}/${maxFiles})`}
          </span>
        </div>
      )}
    </div>
  );
}
