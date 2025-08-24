import express from 'express';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { Request, Response } from 'express';

const posts = express.Router();

const POSTS_DIR = path.resolve(process.cwd(), 'assets', 'posts');

async function ensurePostsDirExists(): Promise<void> {
  await fsPromises.mkdir(POSTS_DIR, { recursive: true });
}

posts.post('/posts', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensurePostsDirExists();
    const { title, body } = req.body as { title?: string; body?: string };

    if (!title || !body) {
      res.status(400).json({ error: 'title and body are required' });
      return;
    }

    const safeSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${safeSlug || 'post'}-${timestamp}.json`;
    const filePath = path.join(POSTS_DIR, filename);

    const postContent = {
      title,
      body,
      createdAt: new Date().toISOString()
    };

    await fsPromises.writeFile(filePath, JSON.stringify(postContent, null, 2), 'utf-8');

    res.status(201).json({ message: 'Post created', id: filename, path: filePath });
  } catch (error) {
    console.error('Failed to create post', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default posts;