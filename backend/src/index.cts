/** Vercel source entry — use Node adapter (not hono/vercel Web API adapter) */
import { handle } from '@hono/node-server/vercel';
import app from './server/index';

module.exports = handle(app);
