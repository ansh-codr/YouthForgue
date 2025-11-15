'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

type LampLoginRefs = {
  rope: HTMLDivElement | null;
  ropeImg: HTMLImageElement | null;
  lampOff: HTMLImageElement | null;
  lampOn: HTMLImageElement | null;
  glowFrame: HTMLImageElement | null;
  loginCard: HTMLDivElement | null;
};

const MAX_PULL = 100; // px travel before we consider it "full on"
const SNAP_THRESHOLD = 0.65; // % of pull distance before snapping to ON state

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: 46,
  borderRadius: 10,
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(13, 198, 153, 0.1)',
  padding: '10px 14px',
  color: '#e3f7ee',
  fontSize: 14,
  marginBottom: 14,
  boxSizing: 'border-box',
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: 48,
  borderRadius: 999,
  background: 'linear-gradient(180deg,#44C47F,#2DA56B)',
  border: 'none',
  color: '#fff',
  fontWeight: 700,
  fontSize: 16,
  marginTop: 8,
  cursor: 'pointer',
  boxShadow: '0 20px 40px rgba(46,160,112,0.2)',
};

const helperTextStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 13,
  color: 'rgba(207, 238, 225, 0.65)',
  marginTop: 10,
};

export const LampLogin: React.FC = () => {
  const refs = useRef<LampLoginRefs>({
    rope: null,
    ropeImg: null,
    lampOff: null,
    lampOn: null,
    glowFrame: null,
    loginCard: null,
  });

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const currentPullRef = useRef(0);

  useEffect(() => {
    const { lampOff, lampOn, glowFrame, loginCard, ropeImg, rope } = refs.current;
    if (!lampOff || !lampOn || !glowFrame || !loginCard || !ropeImg || !rope) {
      return undefined;
    }

    const tl = gsap.timeline({ paused: true });
    tl.to(lampOff, { opacity: 0, duration: 0.8, ease: 'power3.out' }, 0);
    tl.to(lampOn, { opacity: 1, duration: 0.8, ease: 'power3.out' }, 0);
    tl.to(glowFrame, { opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.05);
    tl.to(loginCard, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.06);
    tl.to(ropeImg, { rotation: 6, duration: 0.6, ease: 'power3.out' }, 0);
    tl.to(loginCard, {
      scale: 1.01,
      duration: 0.25,
      ease: 'power3.out',
      repeat: 1,
      yoyo: true,
    }, 0.85);
    tlRef.current = tl;

    const setProgressFromPull = (pullPx: number) => {
      const progress = Math.max(0, Math.min(MAX_PULL, pullPx)) / MAX_PULL;
      tl.progress(progress);
    };

    const handlePointerDown = (event: PointerEvent) => {
      draggingRef.current = true;
      startYRef.current = event.clientY;
      rope.setPointerCapture(event.pointerId);
      rope.style.cursor = 'grabbing';
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const delta = Math.max(0, event.clientY - startYRef.current);
      currentPullRef.current = delta;
      const translateY = Math.min(delta, MAX_PULL);
      gsap.set(rope, { y: translateY });
      setProgressFromPull(translateY);
    };

    const snapTo = (target: number) => {
      gsap.to(rope, {
        y: target,
        duration: 0.55,
        ease: 'power3.out',
        onUpdate: () => {
          const yVal = Number(gsap.getProperty(rope, 'y')) || 0;
          setProgressFromPull(yVal);
        },
        onComplete: () => {
          setProgressFromPull(target);
          if (target === 0) {
            tl.progress(0);
          } else if (target === MAX_PULL) {
            tl.progress(1);
          }
        },
      });
    };

    const handlePointerUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      rope.style.cursor = 'grab';
      const progress = Math.max(0, Math.min(1, currentPullRef.current / MAX_PULL));
      if (progress >= SNAP_THRESHOLD) {
        snapTo(MAX_PULL);
      } else {
        snapTo(0);
      }
      currentPullRef.current = 0;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      const isOn = tl.progress() > 0.5;
      snapTo(isOn ? 0 : MAX_PULL);
    };

    rope.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    rope.addEventListener('keydown', handleKeyDown);

    return () => {
      rope.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      rope.removeEventListener('keydown', handleKeyDown);
      tl.kill();
      tlRef.current = null;
      gsap.set(rope, { clearProps: 'all' });
    };
  }, []);

  return (
    <div className="lamp-login-wrap" style={{ padding: 24 }}>
      <div
        className="scene"
        style={{
          width: 1100,
          height: 640,
          display: 'flex',
          gap: 24,
          background: 'radial-gradient(circle at 20% 30%, rgba(14,162,123,0.08), transparent 55%)',
          borderRadius: 32,
          padding: 32,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '48%', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(120deg,#071018 10%, #081b1b 90%)',
              borderRadius: 20,
            }}
          />
          <div style={{ position: 'relative', width: 520, height: 520 }}>
            <img
              ref={(el) => (refs.current.lampOff = el)}
              src="/assets/lamp_off.png"
              alt="Lamp off"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
              draggable={false}
            />
            <img
              ref={(el) => (refs.current.lampOn = el)}
              src="/assets/lamp_on.png"
              alt="Lamp on"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0 }}
              draggable={false}
            />
          </div>
          <div
            ref={(el) => (refs.current.rope = el)}
            role="button"
            tabIndex={0}
            aria-label="Pull lamp cord to toggle login card"
            style={{
              position: 'absolute',
              left: '24%',
              top: '20%',
              width: 56,
              height: 220,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            <img
              ref={(el) => (refs.current.ropeImg = el)}
              src="/assets/rope.png"
              alt="Lamp pull cord"
              style={{ width: 28, userSelect: 'none', pointerEvents: 'none' }}
              draggable={false}
            />
          </div>
        </div>

        <div style={{ width: '44%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            ref={(el) => (refs.current.glowFrame = el)}
            src="/assets/lamp_glow_mask.png"
            alt=""
            style={{
              position: 'absolute',
              width: 480,
              height: 360,
              opacity: 0,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 18px 40px rgba(14,162,123,0.18))',
            }}
            draggable={false}
          />

          <div style={{ width: 420, height: 320, borderRadius: 26, position: 'relative' }}>
            <div
              ref={(el) => (refs.current.loginCard = el)}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 26,
                background: 'linear-gradient(180deg,#122028,#0f1f26)',
                boxShadow: '0 12px 50px rgba(0,0,0,0.45)',
                padding: 36,
                boxSizing: 'border-box',
                opacity: 0,
                transform: 'translateY(18px)',
              }}
              role="region"
              aria-label="Lamp activated login panel"
            >
              <p style={{ margin: 0, color: '#FF9B2B', letterSpacing: '0.25em', fontSize: 12, textAlign: 'center' }}>ACCESS</p>
              <h1 style={{ margin: '8px 0 18px 0', color: '#E8F6F1', fontSize: 28, textAlign: 'center' }}>Welcome Back</h1>
              <input style={inputStyle} placeholder="username" aria-label="username" />
              <input style={inputStyle} placeholder="password" aria-label="password" type="password" />
              <div style={helperTextStyle}>
                <span>Forgot Password?</span>
                <span style={{ color: '#0EA27B' }}>Sign Up</span>
              </div>
              <button type="button" style={buttonStyle}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LampLogin;
