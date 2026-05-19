import React, { useState } from 'react';
import { Search, Package, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import SEO from '../components/SEO';

interface OrderData {
  id?: string;
  customerPhone?: string;
  status?: string;
  createdAt?: any;
  items?: Array<{ name: string; qty: number; price: number; variation?: string; image?: string; }>;
  totalAmount?: number;
  [key: string]: unknown;
}

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedOrderId = orderId.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedOrderId || !trimmedPhone) {
      setError('ট্র্যাকিং আইডি এবং ফোন নম্বর দিন');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const orderRef = doc(db, 'orders', trimmedOrderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        setError('অর্ডার আইডিটি সঠিক নয়। আপনার ড্যাশবোর্ড থেকে সঠিক আইডিটি কপি করে দিন।');
        setOrder(null);
        return;
      }

      const orderData = { id: orderSnap.id, ...orderSnap.data() } as OrderData;

      if (orderData.customerPhone !== trimmedPhone) {
        setError('এই ফোন নম্বরের সাথে ঐ অর্ডার আইডি মিলছেনা।');
        setOrder(null);
        return;
      }

      setOrder(orderData);
      setError('');
    } catch (err: unknown) {
      console.error('Error tracking order:', err);
      setError('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। দয়া করে ইন্টারনেট সংযোগ চেক করুন এবং সঠিক আইডি দিচ্ছেন কিনা নিশ্চিত হোন।');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending': return { text: 'অপেক্ষমান', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock };
      case 'processing': return { text: 'প্রসেসিং', color: 'text-blue-600', bg: 'bg-blue-50', icon: TrendingUp };
      case 'shipped': return { text: 'ডেলিভারিতে', color: 'text-purple-600', bg: 'bg-purple-50', icon: Package };
      case 'delivered': return { text: 'ডেলিভার্ড', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
      case 'cancelled': return { text: 'ক্যান্সেলড', color: 'text-red-600', bg: 'bg-red-50', icon: CheckCircle };
      default: return { text: 'অজানা', color: 'text-gray-600', bg: 'bg-gray-50', icon: Package };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 font-[sans-serif]">
      <SEO title="Order Tracking" url="https://babypyar.com/tracking" />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">অর্ডার <span className="text-brand">ট্র্যাকিং</span></h1>
          <p className="text-gray-500">আপনার ট্র্যাকিং আইডি এবং ফোন নম্বর দিয়ে অর্ডারের অবস্থা জানুন</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-8">
          <form className="flex flex-col md:flex-row gap-4" onSubmit={handleTrack}>
            <div className="flex-1">
              <input
                type="text"
                placeholder="অর্ডার আইডি (e.g. ord-123)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-brand transition-all"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <input
                type="tel"
                placeholder="আপনার ফোন নম্বর"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-brand transition-all"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>অনুসন্ধান হচ্ছে...</>
              ) : (
                <>
                  <Search size={20} />
                  ট্র্যাক করুন
                </>
              )}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4 text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
        </div>

        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-down">
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50 flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">অর্ডার নং</p>
                <p className="text-xl font-extrabold text-gray-900">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium mb-1">অর্ডারের তারিখ</p>
                <p className="font-medium text-gray-900">
                  {order.createdAt ? (order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'অজানা'}
                </p>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">ট্র্যাকিং ডিটেইলস</h3>
              
              <div className="mb-12 mt-4">
                <div className="flex items-center w-full">
                  {['pending', 'processing', 'shipped', 'delivered'].map((step, index, array) => {
                    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                    const currentIndex = statusOrder.indexOf(order.status || 'pending');
                    const isActive = index <= currentIndex;
                    const isLast = index === array.length - 1;
                    
                    let StepIcon = Clock;
                    let label = 'অপেক্ষমান';
                    
                    if (step === 'processing') { StepIcon = TrendingUp; label = 'প্রসেসিং'; }
                    if (step === 'shipped') { StepIcon = Package; label = 'ডেলিভারিতে'; }
                    if (step === 'delivered') { StepIcon = CheckCircle; label = 'ডেলিভার্ড'; }

                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 z-10 border-2 transition-all duration-500 ${
                            isActive ? 'bg-accent border-accent text-gray-900' : 'bg-white border-gray-200 text-gray-400'
                          }`}>
                            <StepIcon size={20} className="md:w-6 md:h-6" />
                          </div>
                          <span className={`text-[10px] md:text-xs font-bold text-center ${isActive ? 'text-brand' : 'text-gray-400'}`}>
                            {label}
                          </span>
                        </div>
                        {!isLast && (
                          <div className="flex-1 h-0.5 bg-gray-200 relative -mt-6">
                            <div 
                              className="absolute h-full bg-accent transition-all duration-700 ease-in-out" 
                              style={{ width: index < currentIndex ? '100%' : '0%' }}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {order.status === 'cancelled' && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                  <CheckCircle size={24} />
                  <div>
                    <p className="font-bold">অর্ডারটি ক্যান্সেল করা হয়েছে</p>
                    <p className="text-sm">দুঃখিত, এই অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।</p>
                  </div>
                </div>
              )}
              
              {(() => {
                const statusInfo = getStatusDisplay(order.status || 'pending');
                const StatusIcon = statusInfo.icon;
                return (
                  <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className={`w-12 h-12 rounded-full ${statusInfo.bg} ${statusInfo.color} flex items-center justify-center shrink-0`}>
                      <StatusIcon size={24} />
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
                      <p className="text-gray-500 text-sm">অর্ডারটি বর্তমানে এই অবস্থায় আছে।</p>
                    </div>
                  </div>
                );
              })()}
              
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">অর্ডারের বিবরণ</h3>
              <div className="space-y-4 mb-6">
                {Array.isArray(order.items) && order.items.map((item, idx: number) => (
                  <div key={idx} className="flex justify-between text-gray-700 items-start">
                    <div className="flex-1">
                      <span className="product-name font-medium text-gray-900">{item.name} <span className="text-gray-400 font-normal ml-1">x{item.qty}</span></span>
                      {item.variation && (
                         <div className="text-xs text-gray-500 mt-0.5">{item.variation}</div>
                      )}
                    </div>
                    <span className="font-medium bg-gray-50 px-2 py-1 rounded text-sm shrink-0 whitespace-nowrap ml-4">৳ {(item.price * item.qty).toLocaleString('bn-BD')}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between border-t border-gray-100 pt-4 text-lg font-extrabold text-gray-900">
                <span>মোট পেমেন্ট</span>
                <span>৳ {order.totalAmount?.toLocaleString('bn-BD') || 0}</span>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
