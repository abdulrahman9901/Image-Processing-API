export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  published: boolean;
}

export interface CreatePostDto {
  title: string;
  content: string;
  author: string;
  tags?: string[];
  published?: boolean;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  author?: string;
  tags?: string[];
  published?: boolean;
}