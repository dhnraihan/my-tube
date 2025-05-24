import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import VideoGrid from '../components/videos/VideoGrid';
import { fetchSubscribedVideos } from '../app/features/videos/videoSlice';

const SubscriptionsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { subscribedVideos, isLoading } = useSelector((state: RootState) => state.videos);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSubscribedVideos(Number(user.id)) as any);
    }
  }, [dispatch, user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Subscriptions</h1>
      <VideoGrid 
        videos={subscribedVideos}
        isLoading={isLoading}
        emptyMessage="You haven't subscribed to any channels yet."
      />
    </div>
  );
};

export default SubscriptionsPage;
