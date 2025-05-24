import React from 'react';
import { Video } from '../../types/video';
import VideoCard from './VideoCard';

export interface VideoGridProps {
  videos: Video[];
  isLoading: boolean;
  emptyMessage?: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, isLoading, emptyMessage }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden animate-pulse">
            <div className="w-full h-40 bg-gray-300 dark:bg-gray-600"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
