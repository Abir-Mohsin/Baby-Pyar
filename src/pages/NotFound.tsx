import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <SEO 
        title="Page Not Found - 404" 
        description="আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি।"
      />
      <div className="bg-brand/10 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl font-black text-brand">404</span>
      </div>
      <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
        দুঃখিত! পেজটি <span className="text-brand">পাওয়া যায়নি</span>
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        আপনি যে লিংকটি খুঁজছেন সেটি হয়তো রিমুভ করা হয়েছে অথবা লিংকটি ভুল। অনুগ্রহ করে হোমপেজে ফিরে গিয়ে আবার চেষ্টা করুন।
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/"
          className="bg-brand hover:bg-brand-hover text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
          হোমপেজে ফিরে যান
        </Link>
        <Link 
          to="/shop"
          className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          <ShoppingBag size={20} />
          শপে যান
        </Link>
      </div>
    </div>
  );
}
