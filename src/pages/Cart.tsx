import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="py-32 px-6 text-center text-gray-900">
        <SEO title="Cart" url="https://babypyar.com/cart" />
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-2xl font-bold mb-4">আপনার কার্ট খালি</h2>
        <p className="text-gray-500 mb-8">এখনও কোনো প্রোডাক্ট যোগ করা হয়নি।</p>
        <Link to="/shop" className="bg-accent text-gray-900 px-8 py-3 rounded-full font-bold inline-block hover:bg-accent-hover transition-colors shadow-sm">
          শপিং শুরু করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto text-gray-900">
      <SEO title="Cart" url="https://babypyar.com/cart" />
      <h1 className="text-3xl font-black mb-10">আপনার <span className="text-brand">কার্ট</span></h1>
      
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {cart.map(item => {
            const itemKey = item.variation ? `${item.id}-${item.variation}` : item.id;
            return (
            <div key={itemKey} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="product-name font-bold text-lg text-gray-900">
                    {item.name} {item.variation && <span className="text-brand block text-sm mt-1">({item.variation})</span>}
                  </h3>
                  <button onClick={() => removeFromCart(item.id, item.variation)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="text-brand font-bold mt-1">৳ {item.price.toLocaleString('bn-BD')}</div>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                    <button onClick={() => updateQuantity(item.id, item.qty - 1, item.variation)} className="p-2 hover:text-brand text-gray-600"><Minus size={16} /></button>
                    <span className="w-10 text-center font-bold text-gray-900">{item.qty}</span>
                    <button onClick={() => updateQuantity(item.id, item.qty + 1, item.variation)} className="p-2 hover:text-brand text-gray-600"><Plus size={16} /></button>
                  </div>
                  <div className="text-sm font-bold ml-auto text-gray-900">
                    মোট: ৳ {(item.price * item.qty).toLocaleString('bn-BD')}
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit sticky top-24">
          <h3 className="text-xl font-bold mb-6 text-gray-900">অর্ডার সামারি</h3>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-600">
               <span>সাবটোটাল</span>
               <span className="text-gray-900 font-medium">৳ {cartTotal.toLocaleString('bn-BD')}</span>
            </div>
            {/* simple info message */}
            <div className="text-xs text-brand bg-brand/5 p-3 rounded-lg border border-brand/10">
              বিকাশ পেমেন্টে ১০% ডিসকাউন্ট পাবেন চেকআউট পেজে!
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-8">
            <div className="flex justify-between font-black text-xl text-gray-900">
               <span>সর্বমোট</span>
               <span>৳ {cartTotal.toLocaleString('bn-BD')}</span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-accent hover:bg-accent-hover text-gray-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            চেকআউট পেজে যান <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
