'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeveloperCardProps {
  id: string;
  name: string;
  title: string;
  avatar: string;
  skills: string[];
  bio: string;
  location: string;
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
  projects,
  followers,
}: DeveloperCardProps) {
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
            <Image
              src={avatar}
              alt={name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full border-2 border-accent/30 group-hover:border-accent transition-colors"
            />
            <h3 className="font-bold text-lg mt-3 group-hover:text-accent transition-colors">
              {name}
            </h3>
            <p className="text-sm text-accent font-medium">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">{location}</p>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
            {bio}
          </p>

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
            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm">
              <Github size={16} />
              <span className="hidden sm:inline">GitHub</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm">
              <Linkedin size={16} />
              <span className="hidden sm:inline">LinkedIn</span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
