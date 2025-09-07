import React from 'react';

const ReferralShare = ({ label = 'Share and help a friend', path = '/' }) => {
  const share = async () => {
    try {
      const url = new URL(window.location.origin + path);
      const existing = new URLSearchParams(window.location.search).get('ref');
      // naive: use hashed timestamp as a lightweight ref id
      const myRef = existing || `r${Math.random().toString(36).slice(2, 8)}`;
      url.searchParams.set('ref', myRef);
      await navigator.clipboard.writeText(url.toString());
      alert('Link copied to clipboard');
    } catch (e) {}
  };

  return (
    <button className="btn-ghost" onClick={share}>{label}</button>
  );
};

export default ReferralShare;


