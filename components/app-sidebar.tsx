'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { UserIcon } from 'lucide-react';
import { SignOutButton } from '@/components/sign-out-button';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function AppSidebar() {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { user, isSignedIn } = useUser();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Chatbot
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory />
      </SidebarContent>
      <SidebarFooter>
        {user && !user.emailAddresses[0]?.emailAddress.match(/^guest-/) && (
          <>
            <div className="px-3 py-2">
              <Link 
                href="/profile" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted px-2 py-1.5 w-full cursor-pointer transition-colors"
                onClick={() => setOpenMobile(false)}
              >
                <UserIcon size={16} />
                <span>Profile</span>
              </Link>
            </div>
            <div className="px-3 py-2">
              <SignOutButton />
            </div>
          </>
        )}
        <SidebarUserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
