import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../app/store';
import { getUserProfile } from '../app/features/auth/authSlice';
import { fetchVideos, Video } from '../app/features/videos/videoSlice';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('videos');
  const dispatch = useDispatch();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { videos, isLoading } = useSelector((state: RootState) => state.videos);
  
  // Filter user's videos
  const userVideos = videos.filter(video => video.uploader.id === user?.id);
  
  useEffect(() => {
    dispatch(getUserProfile() as any);
    dispatch(fetchVideos() as any);
  }, [dispatch]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <Link to={`/video/${video.slug}`}>
          <div className="relative">
            <img 
              src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} 
              alt={video.title}
              className="w-full h-40 object-cover"
            />
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </Link>
        
        <div className="p-4">
          <Link to={`/video/${video.slug}`}>
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">{video.title}</h3>
          </Link>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{video.views} views</span>
            <span>{formatDate(video.created_at)}</span>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Link 
              to={`/edit-video/${video.slug}`}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Edit
            </Link>
            <button className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Loading profile...</h2>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold">
            {user.username[0].toUpperCase()}
          </div>
          
          {/* Profile Info */}
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.username}</h1>
            <div className="text-gray-600 dark:text-gray-400 mb-4">
              <p className="mb-1">{user.first_name} {user.last_name}</p>
              <p className="mb-1">{user.email}</p>
              {false && (
                <p className="mt-3">No bio available</p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{userVideos.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Subscriptions</div>
              </div>
            </div>
          </div>
          
          {/* Edit Profile Button */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Edit Profile
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-4 text-center font-medium text-sm ${
              activeTab === 'videos'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium text-sm ${
              activeTab === 'playlists'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('playlists')}
          >
            Playlists
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium text-sm ${
              activeTab === 'about'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>
      </div>
      
      {/* Content based on active tab */}
      <div>
        {activeTab === 'videos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Your Videos
              </h2>
              <Link
                to="/upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Upload New Video
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden animate-pulse">
                    <div className="w-full h-40 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                      <div className="flex justify-end">
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {userVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">You haven't uploaded any videos yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Share your content with the world!</p>
                <Link
                  to="/upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Upload Your First Video
                </Link>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'playlists' && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No playlists yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create playlists to organize your favorite videos
            </p>
          </div>
        )}
        
        {activeTab === 'about' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Bio</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {'No bio provided.'}
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Location</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {'Not specified'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Joined</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {'Unknown'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
