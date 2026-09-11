/**
 * Vercel Node serverless entry.
 * getRequestListener properly reads POST bodies (unlike broken helpers / wrong export shapes).
 */
import { getRequestListener } from '@hono/node-server';
import app from './server/index';

module.exports = getRequestListener(app.fetch);
