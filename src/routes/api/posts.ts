import express, { Request, Response } from 'express';
import { Post, CreatePostDto, UpdatePostDto } from '../../models/Post';

const router = express.Router();

// In-memory storage for posts (in production, use a database)
let posts: Post[] = [];
let nextId = 1;

// Helper function to generate unique ID
const generateId = (): string => {
  return (nextId++).toString();
};

// GET all posts
router.get('/', (req: Request, res: Response) => {
  try {
    // Filter by published status if query param provided
    const { published, author, tag } = req.query;
    let filteredPosts = [...posts];

    if (published !== undefined) {
      filteredPosts = filteredPosts.filter(
        post => post.published === (published === 'true')
      );
    }

    if (author) {
      filteredPosts = filteredPosts.filter(
        post => post.author.toLowerCase().includes(author.toString().toLowerCase())
      );
    }

    if (tag) {
      filteredPosts = filteredPosts.filter(
        post => post.tags?.includes(tag.toString())
      );
    }

    res.json({
      success: true,
      count: filteredPosts.length,
      data: filteredPosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
});

// GET single post by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = posts.find(p => p.id === id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post'
    });
  }
});

// POST create new post
router.post('/', (req: Request, res: Response) => {
  try {
    const createPostDto: CreatePostDto = req.body;

    // Validate required fields
    if (!createPostDto.title || !createPostDto.content || !createPostDto.author) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and author are required'
      });
    }

    // Create new post
    const newPost: Post = {
      id: generateId(),
      title: createPostDto.title,
      content: createPostDto.content,
      author: createPostDto.author,
      tags: createPostDto.tags || [],
      published: createPostDto.published || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    posts.push(newPost);

    res.status(201).json({
      success: true,
      data: newPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
});

// PUT update post by ID
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatePostDto: UpdatePostDto = req.body;

    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Update post fields
    const updatedPost: Post = {
      ...posts[postIndex],
      ...updatePostDto,
      id: posts[postIndex].id, // Ensure ID doesn't change
      createdAt: posts[postIndex].createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    posts[postIndex] = updatedPost;

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update post'
    });
  }
});

// PATCH partial update post by ID
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatePostDto: UpdatePostDto = req.body;

    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Partial update - only update provided fields
    const currentPost = posts[postIndex];
    const updatedPost: Post = {
      ...currentPost,
      ...(updatePostDto.title && { title: updatePostDto.title }),
      ...(updatePostDto.content && { content: updatePostDto.content }),
      ...(updatePostDto.author && { author: updatePostDto.author }),
      ...(updatePostDto.tags && { tags: updatePostDto.tags }),
      ...(updatePostDto.published !== undefined && { published: updatePostDto.published }),
      updatedAt: new Date()
    };

    posts[postIndex] = updatedPost;

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update post'
    });
  }
});

// DELETE post by ID
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const deletedPost = posts[postIndex];
    posts.splice(postIndex, 1);

    res.json({
      success: true,
      message: 'Post deleted successfully',
      data: deletedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
});

// POST publish a post
router.post('/:id/publish', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    posts[postIndex].published = true;
    posts[postIndex].updatedAt = new Date();

    res.json({
      success: true,
      message: 'Post published successfully',
      data: posts[postIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to publish post'
    });
  }
});

// POST unpublish a post
router.post('/:id/unpublish', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    posts[postIndex].published = false;
    posts[postIndex].updatedAt = new Date();

    res.json({
      success: true,
      message: 'Post unpublished successfully',
      data: posts[postIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to unpublish post'
    });
  }
});

// GET posts statistics
router.get('/stats/overview', (req: Request, res: Response) => {
  try {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.published).length;
    const draftPosts = totalPosts - publishedPosts;
    
    const authorStats = posts.reduce((acc, post) => {
      acc[post.author] = (acc[post.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tagStats = posts.reduce((acc, post) => {
      post.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalPosts,
        publishedPosts,
        draftPosts,
        authorStats,
        tagStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

export default router;