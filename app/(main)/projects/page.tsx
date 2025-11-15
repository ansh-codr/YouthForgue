'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Loader2, Plus } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const categories = ['All', 'Web', 'Mobile', 'AI/ML', 'Blockchain', 'IoT', 'Game', 'Other'];

export default function ProjectsPage() {
  const { projects, loading } = useProjects();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description?.toLowerCase() || project.excerpt.toLowerCase()).includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'All' || project.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  const paginatedProjects = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Projects</h1>
            <p className="text-lg text-muted-foreground">
              Explore {filteredProjects.length} innovative projects built by our community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="glass-input w-full pl-12 pr-4"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3">
              <Filter size={18} className="text-muted-foreground mt-1" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'glass-button'
                      : 'glass-button-ghost'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            </div>
          ) : paginatedProjects.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              >
                {paginatedProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex justify-center items-center gap-2"
                >
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2 rounded-lg glass-button-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          currentPage === page
                            ? 'glass-button'
                            : 'glass-button-ghost'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 rounded-lg glass-button-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20 glass-card"
            >
              <h3 className="text-2xl font-bold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory !== 'All' 
                  ? 'Try adjusting your filters or search query' 
                  : 'Be the first to create a project!'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setCurrentPage(1);
                }}
                className="glass-button"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      {user && (
        <Link href="/projects/new">
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-accent to-accent-secondary shadow-lg shadow-accent/50 flex items-center justify-center z-50 hover:shadow-xl hover:shadow-accent/70 transition-shadow"
            aria-label="Create new project"
          >
            <Plus size={28} className="text-white" />
          </motion.button>
        </Link>
      )}
    </div>
  );
}
