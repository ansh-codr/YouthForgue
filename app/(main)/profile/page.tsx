'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Github, Linkedin, Globe, MapPin, Users, Zap, Edit2, Mail, Calendar } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ProfileEditModal } from '@/components/auth/ProfileEditModal';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { projects, loading: projectsLoading } = useProjects();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'challenges' | 'about'>(
    'projects'
  );

  // Filter projects by current user
  const userProjects = projects.filter(p => p.author.id === user?.uid);

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const joinDate = user?.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  const tabs = [
    { id: 'projects', label: 'Projects', count: userProjects.length },
    { id: 'challenges', label: 'Challenges', count: 0 },
    { id: 'about', label: 'About', count: null },
  ];

  return (
    <AuthGuard>
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
          className="relative h-48 md:h-64 overflow-hidden border-b border-white/10 bg-gradient-to-br from-accent/20 via-accent-secondary/20 to-background"
        >
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
                <div className="relative w-40 h-40 rounded-2xl border-4 border-background shadow-xl overflow-hidden bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white text-5xl font-bold">
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={displayName}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                      unoptimized
                      priority
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!user?.photoURL && displayName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 py-4">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {displayName}
                  </h1>
                  <p className="text-accent text-lg font-medium mb-4 flex items-center gap-2">
                    <Mail size={18} />
                    {user?.email}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {profile?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={16} />
                        {profile.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      Joined {joinDate}
                    </span>
                    {user?.emailVerified && (
                      <span className="flex items-center gap-1 text-green-400">
                        ✓ Email Verified
                      </span>
                    )}
                  </div>

                  <p className="text-muted-foreground mb-6 max-w-xl">
                    {profile?.bio || 'Welcome to your YouthForge profile! Start building amazing projects and collaborate with fellow developers.'}
                  </p>

                  {/* Social Links */}
                  {(profile?.github || profile?.linkedin || profile?.website) && (
                    <div className="flex gap-3">
                      {profile.github && (
                        <a
                          href={`https://github.com/${profile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-accent/20 hover:text-accent rounded-lg transition-colors"
                          aria-label="GitHub"
                        >
                          <Github size={20} />
                        </a>
                      )}
                      {profile.linkedin && (
                        <a
                          href={`https://linkedin.com/in/${profile.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-accent/20 hover:text-accent rounded-lg transition-colors"
                          aria-label="LinkedIn"
                        >
                          <Linkedin size={20} />
                        </a>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-accent/20 hover:text-accent rounded-lg transition-colors"
                          aria-label="Website"
                        >
                          <Globe size={20} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditModalOpen(true)}
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
                  value: userProjects.length,
                  icon: Zap,
                },
                {
                  label: 'Followers',
                  value: 0,
                  icon: Users,
                },
                {
                  label: 'Following',
                  value: 0,
                  icon: Users,
                },
                {
                  label: 'Contributions',
                  value: userProjects.reduce((sum, p) => sum + p.likeCount, 0),
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
            <h2 className="text-2xl font-bold mb-6">Skills & Interests</h2>
            <div className="flex flex-wrap gap-3">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, idx) => (
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
                ))
              ) : (
                <p className="text-muted-foreground">
                  No skills added yet. Click "Edit Profile" to add your skills!
                </p>
              )}
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
            >
              {projectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-96 rounded-xl" />
                  ))}
                </div>
              ) : userProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                  {userProjects.map((project, idx) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                    >
                      <ProjectCard project={project} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 glass-card">
                  <Zap size={48} className="mx-auto mb-4 text-accent opacity-50" />
                  <p className="text-muted-foreground text-lg mb-4">
                    You haven't created any projects yet
                  </p>
                  <Link href="/dev/realtime" className="glass-button inline-flex items-center gap-2">
                    <Zap size={18} />
                    Create Your First Project
                  </Link>
                </div>
              )}
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
              <h3 className="text-2xl font-bold mb-6">About {displayName}</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {profile?.bio || 'No bio added yet. Click "Edit Profile" to add a bio and tell others about yourself!'}
                </p>
                {(profile?.github || profile?.linkedin || profile?.website) && (
                  <div className="pt-4">
                    <h4 className="font-semibold text-foreground mb-2">Connect</h4>
                    <div className="flex flex-col gap-2 text-sm">
                      {profile.github && (
                        <a 
                          href={`https://github.com/${profile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-accent transition-colors"
                        >
                          <Github size={16} />
                          github.com/{profile.github}
                        </a>
                      )}
                      {profile.linkedin && (
                        <a 
                          href={`https://linkedin.com/in/${profile.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-accent transition-colors"
                        >
                          <Linkedin size={16} />
                          linkedin.com/in/{profile.linkedin}
                        </a>
                      )}
                      {profile.website && (
                        <a 
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-accent transition-colors"
                        >
                          <Globe size={16} />
                          {profile.website}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Profile Edit Modal */}
      <ProfileEditModal 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen}
        onSuccess={() => {
          // Profile will auto-update via real-time listener
        }}
      />
    </div>
    </AuthGuard>
  );
}
