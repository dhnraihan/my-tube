import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReactPlayer from 'react-player';
import { RootState } from '../app/store';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  fetchVideoById, 
  likeVideo, 
  addComment,
  Video,
  Comment 
} from '../app/features/videos/videoSlice';

const VideoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const playerRef = useRef<ReactPlayer>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  
  const { 
    currentVideo, 
    relatedVideos = [], 
    comments = [], 
    isLoading, 
    error: videoError 
  } = useSelector((state: RootState) => state.videos);
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Handle video errors
  useEffect(() => {
    if (videoError) {
      toast.error(videoError);
      // Redirect to home page if video not found
      if (videoError.includes('not found')) {
        setTimeout(() => navigate('/'), 3000);
      }
    }
  }, [videoError, navigate]);
  
  const [comment, setComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  
  useEffect(() => {
    if (slug) {
      dispatch(fetchVideoById(slug) as any);
    }
    
    // Cleanup function to reset video state when component unmounts
    return () => {
      // We would use a clearCurrentVideo action here if needed
    };
  }, [dispatch, slug]);
  
  // Format view count
  const formatViews = (views: number) => {
    if (!views && views !== 0) return '0';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };
  
  // Handle player events
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleProgress = (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };
  
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };
  
  const handleSeekMouseDown = () => {
    setSeeking(true);
  };
  
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.currentTarget.value));
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setMuted(false);
    }
  };
  
  const toggleMute = () => {
    setMuted(!muted);
  };
  
  // Format time in seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    if (!seconds && seconds !== 0) return '0:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  const handleLike = (likeType: 'like' | 'dislike') => {
    if (isAuthenticated && currentVideo && slug) {
      // likeVideo expects a slug string parameter
      dispatch(likeVideo(slug) as any);
    }
  };
  
  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated && currentVideo && comment.trim() && slug) {
      dispatch(addComment({ slug, content: comment }) as any);
      setComment('');
    }
  };
  
  const handleReply = (commentId: number) => {
    if (isAuthenticated && currentVideo && replyText.trim() && slug) {
      dispatch(addComment({ 
        slug, 
        content: replyText,
        parent_id: commentId 
      }) as any);
      setReplyText('');
      setReplyingTo(null);
    }
  };
  
  const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
    return (
      <div className="mb-4">
        <div className="flex">
          <div className="flex-shrink-0 mr-3">
            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300">
              {comment.user.username[0].toUpperCase()}
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex items-center mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white mr-2">{comment.user.username}</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
            
            {isAuthenticated && (
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reply
              </button>
            )}
            
            {replyingTo === comment.id && (
              <div className="mt-3">
                <textarea
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  rows={2}
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReply(comment.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
            
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 ml-8">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="mb-3">
                    <div className="flex">
                      <div className="flex-shrink-0 mr-3">
                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300">
                          {reply.user.username[0].toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <h5 className="font-medium text-gray-900 dark:text-white mr-2">{reply.user.username}</h5>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(reply.created_at)}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="w-full h-96 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
        <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
        <div className="flex space-x-4 mb-6">
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentVideo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Video not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">The video you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">Back to Home</Link>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="lg:col-span-3">
        {/* Video Player */}
        <div className="video-container mb-4 rounded-lg overflow-hidden bg-black">
          {currentVideo?.file ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <ReactPlayer
                ref={playerRef}
                url={currentVideo.file}
                width="100%"
                height="100%"
                playing={isPlaying}
                volume={muted ? 0 : volume}
                onProgress={handleProgress}
                onDuration={setDuration}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={(e) => {
                  console.error('Video playback error:', e);
                  toast.error('Error playing video. Please try again later.');
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                controls={false}
              />
              
              {/* Custom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress Bar */}
                <div className="flex items-center mb-2">
                  <input
                    type="range"
                    min={0}
                    max={0.999999}
                    step="any"
                    value={played}
                    onChange={handleSeekChange}
                    onMouseDown={handleSeekMouseDown}
                    onMouseUp={handleSeekMouseUp}
                    className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${played * 100}%, #4b5563 ${played * 100}%, #4b5563 100%)`
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handlePlayPause}
                      className="text-white hover:text-blue-400 transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="flex items-center">
                      <button 
                        onClick={toggleMute}
                        className="text-white hover:text-blue-400 transition-colors mr-2"
                        aria-label={muted ? 'Unmute' : 'Mute'}
                      >
                        {muted || volume === 0 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(muted ? 0 : volume) * 100}%, #4b5563 ${(muted ? 0 : volume) * 100}%, #4b5563 100%)`
                        }}
                      />
                    </div>
                    
                    <span className="text-sm text-white">
                      {formatTime(played * duration)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <button 
                    className="text-white hover:text-blue-400 transition-colors"
                    onClick={() => {
                      // Toggle fullscreen
                      const element = document.fullscreenElement;
                      if (!element) {
                        document.documentElement.requestFullscreen().catch(console.error);
                      } else {
                        document.exitFullscreen().catch(console.error);
                      }
                    }}
                    aria-label="Fullscreen"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <p className="text-white">Video not available</p>
            </div>
          )}
        </div>
        
        {/* Video Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{currentVideo.title}</h1>
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center">
              <span>{formatViews(currentVideo.views)} views</span>
              <span className="mx-2">•</span>
              <span>{formatDate(currentVideo.created_at)}</span>
            </div>
            
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <button 
                onClick={() => handleLike('like')}
                className={`flex items-center space-x-1 ${isAuthenticated ? 'hover:text-blue-600 dark:hover:text-blue-400' : 'opacity-70'}`}
                disabled={!isAuthenticated}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>{currentVideo.likes}</span>
              </button>
              
              <button 
                onClick={() => handleLike('dislike')}
                className={`flex items-center space-x-1 ${isAuthenticated ? 'hover:text-blue-600 dark:hover:text-blue-400' : 'opacity-70'}`}
                disabled={!isAuthenticated}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
                <span>{0}</span>
              </button>
              
              <button className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
          
          {/* Uploader Info */}
          <div className="flex items-center border-t border-b border-gray-200 dark:border-gray-700 py-4">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white mr-4">
              {currentVideo.uploader.username[0].toUpperCase()}
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-gray-900 dark:text-white">{currentVideo.uploader.username}</h3>
              {currentVideo.category && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Category: {currentVideo.category.name}
                </p>
              )}
            </div>
            {isAuthenticated && currentVideo.uploader.id.toString() !== user?.id && (
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">
                Subscribe
              </button>
            )}
          </div>
          
          {/* Description */}
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {currentVideo.description || 'No description provided.'}
            </p>
            
            {/* Tags */}
            {currentVideo.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {currentVideo.tags.split(',').map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Comments */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {comments.length} Comments
          </h2>
          
          {/* Add comment */}
          {isAuthenticated ? (
            <form onSubmit={handleComment} className="mb-6">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300">
                    {user?.username[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex-grow">
                  <textarea
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      disabled={!comment.trim()}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</Link> to add a comment.
              </p>
            </div>
          )}
          
          {/* Comment list */}
          <div>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Related Videos */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Videos</h2>
        <div className="space-y-4">
          {relatedVideos.length > 0 ? (
            relatedVideos.map((video: Video) => (
              <Link 
                key={video.id} 
                to={`/video/${video.slug}`}
                className="flex space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg"
              >
                <div className="flex-shrink-0 relative w-40 h-24">
                  <img 
                    src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} 
                    alt={video.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">{video.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{video.uploader.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatViews(video.views)} views • {formatDate(video.created_at)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">No related videos found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
