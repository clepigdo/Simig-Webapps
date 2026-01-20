from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, UserProfileView, 
    ChangePasswordView, UpdateProfileImageView, CurrentUserView,
    UserManagementViewSet # Import view baru
)
from rest_framework_simplejwt.views import TokenRefreshView

# Gunakan Router untuk ViewSet
router = DefaultRouter()
router.register(r'manage', UserManagementViewSet, basename='manage-users')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/upload-image/', UpdateProfileImageView.as_view(), name='upload-image'),
    
    # Masukkan URL router (ini akan menghasilkan /users/manage/...)
    path('', include(router.urls)), 
]