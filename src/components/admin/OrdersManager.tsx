import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (!isMounted) return;
        setOrders(data || []);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        if (isMounted) toast.error('অর্ডার লোড করতে সমস্যা হয়েছে');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => { isMounted = false; };
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (e: any) {
       console.error('Error updating order status:', e);
       toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  if (loading) return <div className="py-20 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto text-gray-900">
      <h2 className="text-xl font-bold mb-6 text-gray-900">সকল অর্ডার</h2>
      
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="p-3 font-medium">অর্ডার আইডি</th>
            <th className="p-3 font-medium">কাস্টমার</th>
            <th className="p-3 font-medium">তারিখ</th>
            <th className="p-3 font-medium">মোট</th>
            <th className="p-3 font-medium">স্ট্যাটাস</th>
            <th className="p-3 font-medium">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="p-3 font-mono text-sm">{order.id.slice(0,8).toUpperCase()}</td>
              <td className="p-3">
                <div className="font-bold text-gray-900">{order.customerName}</div>
                <div className="text-xs text-gray-500">{order.customerPhone}</div>
                <div className="text-xs text-gray-400 mt-1">{order.customerAddress}</div>
              </td>
              <td className="p-3 text-sm text-gray-700">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('bn-BD') : ''}</td>
              <td className="p-3 font-bold text-brand">৳{order.totalAmount}</td>
              <td className="p-3">
                <select 
                  value={order.status} 
                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none text-gray-900 focus:ring-1 focus:ring-accent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td className="p-3">
                 <button className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors font-medium">
                   বিস্তারিত
                 </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {orders.length === 0 && (
        <div className="text-center py-10 text-gray-500">কোনো অর্ডার নেই</div>
      )}
    </div>
  );
}
