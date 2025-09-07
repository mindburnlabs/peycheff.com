import React, { useState } from 'react';
import { createCheckoutSession } from '../lib/stripe';

const CheckoutCopilot = () => {
  const [goal, setGoal] = useState('');
  const [stack, setStack] = useState('');
  const [includeAudit, setIncludeAudit] = useState(true);
  const [loading, setLoading] = useState(false);

  const runPreviewThenCheckout = async () => {
    try {
      setLoading(true);
      // Optional: could call preview function here to personalize text
      await createCheckoutSession('PACK_30DAY', { context: { goal, stack } }, includeAudit ? 'AUDIT_PRO' : null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/30 p-4 bg-surface/40">
      <div className="text-sm text-text-tertiary mb-3">Checkout Copilot</div>
      <div className="grid md:grid-cols-3 gap-2">
        <input className="bg-input border border-border rounded-lg px-3 py-2" placeholder="Your goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
        <input className="bg-input border border-border rounded-lg px-3 py-2" placeholder="Your stack" value={stack} onChange={(e) => setStack(e.target.value)} />
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeAudit} onChange={(e) => setIncludeAudit(e.target.checked)} />
          Include Audit Pro bump
        </label>
      </div>
      <div className="mt-3">
        <button className="btn-primary" onClick={runPreviewThenCheckout} disabled={loading}>{loading ? 'Starting…' : 'Start Checkout'}</button>
      </div>
    </div>
  );
};

export default CheckoutCopilot;


