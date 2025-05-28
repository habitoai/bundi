'use client';

import { useAuth, useUser } from '@clerk/nextjs';

export function SessionInfo() {
  const { isLoaded: isAuthLoaded, sessionId, getToken } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  
  // Function to copy token to clipboard
  const copyTokenToClipboard = async () => {
    try {
      const token = await getToken();
      if (token) {
        await navigator.clipboard.writeText(token);
        alert('Token copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  };

  if (!isAuthLoaded || !isUserLoaded) {
    return <SessionInfoSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">Active Session</h2>
        <p className="text-gray-500 dark:text-gray-400">Information about your current authentication session</p>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Session ID</h3>
          <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded-md mt-1 overflow-auto">{sessionId}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Session Status</h3>
          <div className="mt-2">
            <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Active</h3>
          <p className="text-sm mt-1">
            {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : 'Unknown'}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Authentication Token</h3>
          <div className="flex items-center mt-2">
            <button
              onClick={copyTokenToClipboard}
              className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Copy Token to Clipboard
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">(For API requests)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionInfoSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">Active Session</h2>
        <p className="text-gray-500 dark:text-gray-400">Information about your current authentication session</p>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Session ID</h3>
          <div className="h-8 w-full mt-1 bg-gray-200 dark:bg-gray-600 animate-pulse rounded-md"></div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Session Status</h3>
          <div className="h-6 w-20 mt-2 bg-gray-200 dark:bg-gray-600 animate-pulse rounded-md"></div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Active</h3>
          <div className="h-5 w-40 mt-1 bg-gray-200 dark:bg-gray-600 animate-pulse rounded-md"></div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Authentication Token</h3>
          <div className="h-8 w-48 mt-2 bg-gray-200 dark:bg-gray-600 animate-pulse rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
