'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, GitFork, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  author: string;
  authorAvatar: string;
  stars: number;
  forks: number;
  views: number;
}

export default function ProjectCard({
  id,
  title,
  description,
  image,
  category,
  tags,
  author,
  authorAvatar,
  stars,
  forks,
  views,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/projects/${id}`}>
        <div className="glass-card group cursor-pointer h-full overflow-hidden">
          {/* Image Container */}
          <div className="relative h-40 mb-4 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <span className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full bg-accent/80 text-white">
              {category}
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
            {tags.length > 3 && (
              <span className="text-xs px-2 py-1 text-muted-foreground">
                +{tags.length - 3} more
              </span>
            )}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
            <Image
              src={authorAvatar}
              alt={author}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium">{author}</span>
          </div>

          {/* Stats */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-accent" />
              {stars}
            </div>
            <div className="flex items-center gap-1">
              <GitFork size={16} />
              {forks}
            </div>
            <div className="flex items-center gap-1">
              <Eye size={16} />
              {views}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
