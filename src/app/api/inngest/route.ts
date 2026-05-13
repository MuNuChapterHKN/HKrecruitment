import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { functions } from '@/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
  servePath: '/recruitment/api/inngest',
  serveOrigin:
    process.env.INNGEST_SERVE_ORIGIN ||
    process.env.HKRECRUITMENT_URL ||
    'http://localhost:3000',
});
