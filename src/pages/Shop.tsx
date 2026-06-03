import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { DUMMY_PRODUCTS } from './Home';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { handleFirestoreError, OperationType } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { formatImageUrl } from '../utils/formatImage';

export default function Shop() {
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>(DUMMY_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (data.length > 0) {
          setProducts(data);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast.error('প্রোডাক্ট লোড করতে সমস্যা হয়েছে');
        // Optional: handleFirestoreError(error, OperationType.LIST, 'products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="py-8 px-4 md:px-6 bg-transparent min-h-screen text-gray-900">
      <SEO 
        title="Shop" 
        description="Explore our wide range of baby products."
        url="https://babypyar.com/shop"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Shop - Baby Pyar",
          "description": "Explore our wide range of baby products.",
          "url": "https://babypyar.com/shop"
        }}
      />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black mb-8 border-b border-gray-200 pb-4">সব <span className="text-brand">প্রোডাক্ট</span></h1>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand mb-4"></div>
            <div className="text-gray-500">প্রোডাক্ট লোড হচ্ছে...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
            <div className="text-xl font-bold text-gray-900 mb-2">কোনো প্রোডাক্ট পাওয়া যায়নি</div>
            <p className="text-gray-500 mb-6">অনুগ্রহ করে এডমিন প্যানেল থেকে প্রোডাক্ট যোগ করুন অথবা সোপাবেস কানেকশন চেক করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => {
              const original = product.original_price || product.price;
              const inCart = cart.some(item => item.id === product.id);
              
              return (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col h-full group"
                >
                  <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-100 block">
                    <img src={formatImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.badge && <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur text-brand px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold z-10 shadow-sm">{product.badge}</span>}
                  </Link>
                  <div className="p-3 md:p-5 flex flex-col flex-grow">
                    <div className="product-category text-[10px] md:text-xs text-brand font-bold uppercase tracking-wider mb-1 line-clamp-1">{product.category}</div>
                    <Link to={`/product/${product.id}`} className="product-name text-sm md:text-lg font-bold mb-2 text-gray-900 hover:text-brand block line-clamp-2 leading-tight">{product.name}</Link>
                    
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 md:mb-4 mt-auto">
                      <span className="text-base md:text-xl font-extrabold text-gray-900">৳ {product.price.toLocaleString('bn-BD')}</span>
                      {original > product.price && (
                         <span className="text-gray-400 line-through text-[10px] md:text-xs">৳ {original.toLocaleString('bn-BD')}</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-auto">
                      <Link 
                        to={`/product/${product.id}`}
                        className="w-full py-2 md:py-3 bg-accent/5 text-brand hover:bg-accent/10 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        বিস্তারিত
                      </Link>

                      {inCart ? (
                        <Link 
                          to="/checkout"
                          className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                        >
                          অর্ডার করুন
                        </Link>
                      ) : (product.variation_type && product.variation_type !== 'none') ? (
                        <Link 
                          to={`/product/${product.id}`}
                          className="w-full py-2.5 bg-gray-50 hover:bg-accent hover:text-gray-900 text-gray-800 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                        >
                          অপশন দেখুন
                        </Link>
                      ) : (
                        <button 
                          onClick={() => {
                            addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
                            navigate('/checkout');
                          }}
                          className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                        >
                          অর্ডার করুন
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
