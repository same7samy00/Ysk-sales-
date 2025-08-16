import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAppContext } from '../App';
import { UsersIcon, ShoppingCartIcon, PackageIcon, DollarSignIcon, FileTextIcon } from '../components/icons';
import { Invoice, Product } from '../types';

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
  </div>
);

const ChartContainer = ({ title, children }: { title: string; children: React.ReactElement }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-700">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
           <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
    </div>
);

const RecentInvoicesTable = ({ invoices }: { invoices: Invoice[] }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-700">أحدث الفواتير</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">رقم الفاتورة</th>
                        <th className="p-2">العميل</th>
                        <th className="p-2">التاريخ</th>
                        <th className="p-2">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.slice(0, 5).map(invoice => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{invoice.id}</td>
                            <td className="p-2">{invoice.customer?.name || 'عميل نقدي'}</td>
                            <td className="p-2">{invoice.date}</td>
                            <td className="p-2">{invoice.total.toFixed(2)} ج.م</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const RecentProductsTable = ({ products }: { products: Product[] }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-700">أحدث المنتجات المضافة</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">المنتج</th>
                        <th className="p-2">السعر</th>
                        <th className="p-2">الكمية</th>
                    </tr>
                </thead>
                <tbody>
                    {products.slice(0, 5).map(product => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{product.name}</td>
                            <td className="p-2">{product.price.toFixed(2)} ج.م</td>
                            <td className="p-2">{product.quantity} {product.unit.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const DashboardPage = () => {
    const { products, customers, invoices } = useAppContext();

    // Calculate statistics
    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalInvoices = invoices.length;
    const totalProfit = invoices.reduce((totalProfit, invoice) => {
        const invoiceProfit = invoice.items.reduce((itemProfit, item) => {
            const product = products.find(p => p.id === item.product.id);
            if (product) {
                return itemProfit + (item.price - product.purchasePrice) * item.quantity;
            }
            return itemProfit;
        }, 0);
        return totalProfit + invoiceProfit;
    }, 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + p.purchasePrice * p.quantity, 0);
    const outOfStockProducts = products.filter(p => p.quantity === 0).length;
    const totalProducts = products.length;
    const totalCustomers = customers.length;

    // Process data for charts
    const salesByDay = invoices.reduce((acc, inv) => {
        const date = new Date(inv.date).toLocaleDateString('ar-EG', { weekday: 'long' });
        acc[date] = (acc[date] || 0) + inv.total;
        return acc;
    }, {} as { [key: string]: number });

    const salesData = Object.keys(salesByDay).map(day => ({
        name: day,
        sales: salesByDay[day],
    }));

    const productSales = invoices.flatMap(inv => inv.items).reduce((acc, item) => {
        acc[item.product.name] = (acc[item.product.name] || 0) + item.quantity;
        return acc;
    }, {} as { [key: string]: number });

    const topProductsData = Object.keys(productSales).map(name => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        quantitySold: productSales[name],
    })).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);


  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">لوحة التحكم الشاملة</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="إجمالي المبيعات" value={`${totalSales.toFixed(2)} ج.م`} icon={<DollarSignIcon className="h-8 w-8 text-white" />} color="bg-green-500" />
        <StatCard title="إجمالي الأرباح" value={`${totalProfit.toFixed(2)} ج.م`} icon={<DollarSignIcon className="h-8 w-8 text-white" />} color="bg-teal-500" />
        <StatCard title="قيمة المخزون" value={`${totalInventoryValue.toFixed(2)} ج.م`} icon={<PackageIcon className="h-8 w-8 text-white" />} color="bg-orange-500" />
        <StatCard title="إجمالي الفواتير" value={totalInvoices} icon={<FileTextIcon className="h-8 w-8 text-white" />} color="bg-blue-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartContainer title="ملخص المبيعات اليومي">
             <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} ج.م`} />
                <Legend />
                <Line type="monotone" dataKey="sales" name="المبيعات" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
        </ChartContainer>
        <ChartContainer title="المنتجات الأكثر مبيعاً">
            <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value: number) => `${value} قطعة`} />
                <Legend />
                <Bar dataKey="quantitySold" name="الكمية المباعة" fill="#8b5cf6" />
            </BarChart>
        </ChartContainer>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentInvoicesTable invoices={invoices} />
        <RecentProductsTable products={products} />
      </div>

    </div>
  );
};

export default DashboardPage;
