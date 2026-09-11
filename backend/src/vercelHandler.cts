/** Vercel serverless entry — CJS default export must be the handler function itself. */
import { handle } from 'hono/vercel';
import app from './server/index';

// Important: Vercel expects module.exports = fn, not { default: fn }
module.exports = handle(app);
