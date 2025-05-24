from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from . import views

router = DefaultRouter()
router.register(r'videos', views.VideoViewSet, basename='video')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    # Authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    
    # Video interactions
    path('like/', views.LikeView.as_view(), name='like'),
    path('search/', views.SearchView.as_view(), name='search'),
    
    # Include all router-generated URLs
    path('', include(router.urls)),
]
