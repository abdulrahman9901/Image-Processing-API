import express, { Request, Response, NextFunction } from 'express';
import routes from './routes/index';
const app = express();

const port = 3000;

const getPort = (): number => port;

// Middleware for parsing JSON and URL-encoded data
app.use(require('express').json({ limit: '10mb' }));
app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS for cross-origin requests
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use('/', routes);

app.listen(port, () => console.log(`server running on port ${port}`));

export { app, getPort };
