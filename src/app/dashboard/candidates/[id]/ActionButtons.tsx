"use client";

import { useState } from "react";
import type { ApplicationStage } from "@/db/types";
import { stageConfig } from "./statusConfig";
import ActionModals from "./ActionModals";

interface ActionButtonsProps {
  stage: ApplicationStage;
  candidateId: string;
}

export default function ActionButtons({ stage, candidateId }: ActionButtonsProps) {
  const config = stageConfig[stage];
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>("");

  const handleButtonClick = (action: string) => {
    console.log(`Action: ${action} for candidate ${candidateId}`);
    
    // Azioni che non richiedono modal
    if (action === "accept") {
      handleDirectAction(action);
      return;
    }

    // Tutte le altre azioni richiedono modal
    setCurrentAction(action);
    setModalOpen(true);
  };

  const handleDirectAction = (action: string) => {
    // TODO: Implementare le azioni dirette (chiamate API senza form)
    console.log(`Direct action: ${action}`);
  };

  const handleModalSubmit = (formData: any) => {
    console.log(`Modal action: ${currentAction}`, formData);
    // TODO: Implementare le azioni con dati del form (chiamate API)
  };

  return (
    <>
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
              Nessuna azione disponibile per questo stage
            </div>
          )}
        </div>
      </div>

      <ActionModals
        isOpen={modalOpen}
        modalType={currentAction}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        candidateId={candidateId}
      />
    </>
  );
}