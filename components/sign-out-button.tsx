'use client';

import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export function SignOutButton() {
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      // Use redirectUrl to properly redirect to auth page after sign-out
      await signOut({
        redirectUrl: '/auth'
      });
      // No need for manual router navigation as Clerk handles the redirect
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="px-2 py-1.5">
      <div 
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted px-2 py-1.5 w-full cursor-pointer transition-colors"
        onClick={() => handleSignOut()}
        role="button"
        tabIndex={0}
        data-testid="sign-out-button"
        aria-disabled={isLoading}
      >
        <LogOut size={16} />
        <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
      </div>
    </div>
  );
}
