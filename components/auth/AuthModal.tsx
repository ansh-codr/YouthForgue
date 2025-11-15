'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Lock, Github, Apple } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ open, onOpenChange, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const action = mode === 'login' ? signIn : signUp;
    const result = await action(email, password);
    setLoading(false);

    if (result.success) {
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account ready.');
      onOpenChange(false);
      setEmail('');
      setPassword('');
    } else {
      toast.error(result.error || 'Authentication failed');
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const response = await signInWithGoogle();
    setLoading(false);
    if (response.success) {
      toast.success('Signed in with Google');
      onOpenChange(false);
    } else {
      toast.error(response.error || 'Google sign-in failed');
    }
  };

  const handleSoon = (provider: string) => {
    toast.info(`${provider} SSO coming soon`, {
      description: 'Reach out to support to enable this provider early.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-[#080c1b]/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-white">{mode === 'login' ? 'Welcome back' : 'Create access'}</DialogTitle>
          <DialogDescription className="text-white/60">
            {mode === 'login'
              ? 'Authenticate with your workspace credentials.'
              : 'Provision a new secure identity for your workspace.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-white/80">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm text-white/80">
              <Mail className="h-4 w-4 text-white/60" /> Email
            </Label>
            <Input
              type="email"
              placeholder="you@youthforge.studio"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm text-white/80">
              <Lock className="h-4 w-4 text-white/60" /> Password
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#2FD8A5] to-[#0EA27B] text-base font-semibold text-white shadow-[0_14px_35px_rgba(14,162,123,0.4)]"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {mode === 'login' ? 'Login' : 'Create account'}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/40">
          <span className="h-px flex-1 bg-white/10" /> Or continue with <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <Button type="button" variant="outline" disabled={loading} onClick={handleGoogle} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            G
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={() => handleSoon('GitHub')} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Github className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={() => handleSoon('Apple')} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Apple className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center text-sm text-white/60">
          {mode === 'login' ? (
            <>Need an account? <button className="text-white" onClick={() => setMode('signup')}>Create one</button></>
          ) : (
            <>Already onboarded? <button className="text-white" onClick={() => setMode('login')}>Sign in</button></>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
