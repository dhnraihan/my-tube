from django.contrib import admin
from .models import Video, Category, Comment, Like, VideoView

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'uploader', 'category', 'privacy', 'views', 'created_at')
    list_filter = ('privacy', 'category', 'created_at')
    search_fields = ('title', 'description', 'tags', 'uploader__username')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('views', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'parent', 'text', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('text', 'user__username', 'video__title')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'like_type', 'created_at')
    list_filter = ('like_type', 'created_at')
    search_fields = ('user__username', 'video__title')
    readonly_fields = ('created_at',)

@admin.register(VideoView)
class VideoViewAdmin(admin.ModelAdmin):
    list_display = ('video', 'user', 'ip_address', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('video__title', 'user__username', 'ip_address')
    readonly_fields = ('viewed_at',)
