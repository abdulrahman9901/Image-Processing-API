import express from 'express';
import images from './api/images';
import posts from './api/posts';
const routes = express.Router();
import { Request, Response } from 'express';

routes.get('/', (req: Request, res: Response) => {
  res.send('this is the main route ');
});

routes.use('/api', images);
routes.use('/api', posts);

export default routes;
