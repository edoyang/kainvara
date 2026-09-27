// Single Vercel function for the whole API. vercel.json rewrites every
// /api/* request here and Express does the routing.
import app from '../server/app.js'

export default app
