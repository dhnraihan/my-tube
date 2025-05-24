import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mytube.settings')
django.setup()

from videos.models import Video

# Count and list all videos
videos = Video.objects.all()
print(f"Total videos in database: {videos.count()}")
print("\nVideo details:")
for video in videos:
    print(f"- {video.title} (ID: {video.id}, Slug: {video.slug}, Status: {video.privacy})")

# Check if media directory exists and list files
import os
media_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media')
print(f"\nMedia directory exists: {os.path.exists(media_dir)}")
if os.path.exists(media_dir):
    print("\nFiles in media directory:")
    for root, dirs, files in os.walk(media_dir):
        level = root.replace(media_dir, '').count(os.sep)
        indent = ' ' * 4 * level
        print(f"{indent}{os.path.basename(root)}/")
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            print(f"{subindent}{f}")
