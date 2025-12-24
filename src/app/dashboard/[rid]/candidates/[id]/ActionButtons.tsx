'use client';

import type { Applicant } from '@/db/types';

import { stageButtons } from './stageButtons';

export default function ActionButtons({ applicant }: { applicant: Applicant }) {
  const buttons = stageButtons[applicant.stage];

  return (
    <div className="space-y-3">
      {buttons.length > 0 ? (
        buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => button.callback(applicant)}
            className={`w-full ${button.className} text-white px-4 py-2.5 rounded-md font-medium transition-colors`}
          >
            {button.text}
          </button>
        ))
      ) : (
        <div className="text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
          Nessuna azione disponibile per questo stage
        </div>
      )}
    </div>
  );
}
