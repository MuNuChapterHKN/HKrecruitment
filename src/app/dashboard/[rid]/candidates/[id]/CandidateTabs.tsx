'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Tab = 'details' | 'history';

type CandidateTabsProps = {
  detailsContent: React.ReactNode;
  historyContent: React.ReactNode;
};

export function CandidateTabs({
  detailsContent,
  historyContent,
}: CandidateTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details');

  return (
    <div className="space-y-6">
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            Stage History
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'details' && detailsContent}
        {activeTab === 'history' && historyContent}
      </div>
    </div>
  );
}
