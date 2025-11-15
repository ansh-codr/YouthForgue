'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut, FolderGit2, Zap, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none focus:ring-2 focus:ring-accent rounded-full">
        <Avatar className="h-9 w-9 ring-2 ring-accent/20 hover:ring-accent/50 transition-all cursor-pointer">
          <AvatarImage src={user.photoURL || undefined} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-accent to-accent-secondary text-white text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card border-white/20">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem 
          onClick={() => router.push('/profile')}
          className="cursor-pointer hover:bg-white/10"
        >
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push('/projects')}
          className="cursor-pointer hover:bg-white/10"
        >
          <FolderGit2 className="mr-2 h-4 w-4" />
          <span>My Projects</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push('/challenges')}
          className="cursor-pointer hover:bg-white/10"
        >
          <Zap className="mr-2 h-4 w-4" />
          <span>Challenges</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={loading}
          className="cursor-pointer hover:bg-white/10 text-red-400 focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
