from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Profile
from .serializers import (
    RegisterSerializer, LoginSerializer, 
    UserProfileSerializer, ChangePasswordSerializer, ProfileImageSerializer, UserManagementSerializer
)
from rest_framework import viewsets

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

# --- 1. REGISTER VIEW ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

# --- 2. LOGIN VIEW ---
class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
                'email': user.email,
                # AMBIL ROLE LANGSUNG DARI DATABASE
                'role': user.role, 
                'id': user.id
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 3. PROFIL VIEW (Lihat & Edit Data Diri) ---
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        # Mencegah user mengedit role sendiri lewat API ini
        if 'role' in request.data:
            return Response({'detail': 'Tidak boleh ubah role.'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = UserProfileSerializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 3B. CURRENT USER VIEW (Endpoint /me/ untuk cek role) ---
class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)

# --- 4. GANTI PASSWORD VIEW ---
class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def update(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            if not user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Password lama salah."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"message": "Password berhasil diubah."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 5. UPLOAD FOTO VIEW ---
class UpdateProfileImageView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileImageSerializer
    queryset = Profile.objects.all()

    def get_object(self):
        return self.request.user.profile

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            new_image_url = request.build_absolute_uri(instance.image.url)
            return Response({"image_url": new_image_url}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# --- 6. MANAJEMEN USER VIEWSET (CRUD ADMIN) ---
class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdminRole] # Hanya Role Admin yang bisa akses