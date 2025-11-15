'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, Database, Zap, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function RealtimeDashboard() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading, createProject } = useProjects();
  const { profile, loading: profileLoading } = useUserProfile();
  
  const [creating, setCreating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  useEffect(() => {
    // Update timestamp whenever projects change
    setLastUpdate(new Date());
  }, [projects]);

  const handleCreateProject = async () => {
    if (!user || !projectTitle.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    setCreating(true);
    try {
      const result = await createProject({
        title: projectTitle,
        excerpt: projectDesc || 'No description provided',
        description: projectDesc,
        author: {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
          avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=random`,
        },
        tags: ['test', 'realtime'],
        media: [],
        repoLink: '',
        isFeatured: false,
      });

      if (result && 'success' in result && result.success) {
        toast.success('Project created! Watch it appear in real-time below 🎉');
        setProjectTitle('');
        setProjectDesc('');
      } else if (result && 'error' in result) {
        const errorMsg = typeof result.error === 'string' ? result.error : 'Failed to create project';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Zap className="text-accent" />
          Real-time Dashboard
        </h1>
        <p className="text-muted-foreground">
          All data syncs automatically with Firestore. No page refresh needed!
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-accent" />
              Data Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-accent">
                {process.env.NEXT_PUBLIC_DATA_SOURCE === 'firebase' ? 'Firebase' : 'Mock'}
              </p>
              <p className="text-sm text-muted-foreground">
                {process.env.NEXT_PUBLIC_DATA_SOURCE === 'firebase' 
                  ? '✓ Connected to Firestore' 
                  : '⚠️ Using local mock data'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-400" />
              Live Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-400">Active</p>
              <p className="text-sm text-muted-foreground">
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-400">
                {projectsLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : projects.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Synced in real-time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Profile Status */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle>Your Profile (Real-time)</CardTitle>
          <CardDescription>
            Profile data syncs automatically from Firestore
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading profile...</span>
            </div>
          ) : profile ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {profile.displayName}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Bio:</strong> {profile.bio || 'No bio added'}</p>
              <p><strong>Location:</strong> {profile.location || 'Not set'}</p>
              <p><strong>Skills:</strong> {profile.skills?.join(', ') || 'None added'}</p>
              <p className="text-xs text-muted-foreground mt-4">
                ℹ️ Edit your profile at <a href="/profile" className="text-accent hover:underline">/profile</a> and see changes update here instantly!
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">No profile data found. Create one at /profile</p>
          )}
        </CardContent>
      </Card>

      {/* Create Project Test */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle>Test Real-time Sync</CardTitle>
          <CardDescription>
            Create a project and watch it appear instantly in the list below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Title</label>
            <Input
              placeholder="My Awesome Project"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="glass-input"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="What's your project about?"
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              className="glass-input"
              rows={3}
            />
          </div>
          <Button 
            onClick={handleCreateProject} 
            disabled={creating || !user}
            className="glass-button w-full"
          >
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {creating ? 'Creating...' : 'Create Test Project'}
          </Button>
          {!user && (
            <p className="text-sm text-amber-400">
              ⚠️ Please sign in to create projects
            </p>
          )}
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Projects (Real-time)</span>
            {projectsLoading && <Loader2 className="h-5 w-5 animate-spin text-accent" />}
          </CardTitle>
          <CardDescription>
            Projects update automatically when anyone creates, updates, or deletes them
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No projects yet. Create one above to test real-time sync!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 10).map((project) => (
                <div 
                  key={project.id} 
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{project.excerpt}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>By {project.author.name}</span>
                        <span>•</span>
                        <span>{project.likeCount} likes</span>
                        <span>•</span>
                        <span>{project.commentCount} comments</span>
                        <span>•</span>
                        <span>{new Date(project.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {project.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="text-xs px-2 py-1 rounded bg-accent/10 text-accent border border-accent/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length > 10 && (
                <p className="text-center text-sm text-muted-foreground pt-4">
                  Showing 10 of {projects.length} projects. Visit <a href="/projects" className="text-accent hover:underline">/projects</a> to see all.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="glass-card border-accent/20 border-2">
        <CardHeader>
          <CardTitle>How to Test Real-time Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Option 1: Multiple Tabs</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
              <li>Open this page in two browser tabs</li>
              <li>Create a project in one tab</li>
              <li>Watch it appear instantly in the other tab! ✨</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Option 2: Profile Sync</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
              <li>Keep this tab open</li>
              <li>Open <a href="/profile" className="text-accent hover:underline">/profile</a> in another tab</li>
              <li>Click "Edit Profile" and add bio/skills</li>
              <li>Save and watch this page update automatically! ✨</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Option 3: Firebase Console</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
              <li>Go to <a href="https://console.firebase.google.com" target="_blank" className="text-accent hover:underline">Firebase Console</a></li>
              <li>Navigate to Firestore Database</li>
              <li>Add/edit/delete a document in the "projects" collection</li>
              <li>Watch this page update in real-time! ✨</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
