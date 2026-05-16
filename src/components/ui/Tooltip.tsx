"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  delay?: number;
}

export function Tooltip({ content, children, position = "top", className, delay = 200 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    setIsVisible(false);
  };

  const positionMap = {
    top: { bottom: "calc(100% + 8px)", left: "50%", x: "-50%", y: 0 },
    bottom: { top: "calc(100% + 8px)", left: "50%", x: "-50%", y: 0 },
    left: { right: "calc(100% + 8px)", top: "50%", x: 0, y: "-50%" },
    right: { left: "calc(100% + 8px)", top: "50%", x: 0, y: "-50%" },
  };

  const pos = positionMap[position];

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: position === "top" ? 4 : position === "bottom" ? -4 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === "top" ? 4 : position === "bottom" ? -4 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn(
              "absolute z-[200] pointer-events-none",
              "max-w-[220px] px-3 py-2",
              "bg-slate-900 text-white text-xs leading-relaxed",
              "rounded-lg shadow-xl",
              "whitespace-normal text-center",
              className
            )}
            style={{
              ...pos,
              transform: `translate(${pos.x}, ${pos.y})`,
            }}
          >
            {content}
            <div
              className={cn(
                "absolute w-2 h-2 bg-slate-900 rotate-45",
                position === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
                position === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
                position === "left" && "right-[-4px] top-1/2 -translate-y-1/2",
                position === "right" && "left-[-4px] top-1/2 -translate-y-1/2"
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
