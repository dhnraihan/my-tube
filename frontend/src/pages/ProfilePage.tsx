import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { RootState, AppDispatch } from '../app/store';
import { getUserProfile } from '../app/features/auth/authSlice';
import { fetchVideos, Video } from '../app/features/videos/videoSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define User interface since it's not exported from authSlice
interface User {
  id: string | number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
  is_staff?: boolean;
  is_active?: boolean;
  profile_picture?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
}

interface Profile extends User {
  bio?: string;
  location?: string;
  website?: string;
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
  followers_count?: number;
  following_count?: number;
}

interface ProfileEditProps {
  user: Profile;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
}

interface ProfileFormData {
  username: string;
  email: string;
  bio: string;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onCancel, onSave }) => {
  const { register, handleSubmit } = useForm<ProfileFormData>({
    defaultValues: {
      username: user.username,
      email: user.email,
      bio: user.bio || ''
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log('Form data:', data);
    onSave();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Profile</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your username"
            {...register('username')}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your email"
            {...register('email')}
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <input
            id="bio"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Tell us about yourself"
            {...register('bio')}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

interface ProfilePageProps {
  editMode?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ editMode = false }) => {
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState('videos');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(editMode);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { user: currentUser, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isLoading: isVideosLoading } = useSelector((state: RootState) => state.videos);
  
  // Check if current user is viewing their own profile
  const isOwnProfile = currentUser?.username === username || (!username && isAuthenticated);
  
  // Load profile data
  const loadProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch user profile
      // Note: Currently, the backend only supports fetching the current user's profile
      // If we need to fetch other users' profiles, we'll need to update the backend API
      const result = await dispatch(getUserProfile());
      const profileData = result.payload as Profile;
      
      // If a specific username was provided but doesn't match the current user,
      // we should show an error since we can't fetch other users' profiles yet
      if (username && profileData.username !== username) {
        throw new Error('Cannot fetch profile for other users yet');
      }
      
      if (!profileData) {
        throw new Error('Profile not found');
      }
      
      setProfile(profileData);
      
      // Fetch all videos and filter by user
      const videosResult = await dispatch(fetchVideos());
      const allVideos = Array.isArray(videosResult.payload) ? videosResult.payload as Video[] : [];
      const userVideos = allVideos.filter(v => v.uploader?.id?.toString() === profileData.id.toString());
      setVideos(userVideos);
      
    } catch (err) {
      console.error('Failed to load profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, username]);
  
  // Initial load
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);
  
  // Handle edit mode toggle
  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      // If saving changes, reload the profile
      loadProfileData().catch(console.error);
    }
    setIsEditing(prev => !prev);
  }, [isEditing, loadProfileData]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          {/* Profile header skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="pt-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
          
          {/* Tabs skeleton */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-t"></div>
              ))}
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
          <div className="flex items-center justify-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={loadProfileData}
                className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If no profile data
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No profile found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The user you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <button
              onClick={handleEditToggle}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If in edit mode, render the ProfileEdit component
  if (editMode || isEditing) {
    if (!profile) return null; // Guard clause if profile is not loaded
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileEdit 
          user={profile} 
          onCancel={handleEditToggle} 
          onSave={() => {
            setIsEditing(false);
            loadProfileData();
          }} 
        />
      </div>
    );
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
  
  // Format view count
  const formatViews = (views?: number): string => {
    if (!views && views !== 0) return '0';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };
  
  // Format date helper
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
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
            <span>{formatViews(video.views)} views</span>
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
  
  if (!profile) {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Loading profile...</h2>
        </div>
      );
    }
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Profile not found</h2>
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
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-4xl font-bold">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile?.username}
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
                
                {(profile?.bio || profile?.location || profile?.website) && (
                  <div className="mt-4 space-y-2">
                    {profile?.bio && (
                      <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {profile?.location && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {profile.location}
                        </div>
                      )}
                      {profile?.website && (
                        <a
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          {profile.website.replace(/^https?:\/\//, '').split('/')[0]}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{profile?.followers_count || 0}</div>
                    <div className="text-gray-600 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{profile?.following_count || 0}</div>
                    <div className="text-gray-600 dark:text-gray-400">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{videos.length}</div>
                    <div className="text-gray-600 dark:text-gray-400">Videos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Edit Profile Button
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Edit Profile
          </button> */}
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
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {videos.map((video: Video) => (
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
