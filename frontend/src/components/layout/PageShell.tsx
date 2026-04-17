import React from 'react';
import { TopNavbar } from './TopNavbar';
import { BottomTabBar } from './BottomTabBar';

interface PageShellProps {
  children: React.ReactNode;
  hideTabBar?: boolean;
  className?: string;
  /** Optional width mode for page container */
  maxWidth?: 'default' | 'wide' | 'full';
}

const maxWidthMap = {
  default: 'w-full',
  wide: 'max-w-screen-2xl',
  full: 'w-full',
};

export const PageShell: React.FC<PageShellProps> = ({
  children,
  hideTabBar = false,
  className = '',
  maxWidth = 'full',
}) => (
  <div className="min-h-screen bg-surface-muted">
    <TopNavbar />

    {/* offset for fixed top navbar on desktop */}
    <main className={`lg:pt-16 pb-20 lg:pb-8 ${className}`}>
      <div className={`${maxWidthMap[maxWidth]} mx-auto w-full`}>
        {children}
      </div>
    </main>

    {!hideTabBar && <BottomTabBar />}
  </div>
);
