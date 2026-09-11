/** Vercel entry — Web Standard handler (supports JSON body). */
import { handle } from 'hono/vercel';
import app from './server/index';

export default handle(app);
