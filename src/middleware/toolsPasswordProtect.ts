import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export function toolsPasswordProtect(req: Request, res: Response, next: NextFunction) {
  const password = config.toolsPassword || "admin123";
  if (!password) {
    return res.status(500).send('Tools password not configured.');
  }

  // Check cookie first
  const cookiePassword = req.cookies?.tools_password;
  if (cookiePassword === password) {
    return next();
  }

  // Check provided password
  const provided = req.query?.password || req.body?.password || req.headers['x-tools-password'];
  if (provided === password) {
    // Set cookie for future requests (httpOnly=false so browser JS can read if needed)
    res.cookie('tools_password', password, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false });
    return next();
  }

  // If not authorized, show a simple password form (for GET requests)
  if (req.method === 'GET') {
    res.status(401).send(`
      <form method="POST" style="margin:2em auto;max-width:320px;text-align:center;">
        <h2>Tools Password Required</h2>
        <input type="password" name="password" placeholder="Password" style="width:100%;padding:8px;" autofocus />
        <button type="submit" style="margin-top:1em;padding:8px 16px;">Enter</button>
      </form>
    `);
    return;
  }
  res.status(401).send('Unauthorized: Invalid or missing password.');
}
