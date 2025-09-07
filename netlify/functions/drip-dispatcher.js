import { createClient } from '@supabase/supabase-js';
import { emailService } from './lib/email-service';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const handler = async () => {
  try {
    const now = new Date().toISOString();
    const { data: due, error } = await supabase
      .from('drip_queue')
      .select('*')
      .lte('scheduled_at', now)
      .is('sent_at', null)
      .limit(25);

    if (error) throw error;

    for (const item of due || []) {
      try {
        await emailService.sendTestEmail(item.email); // placeholder template hook
        await supabase.from('drip_queue').update({ sent_at: new Date().toISOString() }).eq('id', item.id);
      } catch (e) {
        console.error('drip send failed', e);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ processed: (due || []).length }) };
  } catch (e) {
    console.error('drip-dispatcher error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};


