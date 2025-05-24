import { FC } from 'react';
import { Video } from '../../types/video';

export interface VideoGridProps {
  videos: Video[];
  isLoading: boolean;
  emptyMessage?: string;
}

export const VideoGrid: FC<VideoGridProps>;
