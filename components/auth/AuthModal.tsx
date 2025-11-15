'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CuteLampLogin } from './CuteLampLogin';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ open, onOpenChange, defaultMode = 'login' }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 border-0 bg-transparent overflow-hidden">
        <CuteLampLogin />
      </DialogContent>
    </Dialog>
  );
}
