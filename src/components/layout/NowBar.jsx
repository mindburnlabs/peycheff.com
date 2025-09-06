import React from 'react';

const NowBar = () => {
  return (
    <div className="bg-surface/30 border-b border-border">
      <div className="max-w-container mx-auto px-6 py-3">
        <p className="text-[14px] text-muted-foreground text-center">
          <span className="font-semibold">Now</span> — Building small AI utilities, writing two operator notes, and taking two build sprints this month.
        </p>
      </div>
    </div>
  );
};

export default NowBar;
