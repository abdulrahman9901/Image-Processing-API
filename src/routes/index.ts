import express from 'express';
import images from './api/images';
import posts from './api/posts';
const routes = express.Router();
import { Request, Response } from 'express';

routes.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the Image Processing & Posts API',
    version: '1.0.0',
    endpoints: {
      images: {
        'GET /api/images': 'Resize existing images with query params: filename, width, height',
        'POST /api/images': 'Upload new images with optional auto-processing',
        'GET /api/images/list': 'List all available images'
      },
      posts: {
        'GET /api/posts': 'Get all posts with optional filters (category, status, author, tag, limit, offset)',
        'POST /api/posts': 'Create a new post',
        'GET /api/posts/:id': 'Get a specific post by ID',
        'PUT /api/posts/:id': 'Update a post by ID',
        'DELETE /api/posts/:id': 'Delete a post by ID',
        'GET /api/posts/search/:query': 'Search posts by title, content, or tags',
        'GET /api/posts/meta/categories': 'Get all unique categories',
        'GET /api/posts/meta/tags': 'Get all unique tags'
      }
    }
  });
});

routes.use('/api', images);
routes.use('/api', posts);

export default routes;
