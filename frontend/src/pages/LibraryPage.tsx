import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import VideoGrid from '../components/videos/VideoGrid';
import { fetchUserVideos } from '../app/features/videos/videoSlice';

const LibraryPage: React.FC = () => {
  const dispatch = useDispatch();
  const { userVideos, isLoading } = useSelector((state: RootState) => state.videos);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserVideos(Number(user.id)) as any);
    }
  }, [dispatch, user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Library</h1>
      <VideoGrid 
        videos={userVideos}
        isLoading={isLoading}
        emptyMessage="You haven't uploaded any videos yet."
      />
    </div>
  );
};

export default LibraryPage;
