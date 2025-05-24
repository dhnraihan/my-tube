// This file helps TypeScript understand module paths in your project

// Declare modules for pages
declare module 'pages/TrendingPage';
declare module 'pages/LibraryPage';

// Declare modules for components
declare module 'components/videos/VideoCard' {
  import { FC } from 'react';
  import { Video } from '../../types/video';

  interface VideoCardProps {
    video: Video;
  }

  const VideoCard: FC<VideoCardProps>;
  export default VideoCard;
}

declare module 'components/videos/VideoGrid' {
  import { FC } from 'react';
  import { Video } from '../../types/video';

  interface VideoGridProps {
    videos: Video[];
    isLoading?: boolean;
    emptyMessage?: string;
  }

  const VideoGrid: FC<VideoGridProps>;
  export default VideoGrid;
}
