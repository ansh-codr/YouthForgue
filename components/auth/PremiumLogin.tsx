'use client';

import { useMemo, useState } from 'react';
import { Github, Apple, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const themeConfigs = {
  minimal: {
    label: 'Minimal Luxe',
    heroGradient: 'linear-gradient(135deg,#0B1221 0%,#05070f 60%,#090d18 100%)',
    accent: '#62E2FF',
    accentSoft: '#C9F6FF',
    glow: '0 25px 65px rgba(98,226,255,0.32)',
    cardBackground: 'linear-gradient(180deg,rgba(9,11,22,0.85),rgba(6,9,18,0.95))',
    borderColor: 'rgba(255,255,255,0.08)',
    badge: 'rgba(76,201,240,0.12)',
  },
  futuristic: {
    label: 'Futuristic Neon',
    heroGradient: 'linear-gradient(135deg,#0a0b1e 0%,#031b2b 55%,#012f3f 100%)',
    accent: '#0EA27B',
    accentSoft: '#2FD8A5',
    glow: '0 25px 70px rgba(14,162,123,0.4)',
    cardBackground: 'linear-gradient(180deg,rgba(6,17,24,0.9),rgba(6,12,18,0.98))',
    borderColor: 'rgba(14,162,123,0.22)',
    badge: 'rgba(14,162,123,0.18)',
  },
  luxe: {
    label: 'Gradient Luxury',
    heroGradient: 'linear-gradient(140deg,#160909 0%,#271330 55%,#081726 100%)',
    accent: '#FF8C6B',
    accentSoft: '#FFC2AE',
    glow: '0 25px 70px rgba(255,140,107,0.42)',
    cardBackground: 'linear-gradient(180deg,rgba(19,11,26,0.92),rgba(6,7,16,0.98))',
    borderColor: 'rgba(255,140,107,0.18)',
    badge: 'rgba(255,140,107,0.16)',
  },
} as const;

type ThemeKey = keyof typeof themeConfigs;

const metrics = [
  { label: 'Global teams', value: '4,200+' },
  { label: 'Avg. uptime', value: '99.998%' },
  { label: 'Response time', value: '142ms' },
];

const googleGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.4-.6 2.4-1.4 3.2-.9.8-2 1.3-3.5 1.3-1.7 0-3.2-.6-4.2-1.9-1-1.2-1.6-2.9-1.6-4.8s.5-3.5 1.6-4.8c1-1.3 2.5-1.9 4.2-1.9 1.8 0 3.2.6 4.3 1.7l2.8-2.8c-1.9-1.8-4.3-2.7-7.2-2.7-2.9 0-5.4 1-7.2 3C3.8 7.1 2.9 9.4 2.9 12s.9 4.9 2.6 6.9c1.8 2 4.3 3 7.2 3 2.4 0 4.5-.8 6.1-2.4 1.7-1.6 2.6-3.8 2.6-6.6 0-.6 0-1.1-.1-1.5H12z" />
  </svg>
);

