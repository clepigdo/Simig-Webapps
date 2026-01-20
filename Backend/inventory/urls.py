from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, TransactionInViewSet, TransactionOutViewSet, DashboardDataView, ReportView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet) # Endpoint: /api/categories/
router.register(r'products', ProductViewSet)    # Endpoint: /api/products/
router.register(r'transactions-in', TransactionInViewSet)
router.register(r'transactions-out', TransactionOutViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardDataView.as_view(), name='dashboard-data'),
    path('reports/', ReportView.as_view(), name='reports-data')
]