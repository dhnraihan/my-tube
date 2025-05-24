import { FC } from 'react';
import { Video } from '../../app/features/videos/videoSlice';

interface VideoCardProps {
  video: Video;
}

declare const VideoCard: FC<VideoCardProps>;

export default VideoCard;
