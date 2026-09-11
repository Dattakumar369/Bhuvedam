/** Bundled by build:vercel into api/index.js (CJS). Named so Vercel does not auto-detect it. */
import { handle } from '@hono/node-server/vercel';
import app from './server/index';

module.exports = handle(app);
