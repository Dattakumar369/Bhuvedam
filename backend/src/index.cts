/** Vercel serverless entry — bundled to api/index.cjs by build:vercel. */
import { handle } from '@hono/node-server/vercel';
import app from './server/index';

module.exports = handle(app);
