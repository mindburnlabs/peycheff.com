import React from 'react';

const CreditMeter = ({ used = 0, limit = 0, label = 'Utilities' }) => {
  const clamped = Math.max(0, Math.min(limit, used));
  const pct = limit > 0 ? Math.min(100, Math.round((clamped / limit) * 100)) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-40 h-2 bg-border/40 rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-text-tertiary">
        {label}: {clamped}/{limit}
      </div>
    </div>
  );
};

export default CreditMeter;


