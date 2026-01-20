from rest_framework import serializers
from .models import Category, Product, TransactionIn, TransactionOut

# --- Serializer Kategori ---
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

# --- Serializer Produk ---
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_name', 
            'color', 'weight', 'price_per_kg', 
            'total_value', 'created_at'
            # Field 'stock' dihapus dari sini
        ]

    def get_total_value(self, obj):
        # Total Aset = Berat (Kg) * Harga/Kg
        return obj.weight * obj.price_per_kg

# --- Serializer Transaksi Masuk ---
class TransactionInSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = TransactionIn
        fields = ['id', 'product', 'product_name', 'date', 'quantity', 'notes', 'created_at']

# --- Serializer Transaksi Keluar ---
class TransactionOutSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = TransactionOut
        fields = ['id', 'product', 'product_name', 'date', 'quantity', 'notes', 'created_at']