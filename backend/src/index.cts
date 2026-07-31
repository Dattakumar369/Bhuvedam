/** Vercel source entry — bundled to api/index.cjs at build time */
import { handle } from 'hono/vercel';
import app from './server/index';

module.exports = handle(app);
