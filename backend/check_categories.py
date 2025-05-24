import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mytube.settings')
django.setup()

from videos.models import Category

# Count and list all categories
categories = Category.objects.all()
print(f"Total categories in database: {categories.count()}")

if categories.exists():
    print("\nCategory details:")
    for category in categories:
        print(f"- {category.name} (ID: {category.id}, Slug: {category.slug})")
else:
    print("No categories found in the database.")
    print("Running seed_categories command...")
    from django.core.management import call_command
    call_command('seed_categories')
    
    # Check again after seeding
    categories = Category.objects.all()
    print(f"\nTotal categories after seeding: {categories.count()}")
    for category in categories:
        print(f"- {category.name} (ID: {category.id}, Slug: {category.slug})")
