'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2 } from 'lucide-react';
import DeveloperCard from '@/components/cards/DeveloperCard';
import { useDevelopers } from '@/hooks/useDevelopers';

const skillTags = ['React', 'Node.js', 'Python', 'TypeScript', 'Vue', 'Angular', 'Django', 'FastAPI', 'Flutter', 'Swift', 'Java', 'Go', 'Rust', 'Next.js', 'TailwindCSS'];

export default function DevelopersPage() {
  const { developers, loading } = useDevelopers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredDevelopers = useMemo(() => {
    return developers.filter((dev) => {
      const matchesSearch =
        dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dev.title && dev.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (dev.bio && dev.bio.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) =>
          dev.skills.some((s) =>
            s.toLowerCase().includes(skill.toLowerCase())
          )
        );

      return matchesSearch && matchesSkills;
    });
  }, [developers, searchQuery, selectedSkills]);

  const paginatedDevelopers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredDevelopers.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredDevelopers, currentPage]);

  const totalPages = Math.ceil(filteredDevelopers.length / itemsPerPage);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Developer Directory</h1>
            <p className="text-lg text-muted-foreground">
              Connect with {filteredDevelopers.length} talented developers in our community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="glass p-6 rounded-xl sticky top-32">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Filter size={20} />
                  Filters
                </h3>

                {/* Search */}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">
                    Search
                  </p>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="glass-input w-full pl-10"
                    />
                  </div>
                </div>

                {/* Skills Filter */}
                <div>
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">
                    Skills
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {skillTags.map((skill) => (
                      <label
                        key={skill}
                        className="flex items-center gap-2 cursor-pointer hover:text-accent transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedSkills.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSkills([]);
                      setCurrentPage(1);
                    }}
                    className="w-full mt-6 glass-button-ghost text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-accent" />
                </div>
              ) : paginatedDevelopers.length > 0 ? (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                  >
                    {paginatedDevelopers.map((developer, idx) => (
                      <motion.div
                        key={developer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <DeveloperCard {...developer} />
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
                  className="text-center py-20"
                >
                  <h3 className="text-2xl font-bold mb-2">No developers found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search query
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
