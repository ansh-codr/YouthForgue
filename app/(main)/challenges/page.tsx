'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import ChallengeCard from '@/components/cards/ChallengeCard';
import { mockChallenges, challengeCategories } from '@/lib/mockData';

export default function ChallengesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const difficulties = ['Easy', 'Intermediate', 'Hard'];

  const filteredChallenges = useMemo(() => {
    return mockChallenges.filter((challenge) => {
      const matchesSearch =
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || challenge.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty.length === 0 ||
        selectedDifficulty.includes(challenge.difficulty);

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const paginatedChallenges = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredChallenges.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredChallenges, currentPage]);

  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulty((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty]
    );
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Challenges</h1>
            <p className="text-lg text-muted-foreground">
              Compete, learn, and earn rewards with {filteredChallenges.length} exciting challenges.
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

                {/* Category Filter */}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">
                    Category
                  </p>
                  <div className="space-y-2">
                    {challengeCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                          selectedCategory === cat
                            ? 'bg-accent/20 text-accent'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">
                    Difficulty
                  </p>
                  <div className="space-y-2">
                    {difficulties.map((difficulty) => (
                      <label
                        key={difficulty}
                        className="flex items-center gap-2 cursor-pointer hover:text-accent transition-colors text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDifficulty.includes(difficulty)}
                          onChange={() => toggleDifficulty(difficulty)}
                          className="w-4 h-4 rounded"
                        />
                        {difficulty}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedCategory !== 'All' || selectedDifficulty.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedDifficulty([]);
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
              {paginatedChallenges.length > 0 ? (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                  >
                    {paginatedChallenges.map((challenge, idx) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <ChallengeCard {...challenge} />
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
                  <h3 className="text-2xl font-bold mb-2">No challenges found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedDifficulty([]);
                      setCurrentPage(1);
                    }}
                    className="glass-button"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
