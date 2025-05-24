import React from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../../types/video';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  // Format video duration (assuming duration is in seconds)
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/video/${video.slug}`}>
        <div className="relative">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-40 object-cover"
          />
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
            {video.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {video.uploader.username}
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{video.views} views</span>
            <span className="mx-1">•</span>
            <span>
              {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;
