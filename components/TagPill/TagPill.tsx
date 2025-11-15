"use client";
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

export interface TagPillProps {
  label: string;
  onRemove?: () => void;
  color?: string; // hex or tailwind token
  interactive?: boolean;
  className?: string;
}

export const TagPill: React.FC<TagPillProps> = ({ label, onRemove, color, interactive = true, className }) => {
  return (
    <motion.span
      layout
      whileHover={interactive ? { y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      tabIndex={0}
      aria-label={`Tag: ${label}`}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm select-none focus:outline-none focus:ring-2 focus:ring-accent/50',
        'bg-white/10 border-white/20 text-foreground',
        interactive && 'cursor-pointer hover:bg-white/20',
        className
      )}
      style={color ? { backgroundColor: color + '22', borderColor: color + '55', color } : undefined}
    >
      {label}
      {onRemove && (
        <button
          aria-label={`Remove ${label}`}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-0.5 rounded-full hover:bg-black/20 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <X size={12} />
        </button>
      )}
    </motion.span>
  );
};

export default TagPill;
