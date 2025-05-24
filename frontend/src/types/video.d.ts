export interface Video {
  id: number;
  title: string;
  description: string;
  file: string;
  thumbnail: string;
  views: number;
  likes: number;
  slug: string;
  duration: number;
  created_at: string;
  uploader: {
    id: number;
    username: string;
    profile_picture: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: string;
  is_liked?: boolean;
}
