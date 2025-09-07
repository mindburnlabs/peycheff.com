import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { getActiveExperiments, isFeatureEnabled } from '../lib/experiments';

const ControlCenter = () => {
  const [flags, setFlags] = useState([
    'PROGRAMMATIC_PAGES','AUDIT_REPORTS','POST_PURCHASE_UPSELL','MEMBER_PRO_FEATURES','PREVIEW_EMAIL_GATE','LINEAR_GRADE_MOTION','CONTAINER_LIGHT_LAYOUT'
  ]);
  const [experiments, setExperiments] = useState([]);
  const [_, force] = useState(0);

  useEffect(() => {
    setExperiments(getActiveExperiments());
  }, []);

  const toggleFlag = (flag) => {
    const key = `flag_${flag}`;
    const current = localStorage.getItem(key);
    const next = !(current === 'true');
    localStorage.setItem(key, String(next));
    force(x => x + 1);
  };

  const setExperimentOverride = (key, variantKey) => {
    localStorage.setItem(`exp_${key}_override`, variantKey || '');
    force(x => x + 1);
  };

  const clearAll = () => {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('flag_') || k.includes('_override')) localStorage.removeItem(k);
    });
    force(x => x + 1);
  };

  return (
    <>
      <SEO title="Control Center" />
      <section className="px-6 pt-24 pb-16">
        <div className="max-w-container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-h3">Control Center</h1>
            <button className="btn-ghost" onClick={clearAll}>Clear overrides</button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-xl border border-border/30 p-6 bg-surface/40">
              <h2 className="text-h5 mb-4">Feature Flags</h2>
              <div className="space-y-3">
                {flags.map(flag => {
                  const key = `flag_${flag}`;
                  const overridden = localStorage.getItem(key);
                  const enabled = overridden !== null ? overridden === 'true' : isFeatureEnabled(flag);
                  return (
                    <label key={flag} className="flex items-center justify-between">
                      <span className="text-sm">{flag}</span>
                      <input type="checkbox" checked={enabled} onChange={() => toggleFlag(flag)} />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border/30 p-6 bg-surface/40">
              <h2 className="text-h5 mb-4">Experiments</h2>
              <div className="space-y-4">
                {experiments.map(exp => {
                  const overrideKey = localStorage.getItem(`exp_${exp.key}_override`) || '';
                  return (
                    <div key={exp.key}>
                      <div className="text-sm mb-2">{exp.key}</div>
                      <div className="flex gap-2 flex-wrap">
                        <button className={`btn-ghost ${overrideKey === '' ? 'ring-1 ring-accent' : ''}`} onClick={() => setExperimentOverride(exp.key, '')}>auto</button>
                        {exp.variants.map(v => (
                          <button key={v} className={`btn-ghost ${overrideKey === v ? 'ring-1 ring-accent' : ''}`} onClick={() => setExperimentOverride(exp.key, v)}>{v}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ControlCenter;


