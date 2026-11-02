import React, { useState } from 'react';
import { Layers } from 'lucide-react';

type ImageOrientation = 'landscape' | 'portrait' | 'square';

interface AdaptiveProjectImageProps {
  src?: string | null;
  alt: string;
  /** Tallest allowed ratio (width / height). Keeps tall phone screenshots from dominating the page. */
  minRatio?: number;
  /** Widest allowed ratio (width / height). */
  maxRatio?: number;
  className?: string;
  imgClassName?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  onScaleDetected?: (scale: 'mobile' | 'desktop', ratio: number) => void;
}

const DEFAULT_RATIO = 16 / 9;

function getOrientation(ratio: number): ImageOrientation {
  if (ratio > 1.1) return 'landscape';
  if (ratio < 0.9) return 'portrait';
  return 'square';
}

/**
 * Renders a project screenshot at its natural orientation.
 * Mobile (portrait) and desktop (landscape) captures each get a frame that matches
 * their real aspect ratio, so nothing is awkwardly cropped. The full image is shown
 * with object-contain over a blurred copy of itself so the frame always fills.
 */
export const AdaptiveProjectImage: React.FC<AdaptiveProjectImageProps> = ({
  src,
  alt,
  minRatio = 0.72,
  maxRatio = 21 / 9,
  className = '',
  imgClassName = '',
  onClick,
  children,
  onScaleDetected,
}) => {
  const [ratio, setRatio] = useState<number>(DEFAULT_RATIO);
  const [failed, setFailed] = useState(false);

  const clamped = Math.min(Math.max(ratio, minRatio), maxRatio);
  const orientation = getOrientation(ratio);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      onClick={onClick}
      data-orientation={showImage ? orientation : undefined}
      style={{ aspectRatio: String(showImage ? clamped : DEFAULT_RATIO) }}
      className={`relative w-full overflow-hidden bg-[#141419] transition-[aspect-ratio] duration-300 ${className}`}
    >
      {showImage ? (
        <>
          {/* Blurred fill so letterboxed edges never show empty space */}
          <img
            src={src!}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
          />
          <img
            src={src!}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={(e) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth > 0 && naturalHeight > 0) {
                const r = naturalWidth / naturalHeight;
                setRatio(r);
                onScaleDetected?.(r < 1.0 ? 'mobile' : 'desktop', r);
              }
            }}
            onError={() => setFailed(true)}
            className={`relative w-full h-full object-contain ${imgClassName}`}
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#5a5a66] bg-grid-pattern">
          <Layers className="w-10 h-10" />
        </div>
      )}
      {children}
    </div>
  );
};
