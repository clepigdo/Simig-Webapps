from django.contrib import admin
from .models import Category, Product, TransactionIn, TransactionOut

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(TransactionIn)
admin.site.register(TransactionOut)