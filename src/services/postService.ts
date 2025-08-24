import { Post, CreatePostDto, UpdatePostDto } from '../models/Post';

class PostService {
  private posts: Post[] = [];
  private nextId: number = 1;

  constructor() {
    // Initialize with some sample posts
    this.initializeSamplePosts();
  }

  private initializeSamplePosts(): void {
    const samplePosts: CreatePostDto[] = [
      {
        title: 'Getting Started with TypeScript',
        content: 'TypeScript is a powerful superset of JavaScript that adds static typing to the language. In this post, we\'ll explore the basics of TypeScript and how it can improve your development workflow.',
        author: 'John Doe',
        tags: ['typescript', 'javascript', 'programming'],
        published: true
      },
      {
        title: 'Building RESTful APIs with Express',
        content: 'Express.js is a minimal and flexible Node.js web application framework. Learn how to build robust RESTful APIs using Express, including routing, middleware, and error handling.',
        author: 'Jane Smith',
        tags: ['nodejs', 'express', 'api', 'backend'],
        published: true
      },
      {
        title: 'Understanding Async/Await in JavaScript',
        content: 'Async/await is a modern way to handle asynchronous operations in JavaScript. This post covers the fundamentals and best practices for using async/await in your applications.',
        author: 'Bob Johnson',
        tags: ['javascript', 'async', 'programming'],
        published: true
      },
      {
        title: 'Draft: Microservices Architecture',
        content: 'This is a draft post about microservices architecture patterns and best practices. Content is still being developed.',
        author: 'Alice Williams',
        tags: ['architecture', 'microservices', 'design-patterns'],
        published: false
      },
      {
        title: 'Testing Best Practices',
        content: 'Learn about unit testing, integration testing, and end-to-end testing strategies for modern web applications.',
        author: 'John Doe',
        tags: ['testing', 'quality', 'best-practices'],
        published: true
      }
    ];

    samplePosts.forEach(postDto => {
      this.createPost(postDto);
    });
  }

  private generateId(): string {
    return (this.nextId++).toString();
  }

  getAllPosts(filters?: { published?: boolean; author?: string; tag?: string }): Post[] {
    let filteredPosts = [...this.posts];

    if (filters) {
      if (filters.published !== undefined) {
        filteredPosts = filteredPosts.filter(
          post => post.published === filters.published
        );
      }

      if (filters.author) {
        filteredPosts = filteredPosts.filter(
          post => post.author.toLowerCase().includes(filters.author!.toLowerCase())
        );
      }

      if (filters.tag) {
        filteredPosts = filteredPosts.filter(
          post => post.tags?.includes(filters.tag!)
        );
      }
    }

    return filteredPosts;
  }

  getPostById(id: string): Post | undefined {
    return this.posts.find(p => p.id === id);
  }

  createPost(createPostDto: CreatePostDto): Post {
    const newPost: Post = {
      id: this.generateId(),
      title: createPostDto.title,
      content: createPostDto.content,
      author: createPostDto.author,
      tags: createPostDto.tags || [],
      published: createPostDto.published || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.posts.push(newPost);
    return newPost;
  }

  updatePost(id: string, updatePostDto: UpdatePostDto): Post | null {
    const postIndex = this.posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return null;
    }

    const updatedPost: Post = {
      ...this.posts[postIndex],
      ...updatePostDto,
      id: this.posts[postIndex].id,
      createdAt: this.posts[postIndex].createdAt,
      updatedAt: new Date()
    };

    this.posts[postIndex] = updatedPost;
    return updatedPost;
  }

  partialUpdatePost(id: string, updatePostDto: UpdatePostDto): Post | null {
    const postIndex = this.posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return null;
    }

    const currentPost = this.posts[postIndex];
    const updatedPost: Post = {
      ...currentPost,
      ...(updatePostDto.title && { title: updatePostDto.title }),
      ...(updatePostDto.content && { content: updatePostDto.content }),
      ...(updatePostDto.author && { author: updatePostDto.author }),
      ...(updatePostDto.tags && { tags: updatePostDto.tags }),
      ...(updatePostDto.published !== undefined && { published: updatePostDto.published }),
      updatedAt: new Date()
    };

    this.posts[postIndex] = updatedPost;
    return updatedPost;
  }

  deletePost(id: string): Post | null {
    const postIndex = this.posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return null;
    }

    const deletedPost = this.posts[postIndex];
    this.posts.splice(postIndex, 1);
    return deletedPost;
  }

  publishPost(id: string): Post | null {
    const post = this.getPostById(id);
    if (post) {
      post.published = true;
      post.updatedAt = new Date();
    }
    return post;
  }

  unpublishPost(id: string): Post | null {
    const post = this.getPostById(id);
    if (post) {
      post.published = false;
      post.updatedAt = new Date();
    }
    return post;
  }

  getStatistics() {
    const totalPosts = this.posts.length;
    const publishedPosts = this.posts.filter(p => p.published).length;
    const draftPosts = totalPosts - publishedPosts;
    
    const authorStats = this.posts.reduce((acc, post) => {
      acc[post.author] = (acc[post.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tagStats = this.posts.reduce((acc, post) => {
      post.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      authorStats,
      tagStats
    };
  }
}

// Export a singleton instance
export default new PostService();