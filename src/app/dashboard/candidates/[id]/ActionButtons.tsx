"use client";

import { ApplicationStage } from "@/db/types";
import { statusConfig} from "./statusConfig";

interface ActionButtonsProps {
  status: ApplicationStage;
  candidateId: string;
}

export default function ActionButtons({ status, candidateId }: ActionButtonsProps) {
  const config = statusConfig[status];

  const handleButtonClick = (action: string) => {
    console.log(`Action: ${action} for candidate ${candidateId}`);
    // TODO: Implementare le azioni reali (chiamate API, ecc.)
  };

  return (
    <div className="lg:col-span-1">
      <h2 className="text-2xl font-semibold mb-4">Azioni</h2>
      <div className="space-y-3">
        {config.buttons.length > 0 ? (
          config.buttons.map((button, index) => (
            <button 
              key={index}
              onClick={() => handleButtonClick(button.action)}
              className={`w-full ${button.color} ${button.hoverColor} text-white px-4 py-3 rounded-md font-medium transition-colors`}
            >
              {button.text}
            </button>
          ))
        ) : (
          <div className="text-muted-foreground text-center py-4">
            Nessuna azione disponibile per questo stato
          </div>
        )}
      </div>
    </div>
  );
}