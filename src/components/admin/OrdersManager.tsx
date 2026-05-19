import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { X, Package } from 'lucide-react';
import { formatImageUrl } from '../../utils/formatImage';

export default function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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
                 <button 
                   onClick={() => setSelectedOrder(order)}
                   className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors font-medium">
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Package className="text-brand" size={20} />
                অর্ডারের বিস্তারিত
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">কাস্টমার তথ্য</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">নাম:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">ফোন নম্বর:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block mb-1">ঠিকানা:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.customerAddress}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block mb-1">অর্ডার নোট:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.note || 'কোনো নোট নেই'}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">প্রোডাক্টসমূহ</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 border border-gray-100 p-3 rounded-xl bg-white shadow-sm">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={formatImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h5>
                        {item.variation && (
                          <span className="inline-block mt-1 bg-accent/10 px-2 py-0.5 rounded text-xs font-bold text-brand">
                            {item.variation}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-brand">৳{item.price}</div>
                        <div className="text-xs text-gray-500">Qty: {item.qty}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-lg font-bold">
                <span>সর্বমোট:</span>
                <span className="text-brand">৳{selectedOrder.totalAmount?.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
