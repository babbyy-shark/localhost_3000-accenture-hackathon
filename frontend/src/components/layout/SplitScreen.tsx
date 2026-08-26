import React from 'react';

interface SplitScreenProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function SplitScreen({ leftPanel, rightPanel }: SplitScreenProps) {
  return (
    <div className="flex h-screen w-full bg-[#0A0A0F] text-slate-100 overflow-hidden">
      {/* Left Panel: Employee Chat View */}
      <div className="w-1/2 h-full border-r border-[#1E1E2E] flex flex-col bg-[#0A0A0F]">
        {leftPanel}
      </div>
      
      {/* Right Panel: ControlPlane Dashboard (X-Ray) */}
      <div className="w-1/2 h-full flex flex-col bg-[#12121A] overflow-y-auto">
        {rightPanel}
      </div>
    </div>
  );
}
