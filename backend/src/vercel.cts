/** Bundled by npm run build:vercel → api/index.cjs (CommonJS for Vercel runtime) */
import { handle } from 'hono/vercel';
import app from './server/index';

module.exports = handle(app);
