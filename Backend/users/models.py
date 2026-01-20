from django.db import models 
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

# Custom User Model
class User(AbstractUser):
    # Pilihan Role
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    
    full_name = models.CharField(max_length=255, blank=True, null=True)
    # Default role adalah 'user' agar aman saat register
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return self.username

# Model Profile (untuk Foto & Data Tambahan)
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    image = models.ImageField(default='default.png', upload_to='profile_pics')

    def __str__(self):
        return self.user.username

# Signals: Otomatis buat Profile saat User baru register
@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()