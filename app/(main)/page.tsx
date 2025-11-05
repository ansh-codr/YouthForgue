'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import ProjectCard from '@/components/cards/ProjectCard';
import DeveloperCard from '@/components/cards/DeveloperCard';
import ChallengeCard from '@/components/cards/ChallengeCard';
import { mockProjects, mockDevelopers, mockChallenges } from '@/lib/mockData';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles size={16} className="text-accent" />
              <span className="text-sm font-medium">Welcome to the future of youth development</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="block">Forge Ideas</span>
              <span className="gradient-text">Connect & Collaborate</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              YouthForge is where young developers, designers, and creators come together to build amazing projects, 
              complete real-world challenges, and grow their skills alongside a vibrant community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="glass-button inline-flex items-center gap-2 px-8 py-3">
                Get Started
                <ArrowRight size={18} />
              </button>
              <button className="glass-button-ghost inline-flex items-center gap-2 px-8 py-3">
                Explore Projects
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {[
              { label: 'Active Projects', value: '2,847' },
              { label: 'Young Developers', value: '12,456' },
              { label: 'Challenges', value: '98' },
            ].map((stat, idx) => (
              <div key={idx} className="glass p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-accent">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                <Zap size={32} className="text-accent" />
                Featured Projects
              </h2>
              <Link
                href="/projects"
                className="text-accent hover:text-accent-secondary transition-colors flex items-center gap-1"
              >
                View All <ArrowRight size={18} />
              </Link>
            </div>
            <p className="text-muted-foreground">
              Discover innovative projects built by talented young developers in the community.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {mockProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Top Developers Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl md:text-4xl font-bold">Top Developers</h2>
              <Link
                href="/developers"
                className="text-accent hover:text-accent-secondary transition-colors flex items-center gap-1"
              >
                Explore More <ArrowRight size={18} />
              </Link>
            </div>
            <p className="text-muted-foreground">
              Meet the talented developers driving innovation in our community.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {mockDevelopers.slice(0, 3).map((developer) => (
              <DeveloperCard key={developer.id} {...developer} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Latest Challenges Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl md:text-4xl font-bold">Trending Challenges</h2>
              <Link
                href="/challenges"
                className="text-accent hover:text-accent-secondary transition-colors flex items-center gap-1"
              >
                View All <ArrowRight size={18} />
              </Link>
            </div>
            <p className="text-muted-foreground">
              Test your skills and compete with developers worldwide. Win prizes and recognition.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {mockChallenges.slice(0, 3).map((challenge) => (
              <ChallengeCard key={challenge.id} {...challenge} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card text-center p-12 md:p-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Forge Your Future?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of young developers collaborating on real projects, learning from industry experts, 
              and building their portfolios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="glass-button px-8 py-3 inline-flex items-center gap-2">
                Create Account
                <ArrowRight size={18} />
              </button>
              <button className="glass-button-ghost px-8 py-3">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
