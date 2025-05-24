import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../app/store';
import { getUserProfile } from '../app/features/auth/authSlice';
import { fetchVideos, Video } from '../app/features/videos/videoSlice';
import ProfileEdit from '../components/profile/ProfileEdit';

interface ProfilePageProps {
  editMode?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ editMode = false }) => {
  const [activeTab, setActiveTab] = useState('videos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { videos: allVideos, isLoading: isVideosLoading } = useSelector((state: RootState) => state.videos);
  
  // Filter user's videos
  const userVideos = allVideos.filter(video => video.uploader.id.toString() === user?.id);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await Promise.all([
          dispatch(getUserProfile() as any).unwrap(),
          dispatch(fetchVideos() as any).unwrap()
        ]);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [dispatch]);
  
  // If in edit mode, render the ProfileEdit component
  if (editMode) {
    return <ProfileEdit />;
  }
  
  // Show loading state
  if (isLoading || isVideosLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {user?.profile?.profile_picture ? (
                  <img 
                    src={user.profile.profile_picture} 
                    alt={user.username} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-400">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.username}
                  </h1>
                  <Link
                    to="/profile/edit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </Link>
                </div>
                
                {user?.profile?.bio && (
                  <p className="text-gray-700 dark:text-gray-300">
                    {user.profile.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {user?.profile?.location && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {user.profile.location}
                    </div>
                  )}
                  
                  {user?.profile?.website && (
                    <a 
                      href={user.profile.website.startsWith('http') ? user.profile.website : `https://${user.profile.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {user.profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  
                  {user?.profile?.date_of_birth && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(user.profile.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              </div>
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
