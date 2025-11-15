'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Apple, ShieldCheck, Zap, Sparkles, Waves, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const themeConfigs = {
  minimal: {
    label: 'Ion Mist',
    accent: '#8FD3FF',
    accentSoft: '#D7F4FF',
    gradient: 'linear-gradient(125deg,#050916 0%,#071A2C 52%,#04111C 100%)',
    wave: ['#66D2FF', '#2B7CFF'],
    card: 'linear-gradient(180deg,rgba(9,16,30,0.92),rgba(5,9,18,0.96))',
    border: 'rgba(255,255,255,0.12)',
  },
  futuristic: {
    label: 'Plasma Field',
    accent: '#3BFFCE',
    accentSoft: '#C4FFEF',
    gradient: 'linear-gradient(130deg,#02040c 0%,#031320 55%,#012325 100%)',
    wave: ['#20F5AE', '#02A6FF'],
    card: 'linear-gradient(185deg,rgba(3,15,22,0.95),rgba(1,10,18,0.98))',
    border: 'rgba(32,245,174,0.25)',
  },
  luxe: {
    label: 'Aurum Pulse',
    accent: '#FFB579',
    accentSoft: '#FFE9D3',
    gradient: 'linear-gradient(135deg,#120305 0%,#20111E 55%,#05060F 100%)',
    wave: ['#FF8E53', '#FFC36A'],
    card: 'linear-gradient(180deg,rgba(22,9,18,0.93),rgba(8,6,12,0.98))',
    border: 'rgba(255,181,121,0.22)',
  },
} as const;

type ThemeKey = keyof typeof themeConfigs;

const runwayStats = [
  { label: 'Global orgs', value: '8,400+' },
  { label: 'Incidents auto-mitigated', value: '32.5K' },
  { label: 'Median auth latency', value: '118ms' },
  { label: 'Attack surface reduction', value: '94%' },
];

const featureBadges = [
  'Adaptive MFA',
  'Contextual risk scoring',
  'Session co-pilot',
  'Biometric fallback',
];

const timelines = [
  { label: 'Wireframe', tag: 'Day 0', detail: 'White-glove provisioning with SOC runbooks.' },
  { label: 'Pilot', tag: 'Day 3', detail: 'Shadow launch & synthetic load testing.' },
  { label: 'Full global roll-out', tag: 'Day 14', detail: 'One-click blast radius awareness.' },
];

const googleGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#FFFFFF"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function PremiumLogin() {
  const [theme, setTheme] = useState<ThemeKey>('futuristic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  const { signIn, signInWithGoogle } = useAuth();
  const palette = useMemo(() => themeConfigs[theme], [theme]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Enter both email and password.');
      return;
    }
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.success) {
      toast.success('Welcome back to Command.');
    } else {
      toast.error(result.error || 'Authentication failed');
    }
  };

  const handleSocial = async (provider: 'google' | 'github' | 'apple') => {
    if (provider === 'google') {
      setPendingProvider('google');
      const response = await signInWithGoogle();
      setPendingProvider(null);
      if (response.success) {
        toast.success('Signed in with Google');
      } else {
        toast.error(response.error || 'Google sign-in failed');
      }
      return;
    }

    const label = provider === 'github' ? 'GitHub' : 'Apple';
    toast.info(`${label} SSO arriving soon`, {
      description: 'Reach out to YouthForge concierge to enable this provider.',
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#01030B] text-white">
      <div className="absolute inset-0" style={{ background: palette.gradient }} />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 45%)' }} />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0.2 }}
        animate={{ opacity: [0.15, 0.45, 0.2] }}
        transition={{ duration: 16, repeat: Infinity, repeatType: 'reverse' }}
        style={{
          backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
        }}
      />

      {[...Array(14)].map((_, index) => (
        <motion.span
          key={index}
          aria-hidden
          className="pointer-events-none absolute h-1 w-24 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${palette.accentSoft})`,
            top: `${(index * 7) % 100}%`,
            left: `${(index * 13) % 100}%`,
          }}
          animate={{ x: ['0%', '15%', '-10%'], opacity: [0, 0.65, 0] }}
          transition={{ duration: 12 + index, repeat: Infinity }}
        />
      ))}

      <div className="relative z-10 flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-14">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-xl font-semibold" style={{ boxShadow: `0 20px 70px ${palette.accentSoft}` }}>
              YF
            </div>
            <div>
              <p className="uppercase tracking-[0.35em] text-xs text-white/60">YouthForge</p>
              <p className="text-lg font-semibold">Identity Fabric Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            {Object.entries(themeConfigs).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key as ThemeKey)}
                className={`rounded-full border px-4 py-2 transition ${
                  theme === key ? 'bg-white/15 border-white/60' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                style={theme === key ? { boxShadow: `0 22px 40px ${palette.accentSoft}` } : undefined}
              >
                {config.label}
              </button>
            ))}
          </div>
        </header>

        <main className="mt-10 grid flex-1 gap-10 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-8 lg:p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40" />
            <div className="relative space-y-8">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.55em] text-white/60">
                <Sparkles className="h-4 w-4 text-white/70" />
                Immersive Zero-Trust Entry
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight max-w-4xl">
                An electric wave of trust guarding every pixel of your login surface.
              </h1>
              <p className="text-white/70 text-lg max-w-3xl">
                YouthForge Command™ blends biometric heuristics, real-time streaming intel, and cinematic UI craftwork so every authentication feels inevitable.
              </p>

              <div className="flex flex-wrap gap-3">
                {featureBadges.map((badge) => (
                  <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.25em] text-white/65">
                    {badge}
                  </span>
                ))}
              </div>

              <div className="grid gap-4 rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5/5 via-transparent to-transparent p-6 lg:grid-cols-2">
                {runwayStats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">{stat.label}</p>
                    <p className="text-2xl font-semibold" style={{ color: palette.accent }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="relative mt-4 overflow-hidden rounded-[36px] border border-white/10 bg-black/20">
                <svg viewBox="0 0 600 300" className="h-64 w-full" aria-hidden>
                  <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={palette.wave[0]} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={palette.wave[1]} stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="waveGradientSoft" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={palette.wave[1]} stopOpacity="0.05" />
                      <stop offset="100%" stopColor={palette.wave[0]} stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0 180 Q 80 140 160 180 T 320 180 T 480 180 T 640 180"
                    fill="none"
                    stroke="url(#waveGradientSoft)"
                    strokeWidth="60"
                    animate={{ pathLength: [0.5, 1, 0.5], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 10, repeat: Infinity }}
                  />
                  <motion.path
                    d="M0 150 Q 80 100 160 150 T 320 150 T 480 150 T 640 150"
                    fill="none"
                    stroke="url(#waveGradient)"
                    strokeWidth="18"
                    animate={{ d: [
                      'M0 150 Q 80 100 160 150 T 320 150 T 480 150 T 640 150',
                      'M0 150 Q 80 200 160 150 T 320 100 T 480 140 T 640 160',
                      'M0 150 Q 80 100 160 150 T 320 150 T 480 150 T 640 150',
                    ] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  />
                </svg>
                <div className="absolute bottom-6 left-6 flex flex-col rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <Waves className="h-4 w-4 text-white" /> Electric wave kernel
                  </div>
                  <p className="text-white/90 text-xl font-semibold" style={{ color: palette.accent }}>
                    Live anomaly shielding active
                  </p>
                </div>
              </div>

              <div className="grid gap-4 rounded-3xl border border-white/10 bg-black/30 p-6 lg:grid-cols-3">
                {timelines.map((step) => (
                  <div key={step.label} className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">{step.tag}</p>
                    <p className="text-lg font-semibold">{step.label}</p>
                    <p className="text-white/60 text-sm">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative flex flex-col rounded-[40px] border border-white/10 bg-black/30 p-6 lg:p-10 backdrop-blur-2xl" style={{ boxShadow: `0 50px 140px ${palette.accentSoft}` }}>
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50" />
            <div className="relative space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.45em] text-white/50">Log in</p>
                  <h2 className="mt-2 text-3xl font-semibold">Access YouthForge Command</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 flex items-center gap-2">
                  <Lock className="h-4 w-4" /> SOC II · ISO 27001
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Work email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@youthforge.studio"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <div className="flex justify-between text-xs text-white/60">
                    <button type="button" className="text-white hover:text-white/80">Forgot password?</button>
                    <span>Magic link in <strong>30s</strong></span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="relative w-full rounded-2xl py-4 text-lg font-semibold transition disabled:opacity-60"
                  style={{
                    background: `linear-gradient(120deg, ${palette.accent}, ${palette.accentSoft})`,
                    color: theme === 'minimal' ? '#03121f' : '#050505',
                    boxShadow: `0 25px 65px ${palette.accentSoft}`,
                  }}
                >
                  {submitting ? 'Authenticating…' : 'Login'}
                </button>
              </form>

              <div className="flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-white/40">
                <span className="h-px flex-1 bg-white/10" /> Or / SSO <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                {[
                  { key: 'google', label: 'Google', icon: googleGlyph },
                  { key: 'github', label: 'GitHub', icon: <Github className="h-4 w-4" /> },
                  { key: 'apple', label: 'Apple', icon: <Apple className="h-4 w-4" /> },
                ].map((provider) => (
                  <button
                    key={provider.key}
                    type="button"
                    onClick={() => handleSocial(provider.key as 'google' | 'github' | 'apple')}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 text-white/80 hover:bg-white/10 transition"
                    disabled={pendingProvider === provider.key}
                  >
                    {provider.icon}
                    <span>{pendingProvider === provider.key ? '•••' : provider.label}</span>
                  </button>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70 flex gap-3">
                <ShieldCheck className="h-5 w-5 text-white" />
                Sovereign compliance, air-gapped audit trails, adaptive bot containment, and a real-time console monitoring every identity edge.
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80 flex items-center gap-3">
                <Zap className="h-5 w-5 text-white" />
                <div>
                  <p className="text-white text-base font-semibold">Intelligence loop</p>
                  <p className="text-white/60">Each login trains our defensive graph—no stale passwords, no static perimeters.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
