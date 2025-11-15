"use client";
import * as React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassModalProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  closeOnBackdrop?: boolean;
  title?: string;
  description?: string;
}

export function GlassModal({ trigger, children, className, open, onOpenChange, size = 'md', title, description }: GlassModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-transparent border-none p-0 shadow-none">
        {(title || description) && (
          <DialogHeader className="sr-only">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <AnimatePresence>
          { (open ?? true) && (
            <motion.div
              role="document"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'glass-card-dark w-[92vw] max-w-screen-md p-0 overflow-hidden',
                size === 'sm' && 'max-w-sm',
                size === 'lg' && 'max-w-3xl',
                size === 'xl' && 'max-w-5xl',
                className
              )}
            >
              {children}
            </motion.div>
          ) }
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default GlassModal;
