import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './app/store';
import { getUserProfile } from './app/features/auth/authSlice';
import { fetchCategories, fetchComments } from './app/features/videos/videoSlice';
import { fetchUserProfile } from './app/features/profile/profileSlice';
import { ThemeProvider } from './context/ThemeContext';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';

// Layout
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UploadPage from './pages/UploadPage';
import SearchPage from './pages/SearchPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryVideosPage from './pages/CategoryVideosPage';
import TrendingPage from 'pages/TrendingPage';
import LibraryPage from 'pages/LibraryPage';
import SubscriptionsPage from 'pages/SubscriptionsPage';
import LatestPage from 'pages/LatestPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth Guard for protected routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // If user is authenticated, fetch user profile data
    if (isAuthenticated) {
      dispatch(getUserProfile() as any);
      dispatch(fetchUserProfile() as any);
      // Fetch categories after authentication is confirmed
      dispatch(fetchCategories() as any);
    }
  }, [dispatch, isAuthenticated]);
  
  // Attempt to fetch categories even for non-authenticated users
  // This will either succeed if the endpoint is public or fail silently
  useEffect(() => {
    dispatch(fetchCategories() as any);
  }, [dispatch]);
  
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-200">
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />
            <Route path="video/:slug" element={<VideoPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="category/:slug" element={<CategoryVideosPage />} />
            <Route path="trending" element={<TrendingPage />} />
            <Route path="latest" element={<LatestPage />} />
            
            {/* Protected routes */}
            <Route path="subscriptions" element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            } />
            <Route path="library" element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />
            <Route path="profile/edit" element={
              <ProtectedRoute>
                <ProfilePage editMode={true} />
              </ProtectedRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <PWAUpdatePrompt />
      </div>
    </ThemeProvider>
  );
}

export default App;
