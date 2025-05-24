from django.core.management.base import BaseCommand
from videos.models import Category

class Command(BaseCommand):
    help = 'Adds default categories to the database'

    def handle(self, *args, **options):
        categories = [
            'Music', 'Gaming', 'News', 'Sports', 'Entertainment',
            'Education', 'Science & Technology', 'Cooking', 'Travel', 'Fashion'
        ]
        
        created_count = 0
        for name in categories:
            _, created = Category.objects.get_or_create(
                name=name,
                defaults={
                    'slug': name.lower().replace(' ', '-')
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created category: {name}'))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} categories'))
