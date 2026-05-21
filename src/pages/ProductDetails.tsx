/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { DUMMY_PRODUCTS } from './Home';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { formatImageUrl } from '../utils/formatImage';
import { parseVariationOption, calculateAdjustedPrice } from '../utils/variationUtils';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        let fetchedProduct: any = null;
        if (docSnap.exists()) {
          fetchedProduct = { id: docSnap.id, ...docSnap.data() };
        } else {
          // Check dummy products
          const dummy = DUMMY_PRODUCTS.find(p => p.id === id);
          if (dummy) fetchedProduct = dummy;
        }

        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setActiveImage(fetchedProduct.image);
        }
      } catch (error: any) {
        console.error('Error fetching product:', error);
        toast.error('প্রোডাক্ট লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      if (!id) return;
      try {
        const q = query(collection(db, 'product_reviews'), where('productId', '==', id));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort in memory to avoid needing a composite index
        docs.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        setReviews(docs);
      } catch (error) {
        console.error('Failed to fetch product reviews from database:', error);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  // Backwards compatibility for parsing variations
  const productVariations = product?.variations || [];
  if (product && productVariations.length === 0 && product.variationType && product.variationType !== 'none') {
    productVariations.push({
      name: product.variationType === 'size' ? 'Size' : product.variationType === 'age' ? 'Age' : product.variationType,
      options: product.availableVariations || []
    });
  }

  const defaultVars: Record<string, string> = {};
  if (product && productVariations.length > 0) {
    productVariations.forEach((v: any) => {
      let lowestOptionStr = v.options[0];
      let lowestAmount = Infinity;
      v.options.forEach((opt: string) => {
        const parsed = parseVariationOption(opt);
        if (parsed.priceDiff < lowestAmount) {
           lowestAmount = parsed.priceDiff;
           lowestOptionStr = opt;
        }
      });
      defaultVars[v.name] = lowestOptionStr || v.options[0];
    });
  }

  // Merge defaults with selected to ensure all variations have a value
  const activeVariations = { ...defaultVars, ...selectedVariations };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('লিংক কপি করা হয়েছে!');
  };

  if (loading) return <div className="py-20 text-center text-gray-500">লোড হচ্ছে...</div>;
  if (!product) return <div className="py-20 text-center text-gray-500">প্রোডাক্ট পাওয়া যায়নি।</div>;

  const basePrice = product.price;
  const original = product.originalPrice || basePrice;
  
  const selectedOptionsList = Object.values(activeVariations) as string[];
  const finalPrice = calculateAdjustedPrice(basePrice, selectedOptionsList, productVariations) || basePrice;
  const hasDiscount = original > basePrice;
  // If baseline has discount, apply same flat adjustment to original price
  const finalOriginalPrice = hasDiscount ? calculateAdjustedPrice(original, selectedOptionsList, productVariations) : original;

  // The formatted string for Cart (without | priceDiff)
  const variationsString = Object.keys(activeVariations).length > 0 
    ? Object.entries(activeVariations).map(([k, v]) => `${k}: ${parseVariationOption(v as string).label}`).join(', ') 
    : undefined;

  const inCart = cart.some(item => 
    item.id === product.id && 
    (item.variation === variationsString || (!item.variation && !variationsString))
  );

  const handleAddToCart = () => {
    // Check if all variations are selected
    if (productVariations.length > 0) {
      const missing = productVariations.find((v: any) => !activeVariations[v.name]);
      if (missing) {
        toast.error(`অনুগ্রহ করে ${missing.name} নির্বাচন করুন`);
        return;
      }
    }
    
    addToCart({ 
      id: product.id, 
      name: product.name, 
      price: finalPrice, 
      image: product.image,
      variation: variationsString
    }, qty);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('রিভিউ দিতে লগইন করুন');
      return;
    }
    if (!newReviewText.trim()) return toast.error('রিভিউ লিখুন');
    if (!id) return;
    
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'product_reviews'), {
        productId: id,
        userId: user.uid,
        userName: user.displayName || 'Customer',
        text: newReviewText,
        rating: newReviewRating,
        createdAt: serverTimestamp()
      });
      toast.success('রিভিউ যোগ করা হয়েছে');
      setNewReviewText('');
      setNewReviewRating(5);
      
      const q = query(collection(db, 'product_reviews'), where('productId', '==', id));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now(); // Assume new review is now if no timestamp yet (pending)
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return timeB - timeA;
      });
      setReviews(docs);
    } catch (err: any) {
      console.error('Add review error:', err);
      toast.error('রিভিউ দিতে সমস্যা হয়েছে: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto min-h-screen text-gray-900">
      <SEO 
        title={product.name} 
        description={product.description || product.name} 
        image={product.image}
        url={`https://babypyar.com/product/${product.id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": product.image,
          "description": product.description || product.name,
          "sku": product.id,
          "offers": {
            "@type": "Offer",
            "url": `https://babypyar.com/product/${product.id}`,
            "priceCurrency": "BDT",
            "price": product.price,
            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }}
      />
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-gray-50 flex flex-col">
          <div className="relative aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
            <img src={formatImageUrl(activeImage)} alt={product.name} className="w-full h-full object-cover transition-all duration-500" />
            {product.badge && <span className="absolute top-6 left-6 bg-white/90 backdrop-blur text-brand px-3 py-1 rounded-full text-xs font-bold z-10 shadow-sm">{product.badge}</span>}
          </div>
          
          {(product.gallery && product.gallery.length > 0) && (
            <div className="p-4 flex gap-3 overflow-x-auto bg-white border-t border-gray-100">
              <button 
                onClick={() => setActiveImage(product.image)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === product.image ? 'border-brand' : 'border-transparent'}`}
              >
                <img src={formatImageUrl(product.image)} className="w-full h-full object-cover" />
              </button>
              {product.gallery.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === img ? 'border-brand' : 'border-transparent'}`}
                >
                  <img src={formatImageUrl(img)} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          <div className="flex justify-between items-start mb-3">
            <div className="product-category text-brand font-bold uppercase tracking-widest text-xs">{product.category}</div>
            <button 
              onClick={handleCopyLink}
              className="p-2 bg-gray-50 hover:bg-brand/10 text-gray-500 hover:text-brand rounded-full transition-colors flex items-center justify-center cursor-pointer"
              title="লিংক কপি করুন"
            >
              <Share2 size={18} />
            </button>
          </div>
          <h1 className="product-name text-3xl md:text-5xl font-black mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-6">
            <span className="text-yellow-500 text-lg">{'★'.repeat(Math.floor(product.rating || 5))}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="text-4xl font-extrabold text-gray-900 transition-all">
              ৳ {finalPrice.toLocaleString('bn-BD')}
            </span>
            {finalPrice < finalOriginalPrice && (
              <span className="text-xl text-gray-400 line-through transition-all">৳ {finalOriginalPrice.toLocaleString('bn-BD')}</span>
            )}
            {finalPrice < finalOriginalPrice && (
              <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-bold">
                Save {Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100)}%
              </span>
            )}
          </div>

          <div className="text-gray-600 leading-relaxed mb-6 prose prose-sm sm:prose-base max-w-none text-left" dangerouslySetInnerHTML={{ __html: product.description || "এটি একটি প্রিমিয়াম কোয়ালিটির চমৎকার প্রোডাক্ট। আপনার দৈনন্দিন কাজকে আরও সহজ এবং স্টাইলিশ করে তুলতে এর জুড়ি মেলা ভার। খুব সহজেই ব্যবহারযোগ্য এবং দীর্ঘস্থায়ী।" }}>
          </div>

          {productVariations.length > 0 && (
            <div className="mb-8 space-y-4">
              {productVariations.map((v: any, idx: number) => (
                <div key={idx}>
                  <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                    {v.name} নির্বাচন করুন <span className="text-brand">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {v.options.map((option: string) => {
                      const parsedOpt = parseVariationOption(option);
                      return (
                      <button
                        key={option}
                        onClick={() => setSelectedVariations({...activeVariations, [v.name]: option})}
                        className={`px-5 py-2 rounded-xl border-2 font-bold transition-all flex flex-col items-center ${activeVariations[v.name] === option ? 'border-brand text-brand bg-accent/5 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        <span>{parsedOpt.label}</span>
                        {parsedOpt.priceDiff !== 0 && (
                           <span className="text-[10px] font-normal opacity-80 mt-0.5">
                             {parsedOpt.priceDiff > 0 ? '+' : ''}৳ {parsedOpt.priceDiff.toLocaleString('bn-BD')}
                           </span>
                        )}
                      </button>
                    )})}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-8">
             {!inCart && (
             <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center hover:text-brand">-</button>
                <div className="w-12 text-center font-bold text-lg">{qty}</div>
                <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center hover:text-brand">+</button>
             </div>
             )}
             
             {inCart ? (
               <Link 
                 to="/cart"
                 className="flex-1 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold flex items-center justify-center gap-2 px-6 py-4 shadow-sm transition-all"
               >
                 চেকআউট
               </Link>
             ) : (
               <button 
                 onClick={handleAddToCart}
                 className="flex-1 bg-accent hover:bg-accent-hover text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 px-6 py-4 shadow-sm transition-all"
               >
                  <ShoppingBag size={20} />
                  কার্টে যোগ করুন
               </button>
             )}
             
             <button className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-brand hover:bg-gray-100 transition-colors">
                <Heart size={24} />
             </button>
          </div>
          
          <div className="border-t border-gray-100 pt-6 mt-auto">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div><span className="font-bold text-gray-900">স্টক:</span> {product.stock > 0 ? `${product.stock} টি আছে` : 'স্টক আউট'}</div>
              <div><span className="font-bold text-gray-900">ডেলিভারি:</span> ২-৩ দিন</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mt-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-2xl font-black mb-8 border-b border-gray-100 pb-4">কাস্টমার <span className="text-brand">রিভিউ</span></h2>
        
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-lg mb-4 text-gray-900">আপনার মতামত দিন</h3>
              {user ? (
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">রেটিং</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => setNewReviewRating(star)}
                          className={`text-2xl focus:outline-none ${newReviewRating >= star ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">রিভিউ <span className="text-brand">*</span></label>
                    <textarea 
                      required 
                      value={newReviewText} 
                      onChange={e => setNewReviewText(e.target.value)} 
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all" 
                      placeholder="প্রোডাক্টটি কেমন লেগেছে? আপনার মতামত শেয়ার করুন..." 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="w-full bg-brand text-white py-3 rounded-xl font-bold hover:bg-brand-hover transition-all disabled:opacity-70"
                  >
                    {submittingReview ? 'সাবমিট হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">রিভিউ দিতে লগইন করুন</p>
                  <Link to="/login" className="inline-block bg-brand text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-hover transition-all">লগইন করুন</Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-4xl block mb-2">💬</span>
                <p className="text-gray-500">এখনো কোনো রিভিউ নেই। প্রথম রিভিউ আপনিই দিন!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{review.userName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                        <span className="text-xs text-gray-400">
                          {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mt-2">{review.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
