import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ShoppingBag, TrendingUp, Users, Package } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function OverviewManager() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    chartData: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'users'))
        ]);
        
        if (!isMounted) return;

        const orders = ordersSnap.docs.map(doc => doc.data());
        const products = productsSnap.docs.map(doc => doc.data());
        const users = usersSnap.docs.map(doc => doc.data());

        const chartDataMap = new Map();
        const now = new Date();
        now.setHours(0,0,0,0);
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
          chartDataMap.set(dateStr, { name: dateStr, sales: 0, orders: 0 });
        }

        const totalOrders = orders?.length || 0;
        let totalSales = 0;
        let pendingOrders = 0;
        
        orders?.forEach((o: any) => {
          if (o.status !== 'cancelled') totalSales += (o.totalAmount || 0);
          if (o.status === 'pending') pendingOrders++;
          
          let date;
          if (o.createdAt?.toDate) {
             date = o.createdAt.toDate();
          } else if (o.createdAt) {
             date = new Date(o.createdAt);
          }
          if (date) {
            const dateStr = date.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
            if (chartDataMap.has(dateStr)) {
               const existing = chartDataMap.get(dateStr)!;
               existing.orders += 1;
               if (o.status !== 'cancelled') {
                 existing.sales += (o.totalAmount || 0);
               }
            }
          }
        });

        const totalProducts = products?.length || 0;
        const totalUsers = users?.length || 0;
        const chartData = Array.from(chartDataMap.values());

        setStats({
          totalOrders,
          totalSales,
          totalProducts,
          totalUsers,
          pendingOrders,
          chartData
        });
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        if (isMounted) setErrorInfo(error?.message || 'Error occurred');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="py-20 text-center">লোড হচ্ছে... {errorInfo && <span className="text-red-500">{errorInfo}</span>}</div>;
  if (!loading && errorInfo) return <div className="py-20 text-center text-red-500">Error: {errorInfo}</div>;

  const statCards = [
    { label: 'মোট অর্ডার', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'মোট বিক্রি (৳)', value: stats.totalSales.toLocaleString('bn-BD'), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'অপেক্ষমান অর্ডার', value: stats.pendingOrders, icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'মোট প্রোডাক্ট', value: stats.totalProducts, icon: Package, color: 'text-brand', bg: 'bg-accent/5' },
    { label: 'মোট কাস্টমার', value: stats.totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-gray-900">
      <h2 className="text-2xl font-black mb-6">ওভারভিউ</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{card.label}</div>
              <div className="text-2xl font-black text-gray-900">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Sales Summary or Recent Orders could go here */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm col-span-1">
           <h3 className="font-bold text-lg mb-4">ব্যবসা পরিস্থিতি (গত ৭ দিন)</h3>
           <p className="text-gray-500 text-sm">আপনার স্টোরের বর্তমান অবস্থা এবং সাম্প্রতিক পারফরম্যান্স এখানে দেখা যাচ্ছে।</p>
           <div className="mt-6 h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                 <YAxis yAxisId="left" orientation="left" stroke="#10B981" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} />
                 <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={10} />
                 <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                 <Legend wrapperStyle={{paddingTop: '20px'}} />
                 <Bar yAxisId="left" name="বিক্রি (৳)" dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} />
                 <Bar yAxisId="right" name="অর্ডার" dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
