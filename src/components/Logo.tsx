"use client";

import Image from "next/image";
import { useState } from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>C8</span>
      </div>
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="Core829 SRL"
      width={size}
      height={size}
      className={className}
      onError={() => setHasError(true)}
      priority
    />
  );
}
