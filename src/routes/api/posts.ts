import express from 'express';
import { Request, Response } from 'express';

// Extend Request interface to include body property
interface PostRequest extends Request {
  body?: any;
}
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsWithFilters,
  validatePostData,
  searchPosts,
  Post
} from '../../postUtilities';

const posts = express.Router();

// POST - Create a new post
posts.post('/posts', async (req: PostRequest, res: Response): Promise<void> => {
  try {
    // Validate request data
    const validationError = validatePostData(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        error: validationError
      });
      return;
    }

    // Set defaults
    const postData = {
      title: req.body.title.trim(),
      content: req.body.content.trim(),
      author: req.body.author.trim(),
      category: req.body.category.trim(),
      tags: req.body.tags || [],
      status: req.body.status || 'draft' as 'draft' | 'published',
      imageUrl: req.body.imageUrl || undefined
    };

    // Create the post
    const newPost = await createPost(postData);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating post'
    });
  }
});

// GET - Retrieve all posts with optional filters
posts.get('/posts', async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      category: req.query.category as string,
      status: req.query.status as 'draft' | 'published',
      author: req.query.author as string,
      tag: req.query.tag as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const { posts: filteredPosts, total } = await getPostsWithFilters(filters);

    res.json({
      success: true,
      data: filteredPosts,
      pagination: {
        total,
        limit: filters.limit || 10,
        offset: filters.offset || 0,
        hasMore: total > (filters.offset || 0) + filteredPosts.length
      }
    });

  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving posts'
    });
  }
});

// GET - Retrieve a specific post by ID
posts.get('/posts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await getPostById(id);

    if (!post) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      });
      return;
    }

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Error retrieving post:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving post'
    });
  }
});

// PUT - Update a post by ID
posts.put('/posts/:id', async (req: PostRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate request data (excluding ID and timestamps)
    const validationError = validatePostData(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        error: validationError
      });
      return;
    }

    const updates = {
      title: req.body.title?.trim(),
      content: req.body.content?.trim(),
      author: req.body.author?.trim(),
      category: req.body.category?.trim(),
      tags: req.body.tags,
      status: req.body.status,
      imageUrl: req.body.imageUrl
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates];
      }
    });

    const updatedPost = await updatePost(id, updates);

    if (!updatedPost) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating post'
    });
  }
});

// DELETE - Delete a post by ID
posts.delete('/posts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deletePost(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting post'
    });
  }
});

// GET - Search posts
posts.get('/posts/search/:query', async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.params;

    if (!query || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
      return;
    }

    const searchResults = await searchPosts(query.trim());

    res.json({
      success: true,
      data: searchResults,
      count: searchResults.length
    });

  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while searching posts'
    });
  }
});

// GET - Get categories (unique categories from all posts)
posts.get('/posts/meta/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const allPosts = await getAllPosts();
    const categories = [...new Set(allPosts.map(post => post.category))].sort();

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });

  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving categories'
    });
  }
});

// GET - Get tags (unique tags from all posts)
posts.get('/posts/meta/tags', async (req: Request, res: Response): Promise<void> => {
  try {
    const allPosts = await getAllPosts();
    const tags = [...new Set(allPosts.flatMap(post => post.tags))].sort();

    res.json({
      success: true,
      data: tags,
      count: tags.length
    });

  } catch (error) {
    console.error('Error retrieving tags:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving tags'
    });
  }
});

export default posts;