export function PremiumLogin() {
  const [theme, setTheme] = useState<ThemeKey>('futuristic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  const { signIn, signInWithGoogle } = useAuth();
  const activeTheme = useMemo(() => themeConfigs[theme], [theme]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Fill in your credentials to continue.');
      return;
    }
    setSubmitting(true);
    const response = await signIn(email, password);
    setSubmitting(false);
    if (response.success) {
      toast.success('Welcome back.');
    } else {
      toast.error(response.error || 'Unable to sign you in.');
    }
  };

  const handleSocial = async (provider: 'google' | 'github' | 'apple') => {
    if (provider === 'google') {
      setPendingProvider('google');
      const response = await signInWithGoogle();
      setPendingProvider(null);
      if (response.success) {
        toast.success('Signed in with Google.');
      } else {
        toast.error(response.error || 'Google sign-in failed');
      }
      return;
    }

    const label = provider === 'github' ? 'GitHub' : 'Apple';
    toast.info(`${label} SSO arriving soon`, {
      description: 'Ask your administrator to enable this provider.',
    });
  };

  return (
    <div className="relative min-h-screen bg-[#03060F] py-16 px-6 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full blur-3xl opacity-60" style={{ background: activeTheme.accentSoft }} />
        <div className="absolute top-48 -left-20 h-80 w-80 rounded-full blur-[120px] opacity-50" style={{ background: 'rgba(102,126,234,0.35)' }} />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row">
        <section
          className="rounded-[32px] p-10 flex-1 border border-white/5 relative overflow-hidden"
          style={{ background: activeTheme.heroGradient }}
        >
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 45%)' }} />
          <div className="relative flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-semibold"
                style={{ background: activeTheme.badge, color: activeTheme.accent }}
              >
                YF
              </div>
              <div>
                <p className="uppercase tracking-[0.35em] text-xs text-white/60">YouthForge ID</p>
                <p className="text-lg font-semibold">Identity Cloud</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.5em] text-white/60">
                <ShieldCheck className="h-4 w-4 text-white/70" />
                Enterprise Zero-Trust Access
              </div>
              <h1 className="text-4xl lg:text-5xl font-semibold leading-tight max-w-xl">
                Seamless authentication for teams that can&apos;t afford friction.
              </h1>
              <p className="text-white/70 max-w-lg">
                Precision-crafted login experiences with adaptive MFA, intelligent risk scoring, and real-time observability baked in.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl bg-white/5 p-4 border border-white/5 backdrop-blur">
                  <p className="text-sm text-white/60">{metric.label}</p>
                  <p className="text-2xl font-semibold" style={{ color: activeTheme.accent }}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Art Direction</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(themeConfigs).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key as ThemeKey)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      theme === key
                        ? 'bg-white/15 border-white/60'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    style={theme === key ? { boxShadow: activeTheme.glow } : undefined}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute right-10 bottom-10 flex items-center gap-2 text-sm text-white/70">
            <Sparkles className="h-4 w-4" />
            <span>Switch palettes to preview live branding directions.</span>
          </div>
        </section>

        <section className="flex-1 max-w-xl mx-auto w-full">
          <div
            className="rounded-[28px] border p-10 backdrop-blur-2xl shadow-2xl"
            style={{ background: activeTheme.cardBackground, borderColor: activeTheme.borderColor, boxShadow: activeTheme.glow }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.45em] text-white/50">Welcome</p>
                <h2 className="text-3xl font-semibold mt-2">Enter your command center</h2>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white/90 transition"
              >
                <ArrowUpRight className="h-4 w-4" />
                Need help?
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Work email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@youthforge.studio"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.25)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.25)]"
                />
                <div className="flex justify-between text-sm text-white/60">
                  <button type="button" className="text-white/80 hover:text-white">Forgot Password?</button>
                  <span>Reset link in under 30s</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="relative w-full rounded-2xl py-4 text-lg font-semibold shadow-[0_20px_45px_rgba(10,171,123,0.35)] transition disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.accent}, ${activeTheme.accentSoft})`,
                  color: theme === 'minimal' ? '#06101c' : '#ffffff',
                }}
              >
                {submitting ? 'Authenticating…' : 'Login'}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4 text-white/50 text-sm">
              <span className="h-px flex-1 bg-white/10" />
              Or continue with
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { key: 'google', label: 'Google', icon: googleGlyph },
                { key: 'github', label: 'GitHub', icon: <Github className="h-4 w-4" /> },
                { key: 'apple', label: 'Apple', icon: <Apple className="h-4 w-4" /> },
              ].map((provider) => (
                <button
                  key={provider.key}
                  type="button"
                  onClick={() => handleSocial(provider.key as 'google' | 'github' | 'apple')}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/80 hover:bg-white/10 transition"
                  disabled={pendingProvider === provider.key}
                >
                  {provider.icon}
                  <span>{pendingProvider === provider.key ? '•••' : provider.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-white" />
              Zero-knowledge encryption, SOC2 Type II, and adaptive threat monitoring protect every session.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PremiumLogin;
