'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Github, Linkedin, Globe, MapPin, Users, Zap, Edit2 } from 'lucide-react';
import ProjectCard from '@/components/cards/ProjectCard';
import { mockUser, mockProjects } from '@/lib/mockData';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'challenges' | 'about'>(
    'projects'
  );

  const tabs = [
    { id: 'projects', label: 'Projects', count: mockUser.projects.length },
    { id: 'challenges', label: 'Challenges', count: 8 },
    { id: 'about', label: 'About', count: null },
  ];

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Cover Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-48 md:h-64 overflow-hidden border-b border-white/10"
      >
        <Image
          src={mockUser.cover}
          alt="Cover"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </motion.div>

      {/* Profile Section */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-8"
          >
            {/* Avatar & Basic Info */}
            <div className="flex flex-col md:flex-row gap-6 items-start flex-1">
              <Image
                src={mockUser.avatar}
                alt={mockUser.name}
                width={160}
                height={160}
                className="w-40 h-40 rounded-2xl border-4 border-background shadow-xl"
              />

              <div className="flex-1 py-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {mockUser.name}
                </h1>
                <p className="text-accent text-lg font-medium mb-4">
                  {mockUser.title}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {mockUser.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <span>Joined {mockUser.joinedDate}</span>
                  </span>
                </div>

                <p className="text-muted-foreground mb-6 max-w-xl">
                  {mockUser.bio}
                </p>

                {/* Social Links */}
                <div className="flex gap-3">
                  {[
                    { icon: Github, href: mockUser.github, label: 'GitHub' },
                    { icon: Linkedin, href: mockUser.linkedin, label: 'LinkedIn' },
                    { icon: Globe, href: mockUser.website, label: 'Website' },
                  ].map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-accent/20 hover:text-accent rounded-lg transition-colors"
                      aria-label={label}
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button inline-flex items-center gap-2"
            >
              <Edit2 size={18} />
              Edit Profile
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              {
                label: 'Projects',
                value: mockUser.stats.projects,
                icon: Zap,
              },
              {
                label: 'Followers',
                value: mockUser.stats.followers,
                icon: Users,
              },
              {
                label: 'Following',
                value: mockUser.stats.following,
                icon: Users,
              },
              {
                label: 'Contributions',
                value: mockUser.stats.contributions,
                icon: Zap,
              },
            ].map(({ label, value, icon: Icon }, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + idx * 0.05 }}
                className="glass p-4 rounded-xl"
              >
                <Icon size={20} className="text-accent mb-2" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card"
          >
            <h2 className="text-2xl font-bold mb-6">Skills</h2>
            <div className="flex flex-wrap gap-3">
              {mockUser.skills.map((skill, idx) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="px-4 py-2 rounded-lg bg-accent/20 text-accent border border-accent/30 hover:border-accent/60 transition-colors cursor-pointer"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex gap-4 mb-8 border-b border-white/10 pb-4"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2 font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count && <span className="ml-2 text-sm">({tab.count})</span>}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-accent-secondary"
                  />
                )}
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          {activeTab === 'projects' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
            >
              {mockProjects.slice(0, 3).map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <ProjectCard {...project} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'challenges' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground text-lg">
                No completed challenges yet. Start one today!
              </p>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card max-w-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">About {mockUser.name}</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {mockUser.name} is a passionate full-stack developer with a keen interest
                  in open-source contributions and community engagement. With extensive
                  experience in modern web technologies and cloud infrastructure, {mockUser.name}
                  is committed to mentoring the next generation of developers.
                </p>
                <p>
                  When not coding, you can find {mockUser.name} contributing to open-source
                  projects, writing technical blog posts, or organizing local tech meetups.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
