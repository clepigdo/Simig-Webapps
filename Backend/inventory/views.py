from django.db.models import Sum, F, Count
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from .models import Category, Product, TransactionIn, TransactionOut
from .serializers import CategorySerializer, ProductSerializer, TransactionInSerializer, TransactionOutSerializer
from django.db.models.functions import TruncMonth, TruncDay, TruncYear
from datetime import timedelta
import locale

# Set locale ke Indonesia (Opsional, buat nama hari/bulan)
try:
    locale.setlocale(locale.LC_TIME, 'id_ID.utf8')
except:
    pass 


# --- ViewSets (CRUD) ---
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

class TransactionInViewSet(viewsets.ModelViewSet):
    queryset = TransactionIn.objects.all().order_by('-date', '-created_at')
    serializer_class = TransactionInSerializer
    permission_classes = [permissions.IsAuthenticated]

class TransactionOutViewSet(viewsets.ModelViewSet):
    queryset = TransactionOut.objects.all().order_by('-date', '-created_at')
    serializer_class = TransactionOutSerializer
    permission_classes = [permissions.IsAuthenticated]


# --- API DASHBOARD (WIDGETS) ---
class DashboardDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1. Total Aset (Berat * Harga)
        total_asset = Product.objects.aggregate(
            total=Sum(F('weight') * F('price_per_kg'))
        )['total'] or 0

        # 2. Total Berat Gudang
        total_weight = Product.objects.aggregate(
            total=Sum('weight')
        )['total'] or 0

        # 3. Stok Menipis (Logic: Ambil barang dengan berat terendah)
        lowest_product = Product.objects.order_by('weight').first()
        if lowest_product:
            lowest_stock_data = {
                "name": lowest_product.name,
                "stock": lowest_product.weight 
            }
        else:
            lowest_stock_data = { "name": "-", "stock": 0 }

        # 4. Pendapatan Bulan Ini
        current_month = timezone.now().month
        current_year = timezone.now().year
        trans_out_month = TransactionOut.objects.filter(
            date__month=current_month, 
            date__year=current_year
        )
        income_month = 0
        for item in trans_out_month:
            income_month += item.quantity * item.product.price_per_kg

        # 5. Tabel Terbaru
        recent_in = TransactionIn.objects.all().order_by('-date', '-created_at')[:5]
        recent_out = TransactionOut.objects.all().order_by('-date', '-created_at')[:5]

        in_serializer = TransactionInSerializer(recent_in, many=True)
        out_serializer = TransactionOutSerializer(recent_out, many=True)

        return Response({
            "total_asset": total_asset,
            "total_stock": total_weight, 
            "lowest_stock_item": lowest_stock_data,
            "income_month": income_month,
            "recent_in": in_serializer.data,
            "recent_out": out_serializer.data
        })
    

