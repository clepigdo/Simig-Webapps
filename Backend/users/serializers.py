from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Profile

# --- 1. REGISTER SERIALIZER (SUDAH DIPERBAIKI) ---
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    # Kita buat Email & Nama Depan/Belakang jadi TIDAK WAJIB (Opsional)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    
    # Wajibkan Full Name
    full_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'full_name')

    def create(self, validated_data):
        # Role otomatis 'user' sesuai default di models.py
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''), # Jika kosong, isi string kosong
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            full_name=validated_data.get('full_name', '')
        )
        return user

# --- 2. LOGIN SERIALIZER (UPDATED) ---
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        # Ambil username & password secara eksplisit
        username = data.get("username", "")
        password = data.get("password", "")

        if username and password:
            # Cek kredensial ke database
            user = authenticate(username=username, password=password)
            
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("Akun ini sedang dinonaktifkan.")
                return user
            else:
                raise serializers.ValidationError("Username atau Password salah.")
        else:
            raise serializers.ValidationError("Harus menyertakan username dan password.")

# --- 3. PROFIL SERIALIZER (GET & EDIT INFO) ---
class UserProfileSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'image_url']
        read_only_fields = ['id', 'role'] # Role tidak bisa diedit user sendiri

    def get_image_url(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'profile') and obj.profile.image and hasattr(obj.profile.image, 'url'):
            return request.build_absolute_uri(obj.profile.image.url)
        return None

# --- 4. SERIALIZER GANTI FOTO ---
class ProfileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['image']

# --- 5. SERIALIZER GANTI PASSWORD ---
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': "Password baru tidak cocok."})
        return data
    
# --- 6. SERIALIZER MANAJEMEN USER (KHUSUS ADMIN) ---
class UserManagementSerializer(serializers.ModelSerializer):
    # Password hanya required saat create (add user), saat edit boleh kosong
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'password']

    def create(self, validated_data):
        # Logic Create User Baru (Sama seperti register tapi bisa set role)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            role=validated_data.get('role', 'user') # Admin bisa pilih role
        )
        return user

    def update(self, instance, validated_data):
        # Logic Edit User (Bisa ganti Role)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.role = validated_data.get('role', instance.role) # INI KUNCINYA

        # Update password jika diisi
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance