import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import VideoGrid from '../components/videos/VideoGrid';
import { fetchLatestVideos } from '../app/features/videos/videoSlice';

const LatestPage: React.FC = () => {
  const dispatch = useDispatch();
  const { videos, isLoading } = useSelector((state: RootState) => state.videos);

  useEffect(() => {
    dispatch(fetchLatestVideos() as any);
  }, [dispatch]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Latest Videos</h1>
      <VideoGrid 
        videos={videos}
        isLoading={isLoading}
        emptyMessage="No videos found. Check back later for new uploads!"
      />
    </div>
  );
};

export default LatestPage;
