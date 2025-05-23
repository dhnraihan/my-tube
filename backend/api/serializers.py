from rest_framework import serializers
from accounts.models import User, Profile
from videos.models import Video, Category, Comment, Like
from notifications.models import Notification
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'email_verified', 'date_joined']
        read_only_fields = ['email_verified', 'date_joined']

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'bio', 'profile_picture', 'location', 
                 'website', 'date_of_birth', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
            
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        user.set_password(validated_data['password'])
        user.save()
        
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at']
        read_only_fields = ['slug', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'video', 'user', 'parent', 'text', 'created_at', 'updated_at', 'replies']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'video', 'user', 'like_type', 'created_at']
        read_only_fields = ['created_at']

class VideoSerializer(serializers.ModelSerializer):
    uploader = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category',
        write_only=True,
        required=False
    )
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'file', 'thumbnail', 
            'uploader', 'category', 'category_id', 'privacy', 
            'views', 'slug', 'duration', 'created_at', 'updated_at',
            'tags', 'likes_count', 'dislikes_count', 'comments_count'
        ]
        read_only_fields = ['views', 'slug', 'created_at', 'updated_at']
    
    def get_likes_count(self, obj):
        return obj.likes.filter(like_type='like').count()
    
    def get_dislikes_count(self, obj):
        return obj.likes.filter(like_type='dislike').count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'sender', 'notification_type', 
            'video', 'comment', 'text', 'is_read', 'created_at'
        ]
        read_only_fields = ['created_at']
