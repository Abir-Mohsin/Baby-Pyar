import React, { useEffect, useState } from 'react';
import { useAuth, handleFirestoreError, OperationType } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user, userId, userData } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(data || []);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast.error('অর্ডার লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  const handleCancelOrder = async (orderId: string) => {
    // Note: window.confirm might be blocked in some iframe environments
    // Proceeding directly for better usability in this specific environment
    setLoading(true);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'cancelled' });
      toast.success('অর্ডার ক্যানসেল করা হয়েছে');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.code === 'permission-denied' 
        ? 'আপনার এই অর্ডারটি ক্যানসেল করার অনুমতি নেই' 
        : 'অর্ডার ক্যানসেল করতে সমস্যা হয়েছে';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return <div className="py-20 text-center text-gray-500">লোড হচ্ছে...</div>;

  return (
    <div className="py-16 px-6 max-w-6xl mx-auto text-gray-900 min-h-screen">
      <h1 className="text-3xl font-black mb-8">মাই <span className="text-brand">ড্যাশবোর্ড</span></h1>
      
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <h2 className="text-xl font-bold mb-2 text-gray-900">প্রোফাইল</h2>
        <div className="text-gray-500">নাম: <span className="text-gray-900 font-medium">{userData?.name || user.displayName}</span></div>
        <div className="text-gray-500">ইমেইল: <span className="text-gray-900 font-medium">{user.email}</span></div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-900">আমার অর্ডারসমূহ</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-gray-200 shadow-sm">
           <p className="text-gray-500">আপনি এখনও কোনো অর্ডার করেননি।</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <motion.div 
              key={order.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileTap={{ scale: 0.99 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="text-sm text-gray-500 mb-1">অর্ডার আইডি: #{order.id.slice(0,8).toUpperCase()}</div>
                <div className="text-sm text-gray-500 mb-4">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric'}) : ''}</div>
                
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <span className="product-name font-medium text-sm text-gray-900">{item.name} <span className="text-brand">× {item.qty}</span></span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="md:text-right flex flex-col justify-between">
                <div>
                  <div className="font-bold text-xl mb-2 text-gray-900">৳ {order.totalAmount?.toLocaleString('bn-BD')}</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }
                  `}>
                    {order.status === 'pending' ? 'অপেক্ষমান' :
                     order.status === 'confirmed' ? 'নিশ্চিত করা হয়েছে' :
                     order.status === 'processing' ? 'প্রসেসিং' :
                     order.status === 'shipped' ? 'ডেলিভারিতে' :
                     order.status === 'delivered' ? 'ডেলিভার্ড' :
                     order.status === 'cancelled' ? 'ক্যান্সেলড' : order.status}
                  </div>
                </div>
                
                {order.status === 'pending' && (
                  <button onClick={() => handleCancelOrder(order.id)} className="text-sm text-red-500 hover:text-red-600 underline mt-4 order-cancel-btn">
                     অর্ডার ক্যানসেল করুন
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
