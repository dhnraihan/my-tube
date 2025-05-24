import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import VideoGrid from '../components/videos/VideoGrid';
import { fetchTrendingVideos } from '../app/features/videos/videoSlice';

const TrendingPage: React.FC = () => {
  const dispatch = useDispatch();
  const { videos, isLoading } = useSelector((state: RootState) => state.videos);

  useEffect(() => {
    // Fetch trending videos
    dispatch(fetchTrendingVideos() as any);
  }, [dispatch]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trending Videos</h1>
      <VideoGrid 
        videos={videos}
        isLoading={isLoading}
        emptyMessage="No trending videos found."
      />
    </div>
  );
};

export default TrendingPage;
