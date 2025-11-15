'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassModal } from '@/components/Modal/GlassModal';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeveloperCardProps {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  skills: string[];
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  projects: number;
  followers: number;
}

export default function DeveloperCard({
  id,
  name,
  title,
  avatar,
  skills,
  bio,
  location,
  github,
  linkedin,
  projects,
  followers,
}: DeveloperCardProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    // Simulate sending (in future, integrate with Firebase or email service)
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Message sent successfully!');
    setMessage('');
    setOpen(false);
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/developers/${id}`}>
        <div className="glass-card group cursor-pointer h-full flex flex-col">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-4">
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full border-2 border-accent/30 group-hover:border-accent transition-colors"
                unoptimized
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-accent/30 group-hover:border-accent transition-colors bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white text-2xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <h3 className="font-bold text-lg mt-3 group-hover:text-accent transition-colors">
              {name}
            </h3>
            <p className="text-sm text-accent font-medium">{title || 'Developer'}</p>
            {location && <p className="text-xs text-muted-foreground mt-1">{location}</p>}
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
              {bio}
            </p>
          )}

          {/* Skills */}
          <div className="mb-4 pb-4 border-b border-white/10">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-1 rounded bg-accent/10 text-accent border border-accent/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-accent" />
              <div>
                <p className="text-sm font-semibold">{projects}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-accent" />
              <div>
                <p className="text-sm font-semibold">{followers}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-2 pt-4 border-t border-white/10">
            {github && (
              <a
                href={`https://github.com/${github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={16} />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            )}
            {linkedin && (
              <a
                href={`https://linkedin.com/in/${linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin size={16} />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
            )}
            <GlassModal
              trigger={
                <button 
                  className="flex-1 glass-button text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  Contact
                </button>
              }
              open={open}
              onOpenChange={setOpen}
              title={`Contact ${name}`}
              description={`Send a message to ${name}`}
              size="sm"
            >
              <div className="p-4 space-y-3">
                <textarea
                  className="glass-input w-full min-h-[100px]"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Hi ${name}! I loved your work on...`}
                  aria-label="Message"
                />
                <div className="flex justify-end gap-2">
                  <button className="glass-button-ghost text-xs" onClick={() => setOpen(false)}>
                    Cancel
                  </button>
                  <button
                    className="glass-button text-xs"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </GlassModal>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
