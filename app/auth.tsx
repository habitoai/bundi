'use client';

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ReactElement } from 'react';

export default function AuthPage(): ReactElement {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'sign-up' ? 'sign-up' : 'sign-in';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 py-2 font-medium text-center ${
              activeTab === 'sign-in'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('sign-in')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 font-medium text-center ${
              activeTab === 'sign-up'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('sign-up')}
          >
            Sign Up
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'sign-in' ? (
            <SignIn 
              routing="path" 
              path="/auth"
              signUpUrl="/auth?tab=sign-up"
              afterSignInUrl="/chat"
            />
          ) : (
            <SignUp 
              routing="path" 
              path="/auth"
              signInUrl="/auth?tab=sign-in"
              afterSignUpUrl="/chat"
            />
          )}
        </div>
      </div>
    </div>
  );
}
