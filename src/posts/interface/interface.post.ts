export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PostInterface = Omit<Post, 'id' | 'createdAt' | 'updatedAt'>;
