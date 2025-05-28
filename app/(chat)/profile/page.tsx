'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { SessionInfo } from './session-info';

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // If not authenticated after loading, redirect to auth page
    if (isLoaded && !isSignedIn) {
      redirect('/auth');
    }
  }, [isLoaded, isSignedIn]);
  
  // Show loading state while checking authentication
  if (!isClient || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Please wait while we load your profile.
          </p>
        </div>
      </div>
    );
  }
  
  // If not signed in, show auth required message
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Please sign in to view this page.
          </p>
        </div>
      </div>
    );
  }

  // Format the user's creation date
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Section */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24 mb-4 rounded-full overflow-hidden">
                <Image 
                  src={user.imageUrl} 
                  alt={user.firstName || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold text-center">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-center">{user.emailAddresses[0]?.emailAddress}</p>
              <div className="mt-4">
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
                  {user.publicMetadata?.role || 'User'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Member since {createdAt}</p>
            </div>
          </div>
          
          {/* Session Information */}
          <SessionInfo />
        </div>

        {/* User Details Section */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold mb-1">Account Details</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Your personal information and account settings</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Addresses</h3>
              <div className="mt-1 space-y-1">
                {user.emailAddresses.map((email) => (
                  <div key={email.id} className="flex items-center justify-between">
                    <p className="text-sm">{email.emailAddress}</p>
                    {email.id === user.primaryEmailAddressId && (
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Numbers</h3>
              <div className="mt-1">
                {user.phoneNumbers.length > 0 ? (
                  <div className="space-y-1">
                    {user.phoneNumbers.map((phone) => (
                      <div key={phone.id} className="flex items-center justify-between">
                        <p className="text-sm">{phone.phoneNumber}</p>
                        {phone.id === user.primaryPhoneNumberId && (
                          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No phone numbers added</p>
                )}
              </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Authentication Methods</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {user.passwordEnabled && (
                  <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
                    Password
                  </span>
                )}
                {user.totpEnabled && (
                  <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
                    Two-factor Authentication
                  </span>
                )}
                {user.externalAccounts.map((account) => (
                  <span key={account.id} className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full capitalize">
                    {account.provider}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
