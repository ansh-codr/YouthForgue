'use client';

import { ProjectForm } from '@/components/ProjectForm';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CreateProjectPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <section className="max-w-2xl mx-auto py-16 space-y-6 text-center">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold">
          Sign in to create a project
        </motion.h1>
        <p className="text-muted-foreground">
          YouthForge needs to know who owns the project so likes, comments, and admin workflows stay auditable.
        </p>
        <Link href="/login" className="glass-button inline-flex px-6 py-3">
          Go to login
        </Link>
      </section>
    );
  }

  return (
    <main className="py-12 px-4 sm:px-8">
      <ProjectForm />
    </main>
  );
}
