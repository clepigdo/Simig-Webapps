from django.db import models, transaction

class Category(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=50, blank=True, null=True)
    
    # KITA PAKAI WEIGHT SEKARANG (BUKAN STOCK)
    weight = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Total Berat (Kg)")
    price_per_kg = models.DecimalField(max_digits=15, decimal_places=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class TransactionIn(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='transactions_in')
    date = models.DateField()
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Pakai atomic agar database aman kalau error di tengah jalan
        with transaction.atomic():
            # CEK: Apakah ini EDIT data lama? (Punya ID)
            if self.pk:
                try:
                    # Ambil data transaksi VERSI LAMA dari database
                    old_transaction = TransactionIn.objects.get(pk=self.pk)
                    
                    # LOGIKA 1: UNDO (Batalkan efek lama)
                    # Kembalikan berat produk seperti sebelum transaksi ini ada
                    # Contoh: 150 - 50 = 100
                    product_lama = old_transaction.product
                    product_lama.weight -= old_transaction.quantity
                    product_lama.save()
                except TransactionIn.DoesNotExist:
                    pass 

            # Simpan data transaksi yang BARU (Update angka 50 jadi 200 di database)
            super().save(*args, **kwargs)

            # LOGIKA 2: APPLY (Terapkan efek baru)
            # Ambil produk terbaru (refresh agar dapat angka 100 tadi)
            self.product.refresh_from_db()
            # Tambahkan angka baru: 100 + 200 = 300
            self.product.weight += self.quantity
            self.product.save()

    def delete(self, *args, **kwargs):
        with transaction.atomic():
            # Kalau dihapus, kembalikan stok (Kurangi)
            self.product.weight -= self.quantity
            self.product.save()
            super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - +{self.quantity} Kg"
    
class TransactionOut(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='transactions_out')
    date = models.DateField()
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        with transaction.atomic():
            # CEK: Apakah ini EDIT?
            if self.pk:
                try:
                    old_transaction = TransactionOut.objects.get(pk=self.pk)
                    
                    # LOGIKA 1: UNDO (Batalkan Pengurangan Lama)
                    # Kembalikan berat (Ditambah lagi)
                    product_lama = old_transaction.product
                    product_lama.weight += old_transaction.quantity
                    product_lama.save()
                except TransactionOut.DoesNotExist:
                    pass

            super().save(*args, **kwargs)

            # LOGIKA 2: APPLY (Kurangi dengan Angka Baru)
            self.product.refresh_from_db()
            self.product.weight -= self.quantity
            self.product.save()

    def delete(self, *args, **kwargs):
        with transaction.atomic():
            # Kalau dihapus, kembalikan stok (Tambah lagi)
            self.product.weight += self.quantity
            self.product.save()
            super().delete(*args, **kwargs)

    def __str__(self):
        return f"OUT - {self.product.name} - -{self.quantity} Kg"