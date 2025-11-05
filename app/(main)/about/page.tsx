'use client';

import { motion } from 'framer-motion';
import { Users, Target, Lightbulb, Zap, BookOpen, Globe } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Users,
      title: 'Community First',
      description: 'Connect with thousands of passionate young developers and creators worldwide.',
    },
    {
      icon: Zap,
      title: 'Real Projects',
      description: 'Work on meaningful projects with real-world impact and industry mentors.',
    },
    {
      icon: Target,
      title: 'Skill Development',
      description: 'Grow your technical and soft skills through challenges and collaboration.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation Focus',
      description: 'Explore cutting-edge technologies and pioneering solutions.',
    },
    {
      icon: BookOpen,
      title: 'Continuous Learning',
      description: 'Access curated resources, tutorials, and expert guidance.',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Build connections that span across continents and industries.',
    },
  ];

  const stats = [
    { value: '12,456+', label: 'Young Developers' },
    { value: '2,847', label: 'Active Projects' },
    { value: '150+', label: 'Mentors' },
    { value: '$500K+', label: 'Prizes & Rewards' },
  ];

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="gradient-text">YouthForge</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We believe every young developer has the potential to forge something extraordinary. 
              YouthForge is a global platform dedicated to empowering the next generation of creators, 
              builders, and innovators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="glass p-6 rounded-xl text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12"
          >
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              Our mission is simple yet powerful: to democratize access to opportunities for young developers worldwide. 
              We create a space where ideas flourish, skills are honed, and meaningful connections are forged.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              By bringing together developers, designers, and visionaries, YouthForge transforms individual potential 
              into collective innovation. We're not just building a platform; we're cultivating a global community of 
              tomorrow's tech leaders.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools and resources to help you grow
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="glass-card group hover:border-accent/50 transition-colors"
                >
                  <Icon size={32} className="text-accent mb-4" />
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Showcase your skills, interests, and portfolio. Let the community know who you are.',
              },
              {
                step: '02',
                title: 'Explore Opportunities',
                description: 'Browse projects, challenges, and events that match your interests and skill level.',
              },
              {
                step: '03',
                title: 'Collaborate & Learn',
                description: 'Work with other developers, gain mentorship, and build real-world experience.',
              },
              {
                step: '04',
                title: 'Grow & Succeed',
                description: 'Earn recognition, build your portfolio, and launch your tech career with confidence.',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="glass-card p-8 flex gap-8 items-start"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-accent/20 text-accent text-2xl font-bold">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
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
            className="glass-card text-center p-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Join the Movement?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Become part of a global community of innovators and builders. Your journey starts here.
            </p>
            <button className="glass-button px-8 py-3">
              Get Started Today
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