# --- API LAPORAN (CHARTS) ---
class ReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'bulanan') 
        today = timezone.now().date()
        
        # Variabel untuk menampung data chart
        bar_labels = []
        bar_values_out = [] # Data Keluar (Merah)
        bar_values_in = []  # Data Masuk (Biru)
        
        start_date = today # Default

        # ================= LOGIC BAR CHART (MASUK & KELUAR) =================
        if period == 'mingguan':
            start_date = today - timedelta(days=6)
            date_info = f"{start_date.strftime('%d %B')} s/d {today.strftime('%d %B %Y')}"
            
            # Init Chart Data (7 Hari ke belakang)
            chart_data_out = {}
            chart_data_in = {}
            
            for i in range(7):
                d = start_date + timedelta(days=i)
                label = d.strftime('%A') # Nama Hari
                chart_data_out[label] = 0
                chart_data_in[label] = 0
            
            # Query Keluar
            data_out = TransactionOut.objects.filter(date__gte=start_date)\
                .annotate(day=TruncDay('date')).values('day').annotate(total=Sum('quantity')).order_by('day')
            for item in data_out:
                chart_data_out[item['day'].strftime('%A')] = item['total']

            # Query Masuk
            data_in = TransactionIn.objects.filter(date__gte=start_date)\
                .annotate(day=TruncDay('date')).values('day').annotate(total=Sum('quantity')).order_by('day')
            for item in data_in:
                chart_data_in[item['day'].strftime('%A')] = item['total']

            bar_labels = list(chart_data_out.keys())
            bar_values_out = list(chart_data_out.values())
            bar_values_in = list(chart_data_in.values())

        elif period == 'bulanan':
            start_date = today.replace(day=1)
            date_info = f"{start_date.strftime('%B %Y')}"
            
            # Query Transaksi Bulan Ini
            trans_out = TransactionOut.objects.filter(date__year=today.year, date__month=today.month)
            trans_in = TransactionIn.objects.filter(date__year=today.year, date__month=today.month)

            weeks_data_out = {"Minggu 1": 0, "Minggu 2": 0, "Minggu 3": 0, "Minggu 4": 0}
            weeks_data_in = {"Minggu 1": 0, "Minggu 2": 0, "Minggu 3": 0, "Minggu 4": 0}

            # Helper function untuk grouping minggu
            def fill_weeks(transactions, data_dict):
                for t in transactions:
                    day = t.date.day
                    if day <= 7: data_dict["Minggu 1"] += t.quantity
                    elif day <= 14: data_dict["Minggu 2"] += t.quantity
                    elif day <= 21: data_dict["Minggu 3"] += t.quantity
                    else: data_dict["Minggu 4"] += t.quantity

            fill_weeks(trans_out, weeks_data_out)
            fill_weeks(trans_in, weeks_data_in)

            bar_labels = list(weeks_data_out.keys())
            bar_values_out = list(weeks_data_out.values())
            bar_values_in = list(weeks_data_in.values())

        elif period == 'tahunan':
            start_date = today.replace(month=1, day=1)
            date_info = f"Tahun {today.year}"
            
            # Init Bulan
            month_map = {
                1: "Januari", 2: "Februari", 3: "Maret", 4: "April", 5: "Mei", 6: "Juni",
                7: "Juli", 8: "Agustus", 9: "September", 10: "Oktober", 11: "November", 12: "Desember"
            }
            chart_data_out = {v: 0 for v in month_map.values()}
            chart_data_in = {v: 0 for v in month_map.values()}

            # Query Keluar
            query_out = TransactionOut.objects.filter(date__year=today.year)\
                .annotate(month=TruncMonth('date')).values('month').annotate(total=Sum('quantity')).order_by('month')
            for item in query_out:
                chart_data_out[month_map[item['month'].month]] = item['total']

            # Query Masuk
            query_in = TransactionIn.objects.filter(date__year=today.year)\
                .annotate(month=TruncMonth('date')).values('month').annotate(total=Sum('quantity')).order_by('month')
            for item in query_in:
                chart_data_in[month_map[item['month'].month]] = item['total']

            bar_labels = list(chart_data_out.keys())
            bar_values_out = list(chart_data_out.values())
            bar_values_in = list(chart_data_in.values())

        # ================= LOGIC PIE CHART (PER PRODUK) =================
        
        # Pie Out (Keluar)
        pie_out_query = TransactionOut.objects.filter(date__gte=start_date)\
            .values('product__name').annotate(total=Sum('quantity')).order_by('-total')
        pie_labels_out = [item['product__name'] for item in pie_out_query]
        pie_values_out = [item['total'] for item in pie_out_query]

        # Pie In (Masuk) -- NEW LOGIC
        pie_in_query = TransactionIn.objects.filter(date__gte=start_date)\
            .values('product__name').annotate(total=Sum('quantity')).order_by('-total')
        pie_labels_in = [item['product__name'] for item in pie_in_query]
        pie_values_in = [item['total'] for item in pie_in_query]

        # ================= SUMMARY =================
        trans_in_sum = TransactionIn.objects.filter(date__gte=start_date)
        trans_out_sum = TransactionOut.objects.filter(date__gte=start_date)

        total_in = trans_in_sum.aggregate(sum=Sum('quantity'))['sum'] or 0
        total_out = trans_out_sum.aggregate(sum=Sum('quantity'))['sum'] or 0
        
        revenue = sum(t.quantity * t.product.price_per_kg for t in trans_out_sum)
        asset_in = sum(t.quantity * t.product.price_per_kg for t in trans_in_sum)
        asset_change = asset_in - revenue

        return Response({
            # Data Grafik Keluar (Lama)
            "pie_chart": {"labels": pie_labels_out, "data": pie_values_out},
            "bar_chart": {"labels": bar_labels, "data": bar_values_out},
            
            # Data Grafik Masuk (BARU) - Frontend Laporan.jsx pakai key ini
            "pie_chart_in": {"labels": pie_labels_in, "data": pie_values_in},
            "bar_chart_in": {"labels": bar_labels, "data": bar_values_in},

            # Ringkasan
            "summary": {
                "total_in": total_in,
                "total_out": total_out,
                "revenue": revenue,
                "asset_change": asset_change,
                "date_info": date_info
            }
        })