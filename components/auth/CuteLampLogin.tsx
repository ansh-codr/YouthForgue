'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CuteLampLoginProps {
  onSwitchToSignup?: () => void;
  onClose?: () => void;
}

export function CuteLampLogin({ onSwitchToSignup, onClose }: CuteLampLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  // Lamp animation states
  const [lampGlow, setLampGlow] = useState(true);
  const [eyesOpen, setEyesOpen] = useState(true);

  useEffect(() => {
    // Close eyes when typing password
    setEyesOpen(!isPasswordFocused);
  }, [isPasswordFocused]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setLampGlow(false);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        toast.success('Welcome back! 🎉');
        onClose?.();
        router.push('/projects');
      } else {
        toast.error(result.error || 'Failed to sign in');
        setLampGlow(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      setLampGlow(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f2e] via-[#0f1419] to-[#000000]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Cute Lamp */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{
              y: lampGlow ? [0, -10, 0] : 0,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            {/* Lamp Glow Effect */}
            {lampGlow && (
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 blur-3xl bg-yellow-300/30 rounded-full"
                style={{ transform: 'translateY(20%)' }}
              />
            )}

            {/* Lamp SVG */}
            <svg
              width="300"
              height="400"
              viewBox="0 0 300 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10"
            >
              {/* Lamp Shade */}
              <motion.path
                d="M 90 100 L 210 100 L 180 180 L 120 180 Z"
                fill="#7FA99B"
                animate={{
                  fill: lampGlow ? ["#7FA99B", "#8FBB9B", "#7FA99B"] : "#6A8E80"
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Lamp Face - Eyes */}
              <AnimatePresence>
                {eyesOpen ? (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {/* Happy Eyes */}
                    <path
                      d="M 125 135 Q 130 140 135 135"
                      stroke="#2C3E50"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 165 135 Q 170 140 175 135"
                      stroke="#2C3E50"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </motion.g>
                ) : (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {/* Closed Eyes */}
                    <path
                      d="M 120 135 L 140 135"
                      stroke="#2C3E50"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 160 135 L 180 135"
                      stroke="#2C3E50"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </motion.g>
                )}
              </AnimatePresence>

              {/* Happy Mouth */}
              <motion.path
                d="M 135 155 Q 150 165 165 155"
                stroke="#FF6B9D"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                animate={{
                  d: loading 
                    ? "M 135 155 Q 150 150 165 155"
                    : "M 135 155 Q 150 165 165 155"
                }}
              />

              {/* Blush */}
              <circle cx="110" cy="150" r="8" fill="#FFB6C1" opacity="0.6" />
              <circle cx="190" cy="150" r="8" fill="#FFB6C1" opacity="0.6" />

              {/* Lamp Stand */}
              <rect x="140" y="180" width="20" height="120" fill="#E8E8E8" rx="2" />
              
              {/* Lamp Base */}
              <ellipse cx="150" cy="310" rx="45" ry="15" fill="#E8E8E8" />
              <ellipse cx="150" cy="305" rx="45" ry="8" fill="#CCCCCC" />

              {/* Light Beam (when glowing) */}
              {lampGlow && (
                <motion.path
                  d="M 120 180 L 90 280 L 210 280 L 180 180 Z"
                  fill="url(#lightGradient)"
                  opacity="0.4"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="lightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FFF9E6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mt-8 mb-4"
            style={{
              background: 'linear-gradient(135deg, #FFA500 0%, #FF6B35 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(255, 165, 0, 0.3)'
            }}
          >
            Cute Lamp Login
          </motion.h1>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Glowing Border Container */}
          <div className="relative p-1 rounded-3xl">
            {/* Animated Glow Border */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(16, 185, 129, 0.5), inset 0 0 20px rgba(16, 185, 129, 0.1)',
                  '0 0 40px rgba(16, 185, 129, 0.8), inset 0 0 30px rgba(16, 185, 129, 0.2)',
                  '0 0 20px rgba(16, 185, 129, 0.5), inset 0 0 20px rgba(16, 185, 129, 0.1)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 blur-sm"
            />

            {/* Form Container */}
            <div className="relative bg-[#1a2332]/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-emerald-500/30">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold text-white mb-8 text-center"
              >
                Welcome Back
              </motion.h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username/Email Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1419]/80 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    disabled={loading}
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      className="w-full px-4 py-3 bg-[#0f1419]/80 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all pr-12"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </motion.div>

                {/* Login Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </motion.button>

                {/* Forgot Password */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center"
                >
                  <button
                    type="button"
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    onClick={() => toast.info('Password reset coming soon!')}
                  >
                    Forgot Password?
                  </button>
                </motion.div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#1a2332] text-gray-400">or</span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center text-sm text-gray-400"
                >
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    Sign Up
                  </button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
