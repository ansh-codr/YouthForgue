'use client';

import Image from 'next/image';
import { Clock, Target, Users, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  image: string;
  tags: string[];
  prize: string;
  participants: number;
  deadline: string;
}

export default function ChallengeCard({
  id,
  title,
  description,
  difficulty,
  category,
  image,
  tags,
  prize,
  participants,
  deadline,
}: ChallengeCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-accent/10 text-accent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="glass-card group cursor-pointer h-full"
    >
      {/* Image */}
      <div className="relative h-40 -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full border ${getDifficultyColor(difficulty)}`}>
          {difficulty}
        </span>
      </div>

      {/* Content */}
      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-accent transition-colors">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 rounded bg-accent/10 text-accent border border-accent/20"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Prize</p>
            <p className="text-sm font-semibold">{prize}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="text-sm font-semibold">{participants}</p>
          </div>
        </div>
      </div>

      {/* Deadline */}
      <div className="flex items-center gap-2 text-sm">
        <Clock size={16} className="text-accent" />
        <span className="text-muted-foreground">Ends {new Date(deadline).toLocaleDateString()}</span>
      </div>

      {/* CTA Button */}
      <button className="w-full mt-4 py-2 glass-button text-sm font-medium">
        Join Challenge
      </button>
    </motion.div>
  );
}
