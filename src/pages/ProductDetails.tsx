import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { DUMMY_PRODUCTS } from './Home';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);

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
    fetchProduct();
  }, [id]);

  if (loading) return <div className="py-20 text-center text-gray-500">লোড হচ্ছে...</div>;
  if (!product) return <div className="py-20 text-center text-gray-500">প্রোডাক্ট পাওয়া যায়নি।</div>;

  const original = product.originalPrice || product.price;
  const inCart = selectedVariation 
    ? cart.some(item => item.id === product.id && item.variation === selectedVariation)
    : cart.some(item => item.id === product.id && !item.variation);

  const handleAddToCart = () => {
    if (product.variationType && product.variationType !== 'none' && !selectedVariation) {
      toast.error(`অনুগ্রহ করে ${product.variationType === 'size' ? 'সাইজ' : 'বয়স'} নির্বাচন করুন`);
      return;
    }
    addToCart({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image,
      variation: selectedVariation || undefined
    }, qty);
  };

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto min-h-screen text-gray-900">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-gray-50 flex flex-col">
          <div className="relative aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition-all duration-500" />
            {product.badge && <span className="absolute top-6 left-6 bg-white/90 backdrop-blur text-brand px-3 py-1 rounded-full text-xs font-bold z-10 shadow-sm">{product.badge}</span>}
          </div>
          
          {(product.gallery && product.gallery.length > 0) && (
            <div className="p-4 flex gap-3 overflow-x-auto bg-white border-t border-gray-100">
              <button 
                onClick={() => setActiveImage(product.image)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === product.image ? 'border-brand' : 'border-transparent'}`}
              >
                <img src={product.image} className="w-full h-full object-cover" />
              </button>
              {product.gallery.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === img ? 'border-brand' : 'border-transparent'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="product-category text-brand font-bold uppercase tracking-widest text-xs mb-3">{product.category}</div>
          <h1 className="product-name text-3xl md:text-5xl font-black mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-6">
            <span className="text-yellow-500 text-lg">{'★'.repeat(Math.floor(product.rating || 5))}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="text-4xl font-extrabold text-gray-900">
              ৳ {product.price.toLocaleString('bn-BD')}
            </span>
            {product.price < original && (
              <span className="text-xl text-gray-400 line-through">৳ {original.toLocaleString('bn-BD')}</span>
            )}
          </div>

          <div className="text-gray-600 leading-relaxed mb-6 prose prose-sm sm:prose-base max-w-none text-left" dangerouslySetInnerHTML={{ __html: product.description || "এটি একটি প্রিমিয়াম কোয়ালিটির চমৎকার প্রোডাক্ট। আপনার দৈনন্দিন কাজকে আরও সহজ এবং স্টাইলিশ করে তুলতে এর জুড়ি মেলা ভার। খুব সহজেই ব্যবহারযোগ্য এবং দীর্ঘস্থায়ী।" }}>
          </div>

          {product.variationType && product.variationType !== 'none' && product.availableVariations?.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                {product.variationType === 'size' ? 'সাইজ' : 'বয়স'} নির্বাচন করুন <span className="text-brand">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {product.availableVariations.map((variation: string) => (
                  <button
                    key={variation}
                    onClick={() => setSelectedVariation(variation)}
                    className={`px-5 py-2 rounded-xl border-2 font-bold transition-all ${selectedVariation === variation ? 'border-brand text-brand bg-accent/5' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    {variation}
                  </button>
                ))}
              </div>
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
    </div>
  );
}
