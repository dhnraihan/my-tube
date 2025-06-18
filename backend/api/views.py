from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from accounts.models import User, Profile
from videos.models import Video, Category, Comment, Like, VideoView
from notifications.models import Notification
from .serializers import (
    UserSerializer, ProfileSerializer, UserRegisterSerializer,
    VideoSerializer, CategorySerializer, CommentSerializer,
    LikeSerializer, NotificationSerializer
)
from .permissions import IsOwnerOrReadOnly, IsVideoOwner, IsCommentOwner, IsProfileOwner

# Authentication Views
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsProfileOwner]
    
    def get_object(self):
        return self.request.user.profile

# Video Views
class VideoViewSet(viewsets.ModelViewSet):
    serializer_class = VideoSerializer
    permission_classes = [IsOwnerOrReadOnly]  # Remove IsAuthenticated to allow public access
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'privacy', 'uploader']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'views', 'title']
    lookup_field = 'slug'

    # def get_queryset(self):
    #     """
    #     Return a queryset of videos based on user authentication.
    #     - Authenticated users: See all public videos + their own private videos
    #     - Unauthenticated users: See only public videos
    #     """
    #     queryset = Video.objects.all()
    #     user = self.request.user
        
    #     if user.is_authenticated:
    #         # Show public videos + user's own private videos
    #         return queryset.filter(Q(privacy='public') | Q(uploader=user))
    #     else:
    #         # Show only public videos for unauthenticated users
    #         return queryset.filter(privacy='public')
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        """
        Returns a list of featured videos.
        Featured videos are determined by view count and like count.
        """
        featured_videos = Video.objects.filter(
            privacy='public'
        ).annotate(
            num_likes=Count('likes', filter=Q(likes__like_type='like'))
        ).order_by('-views', '-num_likes')[:10]

        page = self.paginate_queryset(featured_videos)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(featured_videos, many=True)
        return Response(serializer.data)
    
    def get_queryset(self):
        # Return only public videos or user's own videos
        if self.request.user.is_authenticated:
            return Video.objects.filter(
                Q(privacy='public') | 
                Q(privacy='unlisted') | 
                Q(uploader=self.request.user)
            )
        return Video.objects.filter(privacy='public')
    
    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def view(self, request, slug=None):
        video = self.get_object()
        
        # Record the view
        if request.user.is_authenticated:
            VideoView.objects.create(
                video=video,
                user=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        else:
            VideoView.objects.create(
                video=video,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        
        # Increment view count
        video.views += 1
        video.save()
        
        return Response({'status': 'view recorded'})
    
    @action(detail=True, methods=['get'])
    def comments(self, request, slug=None):
        """
        Get all top-level comments for a video
        """
        video = self.get_object()
        comments = Comment.objects.filter(video=video, parent=None).order_by('-created_at')
        page = self.paginate_queryset(comments)
        if page is not None:
            serializer = CommentSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
            
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        video = self.get_object()
        category = video.category
        
        related_videos = Video.objects.filter(
            Q(category=category) | Q(tags__icontains=video.tags),
            ~Q(id=video.id),
            privacy='public'
        ).distinct()[:10]
        
        serializer = VideoSerializer(related_videos, many=True)
        return Response(serializer.data)

# Category Views
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing categories and their associated videos.
    Publicly accessible to all users.
    """
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Make categories publicly accessible
    lookup_field = 'slug'
    
    def get_queryset(self):
        """
        Return all categories ordered by name.
        """
        return Category.objects.all().order_by('name')
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def videos(self, request, slug=None):
        """
        Get all public videos in this category.
        Supports pagination and filtering by query parameters.
        """
        category = self.get_object()
        videos = Video.objects.filter(
            category=category, 
            privacy='public'
        ).order_by('-created_at')
        
        # Apply pagination
        page = self.paginate_queryset(videos)
        if page is not None:
            serializer = VideoSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
            
        serializer = VideoSerializer(videos, many=True, context={'request': request})
        return Response(serializer.data)

# Comment Views
class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsCommentOwner]
    
    def get_queryset(self):
        """
        Optionally filter comments by video if video_slug is provided in the URL
        """
        queryset = Comment.objects.all()
        video_slug = self.request.query_params.get('video')
        if video_slug:
            queryset = queryset.filter(video__slug=video_slug)
        return queryset
    
    def get_serializer_context(self):
        """
        Add request to serializer context for URL building
        """
        return {'request': self.request}
    
    def perform_create(self, serializer):
        """
        Set the user to the current user when creating a comment
        """
        comment = serializer.save(user=self.request.user)
        
        # Create notification for video owner if commenter is not the video owner
        video = comment.video
        if comment.user != video.uploader:
            Notification.objects.create(
                recipient=video.uploader,
                sender=comment.user,
                notification_type='comment',
                video=video,
                comment=comment,
                text=f'{comment.user.username} commented on your video "{video.title}"'
            )

# Like Views
class LikeView(generics.CreateAPIView):
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        video_id = request.data.get('video')
        like_type = request.data.get('like_type')
        
        if not video_id or not like_type:
            return Response({'error': 'Video ID and like type are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        video = get_object_or_404(Video, id=video_id)
        
        # Check if user already liked/disliked this video
        like, created = Like.objects.get_or_create(
            video=video,
            user=request.user,
            defaults={'like_type': like_type}
        )
        
        if not created:
            # User already liked/disliked, update the type
            if like.like_type == like_type:
                # If same type, remove the like/dislike
                like.delete()
                return Response({'status': f'{like_type} removed'}, status=status.HTTP_200_OK)
            else:
                # Change like to dislike or vice versa
                like.like_type = like_type
                like.save()
        
        # Create notification for video owner if liker is not the video owner
        if request.user != video.uploader:
            Notification.objects.create(
                recipient=video.uploader,
                sender=request.user,
                notification_type='like',
                video=video,
                text=f'{request.user.username} {like_type}d your video "{video.title}"'
            )
        
        serializer = self.get_serializer(like)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

# Notification Views
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        notifications = self.get_queryset()
        notifications.update(is_read=True)
        return Response({'status': 'all marked as read'})

# Search Views
class SearchView(generics.ListAPIView):
    serializer_class = VideoSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'tags', 'uploader__username']
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if not query:
            return Video.objects.none()
            
        # Only public videos in search results for anonymous users
        if self.request.user.is_authenticated:
            return Video.objects.filter(
                Q(privacy='public') | 
                Q(privacy='unlisted') | 
                Q(uploader=self.request.user)
            )
        return Video.objects.filter(privacy='public')
