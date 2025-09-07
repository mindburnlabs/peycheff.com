import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { trackEvent, EVENTS } from '../../lib/analytics';

const NowBar = () => {
  const [nowStatus, setNowStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetchNowStatus();
    
    // Set up real-time subscription for Now status updates
    const channel = supabase
      .channel('now-status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'now_status'
      }, (payload) => {
        console.log('Now status updated:', payload);
        if (payload.new) {
          animateUpdate(() => setNowStatus(payload.new));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNowStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('now_status')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching now status:', error);
        // Fallback to default status
        setNowStatus({
          text: 'Building autopilot systems, shipping operator notes, and taking build sprints.',
          show_cta: false,
          cta_text: null,
          cta_url: null
        });
      } else if (data) {
        setNowStatus(data);
      }
    } catch (error) {
      console.error('Now status fetch error:', error);
      // Fallback with default message
      setNowStatus({
        text: 'Building autopilot systems, shipping operator notes, and taking build sprints.',
        show_cta: false,
        cta_text: null,
        cta_url: null
      });
    }
  };

  const animateUpdate = (callback) => {
    setIsAnimating(true);
    setTimeout(() => {
      callback();
      setIsAnimating(false);
    }, 150);
  };

  const handleCTAClick = () => {
    trackEvent(EVENTS.CTA_WORK, {
      cta_location: 'now_bar',
      cta_text: nowStatus?.cta_text,
      cta_url: nowStatus?.cta_url
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Track dismissal
    trackEvent('now_bar_dismissed', {
      now_text: nowStatus?.text?.substring(0, 50)
    });
  };

  if (!isVisible || !nowStatus) return null;

  return (
    <div className="bg-surface/30 border-b border-border relative group">
      <div className="max-w-container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center justify-center">
            <p className={`text-[14px] text-muted-foreground text-center transition-all duration-150 ${
              isAnimating ? 'opacity-50 translate-y-1' : 'opacity-100 translate-y-0'
            }`}>
              <span className="font-semibold text-foreground">Now</span> — {nowStatus.text}
              {nowStatus.show_cta && nowStatus.cta_text && (
                <>
                  {' '}
                  <a 
                    href={nowStatus.cta_url}
                    onClick={handleCTAClick}
                    className="inline-flex items-center ml-2 px-2 py-1 bg-accent/10 text-accent text-[13px] font-medium rounded-md hover:bg-accent/20 transition-colors duration-200"
                  >
                    {nowStatus.cta_text}
                    <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </>
              )}
            </p>
          </div>
          
          {/* Dismissible */}
          <button
            onClick={handleDismiss}
            className="opacity-0 group-hover:opacity-100 ml-4 p-1 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-md hover:bg-surface/50"
            title="Dismiss"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NowBar;
