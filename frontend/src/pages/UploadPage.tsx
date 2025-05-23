import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { uploadVideo, fetchCategories } from '../app/features/videos/videoSlice';

const UploadPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [privacy, setPrivacy] = useState('public');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, isLoading, error } = useSelector((state: RootState) => state.videos);
  
  useEffect(() => {
    dispatch(fetchCategories() as any);
  }, [dispatch]);
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          videoFile: 'Please select a valid video file (MP4, WebM, or OGG)'
        });
        return;
      }
      
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        setErrors({
          ...errors,
          videoFile: 'Video file size must be less than 100MB'
        });
        return;
      }
      
      setVideoFile(file);
      setErrors({
        ...errors,
        videoFile: ''
      });
    }
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          thumbnailFile: 'Please select a valid image file (JPEG, PNG, or WebP)'
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          thumbnailFile: 'Thumbnail file size must be less than 5MB'
        });
        return;
      }
      
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setErrors({
        ...errors,
        thumbnailFile: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!videoFile) {
      newErrors.videoFile = 'Please select a video file to upload';
    }
    
    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsUploading(true);
    
    // Create FormData for the video upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('privacy', privacy);
    if (categoryId) {
      formData.append('category_id', categoryId.toString());
    }
    if (videoFile) {
      formData.append('file', videoFile);
    }
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    
    try {
      // Simulate upload progress (for demo purposes)
      const uploadSimulation = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(uploadSimulation);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
      
      // Dispatch the upload action
      const resultAction = await dispatch(uploadVideo(formData) as any);
      
      clearInterval(uploadSimulation);
      
      if (uploadVideo.fulfilled.match(resultAction)) {
        setUploadProgress(100);
        
        // Navigate to the video page after successful upload
        setTimeout(() => {
          navigate(`/video/${resultAction.payload.slug}`);
        }, 1000);
      } else {
        setIsUploading(false);
        setUploadProgress(0);
        
        if (resultAction.payload) {
          // Set form errors from API response
          setErrors(resultAction.payload);
        } else {
          // Set generic error
          setErrors({
            form: 'Failed to upload video. Please try again.'
          });
        }
      }
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      setErrors({
        form: 'An unexpected error occurred. Please try again.'
      });
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload Video</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {errors.form && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errors.form}</span>
          </div>
        )}
        
        {isUploading ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Uploading your video...</h2>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 mb-6">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {uploadProgress < 100 
                ? 'Please don\'t close this page while your video is uploading.' 
                : 'Upload complete! Redirecting to your video...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Video File Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Video File</label>
              <div 
                onClick={() => videoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  videoFile 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
                
                {videoFile ? (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-gray-900 dark:text-white font-medium">{videoFile.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Drag and drop your video or click to browse</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      MP4, WebM, or OGG (Max 100MB)
                    </p>
                  </div>
                )}
              </div>
              {errors.videoFile && <p className="text-red-500 text-sm mt-1">{errors.videoFile}</p>}
            </div>
            
            {/* Thumbnail Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Thumbnail Image</label>
              <div 
                onClick={() => thumbnailInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  thumbnailFile 
                    ? 'border-green-500' 
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                
                {thumbnailPreview ? (
                  <div>
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-48 h-auto mx-auto mb-2 rounded-md"
                    />
                    <p className="text-gray-900 dark:text-white font-medium">Thumbnail Preview</p>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm mt-2"
                    >
                      Remove Thumbnail
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Click to upload a thumbnail image</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      JPEG, PNG, or WebP (Max 5MB)
                    </p>
                  </div>
                )}
              </div>
              {errors.thumbnailFile && <p className="text-red-500 text-sm mt-1">{errors.thumbnailFile}</p>}
            </div>
            
            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <input
                type="text"
                id="title"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-500'
                }`}
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-500"
                placeholder="Enter video description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            
            {/* Category */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                id="category"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.categoryId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-500'
                }`}
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
            </div>
            
            {/* Tags */}
            <div className="mb-6">
              <label htmlFor="tags" className="block text-gray-700 dark:text-gray-300 mb-2">Tags</label>
              <input
                type="text"
                id="tags"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-500"
                placeholder="Enter tags separated by commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Separate tags with commas (e.g., music, tutorial, vlog)
              </p>
            </div>
            
            {/* Privacy */}
            <div className="mb-8">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Privacy</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="privacy"
                    value="public"
                    checked={privacy === 'public'}
                    onChange={() => setPrivacy('public')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Public</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="privacy"
                    value="unlisted"
                    checked={privacy === 'unlisted'}
                    onChange={() => setPrivacy('unlisted')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Unlisted</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="privacy"
                    value="private"
                    checked={privacy === 'private'}
                    onChange={() => setPrivacy('private')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Private</span>
                </label>
              </div>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upload Video'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
