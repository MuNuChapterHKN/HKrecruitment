"use client";

import type { Applicant } from "@/db/types";

import { stageButtons } from "./stageButtons";

export default function ActionButtons({ applicant }: {
  applicant: Applicant
}) {
  const buttons = stageButtons[applicant.stage];

  return (
    <div className="lg:col-span-1">
      <h2 className="text-2xl font-semibold mb-4">Azioni</h2>
      <div className="space-y-3">
        {buttons.length > 0 ? (
          buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => button.callback(applicant)}
              className={`w-full ${button.className} text-white px-4 py-3 rounded-md font-medium transition-colors`}
            >
              {button.text}
            </button>
          ))
        ) : (
          <div className="text-muted-foreground text-center py-4">
            Nessuna azione disponibile per questo stage
          </div>
        )}
      </div>
    </div>
  );
}
