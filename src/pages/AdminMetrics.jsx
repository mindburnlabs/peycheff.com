import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';

const AdminMetrics = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/.netlify/functions/metrics-dashboard', {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_DASH_SECRET || 'default'}` }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load metrics');
        setData(json);
      } catch (e) {
        setError(e.message);
      }
    };
    load();
  }, []);

  return (
    <>
      <SEO title="Metrics" />
      <section className="px-6 pt-24 pb-16">
        <div className="max-w-container mx-auto">
          <h1 className="text-h3 mb-6">Metrics Dashboard</h1>
          {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
          {!data ? (
            <div className="text-text-tertiary">Loading…</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-lg border border-border/30 p-4 bg-background/40">
                <div className="text-sm text-text-tertiary">Attach Rate</div>
                <div className="text-h4">{(data.kpis.attach_rate * 100).toFixed(1)}%</div>
              </div>
              <div className="rounded-lg border border-border/30 p-4 bg-background/40">
                <div className="text-sm text-text-tertiary">Trials</div>
                <div className="text-h4">{(data.trials || []).reduce((a, b) => a + (b.count || 0), 0)}</div>
              </div>
              <div className="rounded-lg border border-border/30 p-4 bg-background/40">
                <div className="text-sm text-text-tertiary">Days Tracked</div>
                <div className="text-h4">{(data.daily || []).length}</div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AdminMetrics;


