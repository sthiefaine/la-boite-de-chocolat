"use client";

import { useState } from "react";
import Image from "next/image";

interface FilmPosterProps {
  imgFileName?: string | null;
  title: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function FilmPoster({
  imgFileName,
  title,
  size = "medium",
  className = "",
}: FilmPosterProps) {
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
  const imageUrl = `https://cz2cmm85bs9kxtd7.public.blob.vercel-storage.com/${imgFileName}`;

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      <Image
        src={imageUrl}
        alt={`Poster de ${title}`}
        className="object-cover rounded-lg shadow-md"
        onError={() => setImageError(true)}
        width={75}
        height={100}
      />
    </div>
  );
}
