import React, { useRef, useState } from "react";

type CollaboratorAvatarProps = {
  name: string;
  role?: string;
  photoUrl?: string;
  onPhotoChange?: (file: File) => void;
  size?: number;
};

/**
 * Avatar circolare del collaboratore con cornice fantasy-medievale minimale
 * nei due colori del brand Malastrana: bordeaux (#8B1E2D) e tiffany (#2FB6A6).
 * Include il controllo "Aggiungi/Modifica foto".
 */
export function CollaboratorAvatar({
  name,
  role,
  photoUrl = "/collab1.jpg",
  onPhotoChange,
  size = 128,
}: CollaboratorAvatarProps) {
  const [preview, setPreview] = useState<string>(photoUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onPhotoChange?.(file);
  };

  const hasPhoto = Boolean(preview);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Cornice esterna: doppio anello fantasy-medievale */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          style={{ filter: "drop-shadow(0 2px 6px rgba(139,30,45,0.25))" }}
        >
          <defs>
            <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B1E2D" />
              <stop offset="50%" stopColor="#2FB6A6" />
              <stop offset="100%" stopColor="#8B1E2D" />
            </linearGradient>
          </defs>

          {/* Anello principale */}
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="url(#frameGradient)"
            strokeWidth="2.5"
          />

          {/* Anello interno sottile */}
          <circle
            cx="50"
            cy="50"
            r="41"
            fill="none"
            stroke="#2FB6A6"
            strokeWidth="1"
            strokeOpacity="0.6"
          />

          {/* Quattro ornamenti a rombo minimal, stile medievale, alle 12-3-6-9 */}
          {[0, 90, 180, 270].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + 47 * Math.sin(rad);
            const cy = 50 - 47 * Math.cos(rad);
            return (
              <rect
                key={angle}
                x={cx - 3}
                y={cy - 3}
                width="6"
                height="6"
                fill={angle % 180 === 0 ? "#8B1E2D" : "#2FB6A6"}
                stroke="#F5EFE6"
                strokeWidth="0.5"
                transform={`rotate(45 ${cx} ${cy})`}
              />
            );
          })}
        </svg>

        {/* Foto circolare */}
        <div
          className="absolute overflow-hidden rounded-full bg-neutral-800"
          style={{
            top: "12%",
            left: "12%",
            width: "76%",
            height: "76%",
          }}
        >
          {hasPhoto ? (
            <img
              src={preview}
              alt={`Foto di ${name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white/70">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Pulsante Aggiungi/Modifica foto */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={hasPhoto ? "Modifica foto" : "Aggiungi foto"}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-105"
          style={{ background: "linear-gradient(135deg, #8B1E2D, #2FB6A6)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-neutral-900">{name}</p>
        {role && <p className="text-xs text-neutral-500">{role}</p>}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1 text-xs font-medium underline"
          style={{ color: "#8B1E2D" }}
        >
          {hasPhoto ? "Modifica foto" : "Aggiungi foto"}
        </button>
      </div>
    </div>
  );
}

export default CollaboratorAvatar;
