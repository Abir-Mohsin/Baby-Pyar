import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Send, PlayCircle, Star, Heart, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { collection, query, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import SEO from '../components/SEO';
import { formatImageUrl } from '../utils/formatImage';

// Dummy products for fallback
export const DUMMY_PRODUCTS = [
  {
    id: 'p1',
    name: 'প্রিমিয়াম কটন টি-শার্ট',
    category: 'Mens Fashion',
    price: 450,
    originalPrice: 650,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
    badge: 'NEW',
    rating: 5,
    description: '১০০% কটন প্রিমিয়াম টি-শার্ট। সব ঋতুর জন্য আরামদায়ক।'
  },
  {
    id: 'p2',
    name: 'স্টাইলিশ সানগ্লাস',
    category: 'Accessories',
    price: 850,
    originalPrice: 1200,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
    badge: '-25%',
    rating: 4,
    description: 'আধুনিক ডিজাইনের পোলারাইজড সানগ্লাস।'
  },
  {
    id: 'p3',
    name: 'লেদার ওয়ালেট',
    category: 'Fashion',
    price: 1250,
    originalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
    badge: 'HOT',
    rating: 5,
    description: 'খাঁটি চামড়ার তৈরি টেকসই ওয়ালেট।'
  },
  {
    id: 'p4',
    name: 'স্মার্ট ওয়াচ প্রো',
    category: 'Gadgets',
    price: 3500,
    originalPrice: 4500,
    image: 'https://images.unsplash.com/photo-1544117518-30dd5f2f30be?auto=format&fit=crop&q=80&w=800',
    badge: 'BEST',
    rating: 4.8,
    description: 'স্মার্ট ফিচার সহ প্রিমিয়াম স্মার্ট ওয়াচ।'
  }
];

export default function Home() {
  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState<any[]>(DUMMY_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({
    heroTitle: 'Baby Pyar এ স্বাগতম আপনাকে!',
    heroSubtitle: 'প্রিমিয়াম কোয়ালিটির প্রোডাক্ট সবচেয়ে সাশ্রয়ী মূল্যে। বিকাশে পেমেন্ট করলে পাচ্ছেন ১০% এক্সট্রা ডিসকাউন্ট! সারা বাংলাদেশে দ্রুত ডেলিভারি।',
    videoUrl: '',
    stats: { customers: '5000+', districts: '64', rating: '4.8★' },
    promoCards: []
  });
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Settings
    getDoc(doc(db, 'settings', 'home')).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.data) {
          setSettings((prev: any) => ({
            ...prev,
            ...data.data,
            stats: { ...prev.stats, ...(data.data.stats || {}) }
          }));
        }
      }
    });

    // Fetch Products
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), limit(8));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Fetch Testimonials
    const fetchTestimonials = async () => {
      try {
        const q = query(collection(db, 'testimonials'), limit(6));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data.length > 0) {
          setTestimonials(data);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="overflow-x-hidden bg-transparent text-gray-800 font-[sans-serif]">
      <SEO 
        url="https://babypyar.com"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Baby Pyar",
          "url": "https://babypyar.com",
          "description": "Baby Pyar offers the best and most affordable baby products in Bangladesh. Shop clothes, toys, diapers, and more for your little ones.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://babypyar.com/shop?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      {/* Hero Section */}
      <section className="relative py-8 md:py-16 flex items-center justify-center px-4">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full text-brand text-xs md:text-sm mb-4 font-semibold">
            <span className="animate-pulse">🔥</span> 
            সেরা কোয়ালিটি প্রোডাক্ট এখন আপনার হাতের কাছে
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 whitespace-pre-line" dangerouslySetInnerHTML={{__html: settings.heroTitle.replace('Baby Pyar', '<span class="text-brand">Baby Pyar</span>')}}>
          </h1>
          
          <p className="text-sm md:text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto px-4 whitespace-pre-line">
            {settings.heroSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <Link to="/shop" className="bg-accent text-gray-900 px-8 py-3.5 rounded-xl font-bold font-anek shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all flex items-center justify-center gap-2">
              <ShoppingBag size={20} />
              প্রোডাক্ট দেখুন
            </Link>
            <Link to="/tracking" className="bg-white text-gray-800 border border-gray-200 px-8 py-3.5 rounded-xl font-bold shadow-sm hover:border-gray-300 transition-all flex items-center justify-center gap-2">
              <Search size={20} />
              অর্ডার ট্র্যাকিং
            </Link>
          </div>
          
          <div className="flex justify-center flex-wrap gap-6 md:gap-16 mt-12 pt-6 border-t border-gray-100">
            <div>
              <div className="text-2xl md:text-4xl font-extrabold text-gray-900">{settings.stats.customers}</div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">সন্তুষ্ট কাস্টমার</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-extrabold text-gray-900">{settings.stats.districts}</div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">জেলায় ডেলিভারি</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-extrabold text-gray-900">{settings.stats.rating}</div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">গড় রেটিং</div>
            </div>
          </div>
        </div>
      </section>

      {/* Promos & Video Section */}
      <section className="py-8 md:py-12 px-4 bg-transparent">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          {/* Promo Cards (2 cols if provided) */}
          {settings.promoCards && settings.promoCards.length > 0 && (
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
               {settings.promoCards.map((card: any, idx: number) => (
                 card.image ? (
                   <Link key={idx} to={card.link || '/shop'} className="block rounded-2xl overflow-hidden shadow-md border hover:border-brand/30 transition-all group">
                     <div className="aspect-square relative flex items-center justify-center overflow-hidden">
                       <img src={formatImageUrl(card.image)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     </div>
                   </Link>
                 ) : null
               ))}
            </div>
          )}

          {/* Video Section */}
          {settings.videoUrl && (
            <div className={`w-full ${settings.promoCards && settings.promoCards.filter((c:any)=>c.image).length > 0 ? 'md:w-1/2' : 'max-w-3xl mx-auto'} rounded-2xl overflow-hidden shadow-xl relative bg-gray-900 flex items-center justify-center aspect-video`}>
              <iframe 
                 className="w-full h-full absolute inset-0"
                 src={settings.videoUrl} 
                 title="Promotional Video"
                 frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 px-4 bg-transparent relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full text-brand text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">
              আমাদের প্রোডাক্ট
            </div>
            <h2 className="text-2xl md:text-5xl font-black">আমাদের <span className="text-brand">সেরা কালেকশন</span></h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product, index) => {
              const inCart = cart.some(item => item.id === product.id);
              return (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col h-full border border-gray-100"
                >
                  <div className="relative aspect-square md:aspect-[4/3] overflow-hidden bg-gray-100">
                    <img src={formatImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.badge && (
                      <span className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/90 backdrop-blur text-brand px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold z-10 shadow-sm">{product.badge}</span>
                    )}
                  </div>
                  <div className="p-3 md:p-5 flex flex-col flex-grow">
                    <div className="product-category text-[10px] md:text-xs text-brand font-bold uppercase tracking-wider mb-1 md:mb-2 line-clamp-1">{product.category}</div>
                    <Link to={`/product/${product.id}`} className="product-name text-sm md:text-lg font-bold mb-2 text-gray-900 hover:text-brand transition-colors block line-clamp-2">{product.name}</Link>
                    
                    <div className="flex items-center gap-1 md:gap-2 mb-3 md:mb-4">
                      <div className="text-yellow-500 text-xs md:text-sm">{'★'.repeat(Math.max(1, Math.floor(product.rating || 5)))}</div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4 mt-auto">
                      <span className="text-base md:text-xl font-extrabold text-gray-900">৳ {product.price.toLocaleString('bn-BD')}</span>
                      {product.original_price && (
                         <span className="text-gray-400 line-through text-[10px] md:text-sm">৳ {product.original_price.toLocaleString('bn-BD')}</span>
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
                          to="/cart"
                          className="w-full py-2 md:py-3.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 md:gap-2"
                        >
                          চেকআউট
                        </Link>
                      ) : (product.variation_type && product.variation_type !== 'none') ? (
                        <Link 
                          to={`/product/${product.id}`}
                          className="w-full py-2 md:py-3.5 bg-gray-50 hover:bg-accent hover:text-gray-900 text-gray-800 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 md:gap-2"
                        >
                          অপশন দেখুন
                        </Link>
                      ) : (
                        <button 
                          onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image })}
                          className="w-full py-2 md:py-3.5 bg-gray-50 hover:bg-accent hover:text-gray-900 text-gray-800 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 md:gap-2"
                        >
                          কার্টে যোগ
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-12 md:mt-16 text-center">
            <Link to="/shop" className="inline-flex items-center gap-2 text-brand font-bold font-anek border-b-2 border-brand/30 hover:border-brand pb-1 transition-colors">
              সব প্রোডাক্ট দেখুন <ShoppingBag size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-12 md:py-16 px-4 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-brand/5 px-3 py-1 rounded-full text-brand text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">
                কাস্টমার রিভিউ
              </div>
              <h2 className="text-2xl md:text-5xl font-black">আমাদের <span className="text-brand">গ্রাহকগণ</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, index) => (
                <motion.div 
                  key={t.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-6 rounded-2xl border shadow-sm hover:border-brand/30 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-brand/5 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 text-brand">
                      {t.image ? <img src={t.image} className="w-full h-full object-cover" /> : t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.location}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4 text-sm md:text-base leading-relaxed">"{t.text}"</p>
                  <div className="text-yellow-500 text-sm">{'★'.repeat(Math.max(1, Math.floor(t.rating || 5)))}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
