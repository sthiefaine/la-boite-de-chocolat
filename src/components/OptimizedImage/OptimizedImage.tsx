"use client";

import Image from "next/image";
import { useState } from "react";
import { IMAGE_CONFIG } from "@/lib/imageConfig";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onError?: () => void;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className = "",
  priority = false,
  quality = IMAGE_CONFIG.defaultQuality,
  placeholder = "blur",
  blurDataURL,
  onError,
  fallbackSrc = "/images/navet.png"
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = () => {
    if (!imageError && currentSrc !== fallbackSrc) {
      setImageError(true);
      setCurrentSrc(fallbackSrc);
      onError?.();
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      quality={quality}
      loading={priority ? "eager" : "lazy"}
      placeholder={placeholder}
      blurDataURL={blurDataURL || IMAGE_CONFIG.defaultBlurDataURL}
      onError={handleError}
    />
  );
} 