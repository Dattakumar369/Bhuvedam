/** Vercel serverless entry */
import { handle } from 'hono/vercel';
import app from './server/index';

export default handle(app);
