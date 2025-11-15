'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProjectFeed, useCreateProject } from '@/src/hooks/useProjects';
import { slugify } from '@/src/lib/slug';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DevAuthPage() {
  const { user, loading, error, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const { projects, isLoading: projectsLoading, refresh } = useProjectFeed({ limit: 10 });
  const createProjectMutation = useCreateProject();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleSignIn = async () => {
    const result = await signIn(email, password);
    if (!result.success) {
      setAuthError(result.error || 'Sign in failed');
    } else {
      setAuthError('');
    }
  };

  const handleSignUp = async () => {
    const result = await signUp(email, password);
    if (!result.success) {
      setAuthError(result.error || 'Sign up failed');
    } else {
      setAuthError('');
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      setAuthError(result.error || 'Google sign in failed');
    } else {
      setAuthError('');
    }
  };

  const handleCreateSampleProject = async () => {
    if (!user) {
      alert('Please sign in first!');
      return;
    }

    try {
      const project = await createProjectMutation.mutateAsync({
        owner: {
          id: user.uid,
          displayName: user.displayName || user.email || 'Anonymous',
          avatarUrl: user.photoURL || '/avatar-placeholder.png',
          role: 'member',
        },
        title: 'Sample Firebase Project',
        slug: slugify(`sample-${Date.now()}`),
        summary: 'This is a test project created from the dev auth page.',
        description: 'Testing Firebase Firestore integration with YouthForge.',
        tags: ['firebase', 'test', 'dev'],
        media: [],
        visibility: 'public',
        repoUrl: 'https://github.com/example/sample',
      });
      alert(`Project created with ID: ${project.id}`);
      refresh();
    } catch (creationError) {
      const message = creationError instanceof Error ? creationError.message : 'Failed to create project';
      alert(message);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Firebase Auth & Data Test</h1>
      
      {/* Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>
            Data Source: <strong>{process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock'}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p>Loading auth state...</p>
          ) : user ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✓ Signed In</p>
              <div className="text-sm space-y-1">
                <p><strong>UID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Display Name:</strong> {user.displayName || 'N/A'}</p>
                <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
              </div>
              <Button onClick={signOut} variant="destructive">Sign Out</Button>
            </div>
          ) : (
            <p className="text-red-600 font-semibold">✗ Not Signed In</p>
          )}
          
          {error && <p className="text-red-500 text-sm">Auth Error: {error}</p>}
          {authError && <p className="text-red-500 text-sm">{authError}</p>}
        </CardContent>
      </Card>

      {/* Sign In / Sign Up */}
      {!user && (
        <Card>
          <CardHeader>
            <CardTitle>Sign In / Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleSignIn}>Sign In</Button>
              <Button onClick={handleSignUp} variant="secondary">Sign Up</Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Projects Data */}
      <Card>
        <CardHeader>
          <CardTitle>Projects Data</CardTitle>
          <CardDescription>
            {process.env.NEXT_PUBLIC_DATA_SOURCE === 'firebase' 
              ? 'Loading from Firestore' 
              : 'Loading from Mock Store'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectsLoading ? (
            <p>Loading projects...</p>
          ) : (
            <div>
              <p className="mb-2"><strong>Total Projects:</strong> {projects.length}</p>
              {projects.length === 0 && (
                <p className="text-yellow-600">
                  No projects found. {user && 'Create a sample project below!'}
                </p>
              )}
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="border-l-2 border-blue-500 pl-3 mb-2">
                  <p className="font-semibold">{project.title}</p>
                  <p className="text-sm text-gray-600">{project.summary}</p>
                  <p className="text-xs text-gray-400">
                    {project.likesCount} likes • {project.commentsCount} comments
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {user && (
            <Button onClick={handleCreateSampleProject} className="mt-4">
              Create Sample Project
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Enable Firebase Auth:</strong> Go to Firebase Console → Authentication → 
              Sign-in method → Enable Email/Password and Google
            </li>
            <li>
              <strong>Create a test user:</strong> Use the sign-up form above or create one in 
              Firebase Console
            </li>
            <li>
              <strong>Set up Firestore:</strong> Go to Firebase Console → Firestore Database → 
              Create database (test mode for now)
            </li>
            <li>
              <strong>Create a project:</strong> Once signed in, click "Create Sample Project" 
              to test Firestore writes
            </li>
            <li>
              <strong>Verify data:</strong> Check Firebase Console → Firestore to see the new 
              project document
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
