'use client';

import { CuteLampLogin } from '@/components/auth/CuteLampLogin';
import { useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';

export default function CuteLampLoginPage() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <>
      <CuteLampLogin 
        onSwitchToSignup={() => setShowSignup(true)}
      />
      
      {/* Fallback to regular signup modal */}
      <AuthModal 
        open={showSignup} 
        onOpenChange={setShowSignup}
        defaultMode="signup"
      />
    </>
  );
}
