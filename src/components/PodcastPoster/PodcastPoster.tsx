"use client";

import { useState } from "react";
import Image from "next/image";
import { IMAGE_CONFIG, getVercelBlobUrl } from "@/lib/imageConfig";

interface PodcastPosterProps {
  imgFileName?: string | null;
  title: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function PodcastPoster({
  imgFileName,
  title,
  size = "medium",
  className = "",
}: PodcastPosterProps) {
  console.log("imgFileName", imgFileName);
  const [imageError, setImageError] = useState(false);
  const sizeClasses = {
    small: "w-16 h-24",
    medium: "w-32 h-48",
    large: "w-48 h-72",
  };

  if (!imgFileName || imageError) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gray-200 rounded-lg flex items-center justify-center ${className}`}
      >
        <span className="text-gray-500 text-xs text-center px-2">{title}</span>
      </div>
    );
  }

  // Construire l'URL Vercel Blob
  const imageUrl = getVercelBlobUrl(imgFileName);

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      <Image
        src={imageUrl}
        alt={`Poster de ${title}`}
        className="object-cover rounded-lg shadow-md"
        onError={() => setImageError(true)}
        width={75}
        height={100}
        loading="lazy"
        placeholder="blur"
        blurDataURL={IMAGE_CONFIG.defaultBlurDataURL}
        quality={IMAGE_CONFIG.defaultQuality}
      />
    </div>
  );
} 