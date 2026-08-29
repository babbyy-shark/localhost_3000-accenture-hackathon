import React from 'react';

interface SplitScreenProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function SplitScreen({ leftPanel, rightPanel }: SplitScreenProps) {
  return (
    <div className="flex h-screen w-full bg-[#09090b] text-[#e5e1e4] overflow-hidden flex-col md:flex-row font-sans">
      {/* Left Panel: Employee Chat View */}
      <section className="flex-1 flex flex-col border-r border-[#27272a] h-full relative z-10 bg-[#09090b]">
        {leftPanel}
      </section>
      
      {/* Right Panel: ControlPlane Dashboard (X-Ray) */}
      <section className="flex-1 flex flex-col xray-panel h-full relative z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#131315] to-[#09090b]">
        {/* Header is handled in page.tsx or within rightPanel but we can wrap it if needed */}
        {rightPanel}
      </section>
    </div>
  );
}
