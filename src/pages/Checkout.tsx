import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth, handleFirestoreError, OperationType } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, ensureUserRecord } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('inside');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'cod'>('bkash');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);

  const deliveryCharge = deliveryArea === 'inside' ? 70 : 120;
  const discount = paymentMethod === 'bkash' ? Math.round(cartTotal * 0.1) : 0;
  const finalTotal = cartTotal - discount + deliveryCharge;

  if (cart.length === 0) {
    return (
      <div className="py-32 text-center text-gray-900">
        <h2 className="text-2xl font-bold mb-4">আপনার কার্ট খালি</h2>
        <button onClick={() => navigate('/shop')} className="text-brand hover:text-brand-hover underline font-medium">শপিং করুন</button>
      </div>
    );
  }

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) return toast.error('সব ফিল্ড পূরণ করুন');
    if (paymentMethod === 'bkash' && !trxId) return toast.error('বিকাশ TrxID প্রয়োজন');

    setLoading(true);
    const orderPath = 'orders';
    try {
      let authorId = 'guest';
      if (user) {
        const syncedUser = await ensureUserRecord();
        if (!syncedUser) {
          throw new Error('User synchronization failed. Your profile record could not be found or created in the database.');
        }
        authorId = syncedUser.id || user.uid;
      }

      const orderData = {
        userId: authorId,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: cart.map(c => ({ 
          id: c.id, 
          name: c.variation ? `${c.name} - ${c.variation}` : c.name, 
          price: c.price, 
          qty: c.qty,
          variation: c.variation || null 
        })),
        totalAmount: finalTotal,
        deliveryCharge: deliveryCharge,
        paymentMethod: paymentMethod,
        trxId: paymentMethod === 'bkash' ? trxId : '',
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      console.log('Attempting to create order for user:', authorId);

      const docRef = await addDoc(collection(db, orderPath), orderData);
      
      console.log('Order created successfully with ID:', docRef.id);
      if (user) {
        toast.success('অর্ডার সফল হয়েছে!');
        navigate('/dashboard');
      } else {
        toast.success(`অর্ডার সফল হয়েছে! আপনার অর্ডার আইডি: ${docRef.id}`, { duration: 10000 });
        navigate('/tracking');
      }
      clearCart();
      setLoading(false);
    } catch (error) {
      console.error('Final error catch:', error);
      const e = error as Error;
      handleFirestoreError(e, OperationType.WRITE, orderPath);
      toast.error('অর্ডার করতে সমস্যা হয়েছে: ' + (e.message || 'সার্ভার রেসপন্স দিচ্ছে না'));
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="py-16 px-6 max-w-6xl mx-auto text-gray-900 min-h-screen">
      <h1 className="text-3xl font-black mb-10">চেকআউট</h1>
      
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-gray-900">ডেলিভারি ইনফরমেশন</h2>
          <form id="checkout-form" onSubmit={handleOrder} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">আপনার নাম <span className="text-brand">*</span></label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-brand transition-all" placeholder="সম্পূর্ণ নাম" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">মোবাইল নম্বর <span className="text-brand">*</span></label>
              <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-brand transition-all" placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">ঠিকানা <span className="text-brand">*</span></label>
              <textarea required value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-brand transition-all" placeholder="বাসা নম্বর, রোড, এলাকা, জেলা" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">ডেলিভারি এরিয়া <span className="text-brand">*</span></label>
              <div className="flex gap-4">
                <label className={`flex-1 p-4 rounded-xl border cursor-pointer text-center transition-all ${deliveryArea === 'inside' ? 'border-brand bg-accent/5 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                  <input type="radio" className="hidden" checked={deliveryArea === 'inside'} onChange={() => setDeliveryArea('inside')} />
                  <div className="font-bold text-gray-900">ঢাকার ভিতরে</div>
                  <div className="text-brand font-bold mt-1">৳ ৭০</div>
                </label>
                <label className={`flex-1 p-4 rounded-xl border cursor-pointer text-center transition-all ${deliveryArea === 'outside' ? 'border-brand bg-accent/5 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                  <input type="radio" className="hidden" checked={deliveryArea === 'outside'} onChange={() => setDeliveryArea('outside')} />
                  <div className="font-bold text-gray-900">ঢাকার বাইরে</div>
                  <div className="text-brand font-bold mt-1">৳ ১২০</div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">পেমেন্ট মেথড <span className="text-brand">*</span></label>
              <div className="flex gap-4 mb-4">
                <label className={`flex-1 p-4 rounded-xl border cursor-pointer text-center transition-all ${paymentMethod === 'bkash' ? 'border-brand bg-accent/5 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                  <input type="radio" className="hidden" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} />
                  <div className="font-bold text-[#E2136E]">বিকাশ</div>
                  <div className="text-xs mt-1 text-gray-600">১০% ডিসকাউন্ট!</div>
                </label>
                <label className={`flex-1 p-4 rounded-xl border cursor-pointer text-center transition-all ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                  <input type="radio" className="hidden" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <div className="font-bold text-emerald-600">ক্যাশ অন ডেলিভারি</div>
                  <div className="text-xs mt-1 text-gray-600">ক্যাশ পেমেন্ট</div>
                </label>
              </div>

              {paymentMethod === 'bkash' && (
                <div className="bg-[#E2136E]/5 border border-[#E2136E]/20 p-4 rounded-xl transition-all">
                  <div className="text-[#E2136E] font-bold text-lg mb-1">01788876206</div>
                  <div className="text-sm text-gray-600 mb-3 font-medium">পার্সোনাল নম্বর — Send Money করুন</div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">ট্রানজেকশন আইডি (TrxID) <span className="text-[#E2136E]">*</span></label>
                  <input required value={trxId} onChange={e => setTrxId(e.target.value)} type="text" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#E2136E] focus:ring-1 focus:ring-[#E2136E]" placeholder="যেমন: 8GF8HJ..." />
                </div>
              )}
            </div>
          </form>
        </div>

        <div>
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-gray-900">অর্ডার সামারি</h2>
            <div className="space-y-4 mb-6">
              {cart.map(item => {
                const itemKey = item.variation ? `${item.id}-${item.variation}` : item.id;
                return (
                  <div key={itemKey} className="flex justify-between items-center text-sm">
                    <span className="product-name text-gray-700 font-medium">
                      {item.name} {item.variation && <span className="text-brand ml-1">({item.variation})</span>} <span className="text-gray-400">× {item.qty}</span>
                    </span>
                    <span className="font-bold text-gray-900">৳ {(item.price * item.qty).toLocaleString('bn-BD')}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
               <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">সাবটোটাল</span>
                  <span className="font-bold text-gray-900">৳ {cartTotal.toLocaleString('bn-BD')}</span>
               </div>
               {discount > 0 && (
                 <div className="flex justify-between text-sm text-emerald-600">
                    <span className="font-medium">বিকাশ ডিসকাউন্ট (১০%)</span>
                    <span className="font-bold">-৳ {discount.toLocaleString('bn-BD')}</span>
                 </div>
               )}
               <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">ডেলিভারি চার্জ</span>
                  <span className="font-bold text-gray-900">৳ {deliveryCharge.toLocaleString('bn-BD')}</span>
               </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-8">
               <div className="flex justify-between text-xl font-black text-gray-900">
                  <span>সর্বমোট</span>
                  <span className="text-brand">
                    ৳ {finalTotal.toLocaleString('bn-BD')}
                  </span>
               </div>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-gray-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent-hover hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
