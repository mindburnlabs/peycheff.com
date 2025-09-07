import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import CreditMeter from '../components/CreditMeter';
import { trackEvent, EVENTS } from '../lib/analytics';

const Utilities = () => {
  const [email, setEmail] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [trial, setTrial] = useState(null);
  const [message, setMessage] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [usage, setUsage] = useState({ used: 0, limit: 0 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trialToken = params.get('trial');
    const emailParam = params.get('email');
    if (emailParam) setEmail(emailParam);
    if (trialToken) {
      setMessage({ type: 'success', text: 'Welcome! Your Utility Pass trial link is active.' });
    }
  }, []);

  const signupForTrial = async (e) => {
    e?.preventDefault?.();
    if (!email) return;
    try {
      setSignupLoading(true);
      setMessage(null);
      trackEvent(EVENTS.TRIAL_SIGNUP_START, { email: `user_${email}` });

      const res = await fetch('/.netlify/functions/utility-trial-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'utilities_page' })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to activate trial');
      }
      setTrial({
        expires_at: data.data.expires_at,
        usage_limit: data.data.usage_limit,
        usage_remaining: data.data.usage_remaining
      });
      setMessage({ type: 'success', text: 'Trial activated! You can now run utilities.' });
      trackEvent(EVENTS.TRIAL_SIGNUP_COMPLETE, { email: `user_${email}` });
    } catch (err) {
      console.error('Trial signup error', err);
      setMessage({ type: 'error', text: err.message || 'Failed to activate trial' });
    } finally {
      setSignupLoading(false);
    }
  };

  const runDemoUtility = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Enter your email to use utilities.' });
      return;
    }

    try {
      setRunning(true);
      setMessage(null);
      setResult(null);

      // 1) Check entitlements (Pro membership or Trial). Increment on success.
      const checkRes = await fetch('/.netlify/functions/check-entitlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'pro_utility', increment: true })
      });
      const check = await checkRes.json();
      if (!checkRes.ok) throw new Error(check?.error || 'Entitlement check failed');

      const ent = check.entitlement || check.trial || {};
      if (!ent?.allowed) {
        if (ent?.reason === 'trial_limit_reached' || ent?.reason === 'daily_limit_exceeded') {
          trackEvent(EVENTS.TRIAL_LIMIT_REACHED, { email: `user_${email}` });
        }
        const upgradeUrl = ent?.upgradeUrl || '/checkout?product=MEMBER_PRO';
        setMessage({ type: 'warning', text: ent?.message || 'Access requires Pro or an active trial.', upgradeUrl });
        return;
      }

      trackEvent(EVENTS.TRIAL_USAGE_INCREMENT, { email: `user_${email}` });
      if (ent?.trial) {
        const used = (ent.trial.usage_limit || 0) - (ent.trial.remaining || 0) + 1;
        setUsage({ used, limit: ent.trial.usage_limit || 0 });
      }

      // 2) Run a demo utility: generate a quick audit report
      const utilRes = await fetch('/.netlify/functions/generate-audit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: 'Demo Company',
          industry: 'saas',
          techStack: 'react-node',
          teamSize: '5-10',
          email
        })
      });
      const util = await utilRes.json();
      if (!utilRes.ok || !util?.success) {
        throw new Error(util?.error || 'Utility failed');
      }
      setResult(util);
    } catch (err) {
      console.error('Utility run error', err);
      setMessage({ type: 'error', text: err.message || 'Utility failed' });
    } finally {
      setRunning(false);
    }
  };

  const upgradeToPro = async () => {
    try {
      const { createCheckoutSession } = await import('../lib/stripe');
      await createCheckoutSession('MEMBER_PRO', email || null);
    } catch (err) {
      console.error('Upgrade error', err);
      setMessage({ type: 'error', text: 'Checkout failed. Please try again.' });
    }
  };

  return (
    <>
      <SEO title="Utilities" />
      <section className="px-6 pt-32 pb-24">
        <div className="max-w-container mx-auto">
          <h1 className="text-h2 mb-4">AI Utilities</h1>
          <p className="text-text-tertiary mb-8">Access sprint generators, audit tools, and more. Start a free trial to try them.</p>

          <form onSubmit={signupForTrial} className="grid md:grid-cols-3 gap-3 max-w-3xl mb-8">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-input border border-border rounded-lg px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder-muted-foreground"
              required
            />
            <button type="submit" className="btn-primary hover-spring" disabled={signupLoading}>
              {signupLoading ? 'Activating…' : 'Start 7‑day trial'}
            </button>
            <button type="button" className="btn-ghost hover-spring" onClick={upgradeToPro}>
              Upgrade to Pro ($19/mo)
            </button>
          </form>

          {message && (
            <div className={`mb-6 text-sm ${message.type === 'error' ? 'text-red-400' : message.type === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
              {message.text}
              {message.upgradeUrl && (
                <>
                  {' '}
                  <a className="link-primary" href={message.upgradeUrl}>Upgrade</a>
                </>
              )}
            </div>
          )}

          {trial && (
            <div className="rounded-lg border border-border/30 p-4 bg-background/40 mb-8 text-sm">
              <div>Trial expires: {new Date(trial.expires_at).toLocaleString()}</div>
              <div>Usage remaining: {trial.usage_remaining}</div>
            </div>
          )}

          <div className="rounded-xl border border-border/30 p-6 bg-surface/40">
            {usage.limit > 0 && (
              <div className="mb-4">
                <CreditMeter used={usage.used} limit={usage.limit} label="Trial runs" />
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h5">Demo Utility: Quick Audit Report</h2>
              <button className="btn-primary hover-spring" onClick={runDemoUtility} disabled={running}>
                {running ? 'Running…' : 'Run utility'}
              </button>
            </div>
            <p className="text-text-tertiary mb-4">Generates a shareable sample audit report. Counts toward trial usage.</p>

            {result && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="text-green-400">Success! Report generated.</div>
                {result.shareUrl && (
                  <div>
                    Share link: <a className="link-primary" href={result.shareUrl}>{result.shareUrl}</a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Utilities;


