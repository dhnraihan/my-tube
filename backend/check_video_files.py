import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mytube.settings')
django.setup()

from videos.models import Video

# Get all videos
videos = Video.objects.all()
print(f"Found {videos.count()} videos in the database:")

for video in videos:
    print(f"\nVideo: {video.title} (ID: {video.id})")
    print(f"- Video file: {video.file}")
    print(f"- Thumbnail: {video.thumbnail}")
    
    # Check if files exist
    video_path = video.file.path if video.file else None
    thumb_path = video.thumbnail.path if video.thumbnail else None
    
    print(f"- Video file exists: {os.path.exists(video_path) if video_path else 'No file path'}")
    print(f"- Thumbnail exists: {os.path.exists(thumb_path) if thumb_path else 'No thumbnail path'}")
    
    if video_path and not os.path.exists(video_path):
        print(f"  - Expected video path: {video_path}")
    if thumb_path and not os.path.exists(thumb_path):
        print(f"  - Expected thumbnail path: {thumb_path}")
