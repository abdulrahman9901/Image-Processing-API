import { promises as fsPromises, constants } from 'fs';
import path from 'path';

// Post interface definition
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  category: string;
  status: 'draft' | 'published';
  imageUrl?: string;
}

// Posts storage file path
const POSTS_FILE = './data/posts.json';
const DATA_DIR = './data';

// Ensure data directory exists
export const ensureDataDirectory = async (): Promise<void> => {
  try {
    await fsPromises.access(DATA_DIR, constants.F_OK);
  } catch {
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
  }
};

// Check if posts file exists
const checkPostsFileExists = async (): Promise<boolean> => {
  try {
    await fsPromises.access(POSTS_FILE, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

// Initialize posts file if it doesn't exist
const initializePostsFile = async (): Promise<void> => {
  if (!(await checkPostsFileExists())) {
    await fsPromises.writeFile(POSTS_FILE, JSON.stringify([], null, 2));
  }
};

// Read all posts from storage
export const getAllPosts = async (): Promise<Post[]> => {
  await ensureDataDirectory();
  await initializePostsFile();
  
  try {
    const data = await fsPromises.readFile(POSTS_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
};

// Save all posts to storage
export const saveAllPosts = async (posts: Post[]): Promise<void> => {
  await ensureDataDirectory();
  
  try {
    await fsPromises.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error saving posts:', error);
    throw new Error('Failed to save posts');
  }
};

// Generate unique ID for posts
export const generatePostId = (): string => {
  return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create a new post
export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> => {
  const posts = await getAllPosts();
  
  const newPost: Post = {
    id: generatePostId(),
    ...postData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  posts.push(newPost);
  await saveAllPosts(posts);
  
  return newPost;
};

// Get post by ID
export const getPostById = async (id: string): Promise<Post | null> => {
  const posts = await getAllPosts();
  return posts.find(post => post.id === id) || null;
};

// Update post by ID
export const updatePost = async (id: string, updates: Partial<Omit<Post, 'id' | 'createdAt'>>): Promise<Post | null> => {
  const posts = await getAllPosts();
  const postIndex = posts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    return null;
  }
  
  posts[postIndex] = {
    ...posts[postIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await saveAllPosts(posts);
  return posts[postIndex];
};

// Delete post by ID
export const deletePost = async (id: string): Promise<boolean> => {
  const posts = await getAllPosts();
  const filteredPosts = posts.filter(post => post.id !== id);
  
  if (filteredPosts.length === posts.length) {
    return false; // Post not found
  }
  
  await saveAllPosts(filteredPosts);
  return true;
};

// Get posts with filters
export const getPostsWithFilters = async (filters: {
  category?: string;
  status?: 'draft' | 'published';
  author?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}): Promise<{ posts: Post[], total: number }> => {
  let posts = await getAllPosts();
  
  // Apply filters
  if (filters.category) {
    posts = posts.filter(post => post.category.toLowerCase() === filters.category?.toLowerCase());
  }
  
  if (filters.status) {
    posts = posts.filter(post => post.status === filters.status);
  }
  
  if (filters.author) {
    posts = posts.filter(post => post.author.toLowerCase().includes(filters.author!.toLowerCase()));
  }
  
  if (filters.tag) {
    posts = posts.filter(post => 
      post.tags.some(tag => tag.toLowerCase().includes(filters.tag!.toLowerCase()))
    );
  }
  
  // Sort by creation date (newest first)
  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const total = posts.length;
  
  // Apply pagination
  const offset = filters.offset || 0;
  const limit = filters.limit || 10;
  
  posts = posts.slice(offset, offset + limit);
  
  return { posts, total };
};

// Validate post data
export const validatePostData = (data: any): string | null => {
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    return 'Title is required and must be a non-empty string';
  }
  
  if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
    return 'Content is required and must be a non-empty string';
  }
  
  if (!data.author || typeof data.author !== 'string' || data.author.trim().length === 0) {
    return 'Author is required and must be a non-empty string';
  }
  
  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    return 'Category is required and must be a non-empty string';
  }
  
  if (data.status && !['draft', 'published'].includes(data.status)) {
    return 'Status must be either "draft" or "published"';
  }
  
  if (data.tags && !Array.isArray(data.tags)) {
    return 'Tags must be an array';
  }
  
  if (data.tags && data.tags.some((tag: any) => typeof tag !== 'string')) {
    return 'All tags must be strings';
  }
  
  return null;
};

// Search posts by title or content
export const searchPosts = async (query: string): Promise<Post[]> => {
  const posts = await getAllPosts();
  const lowercaseQuery = query.toLowerCase();
  
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.content.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};