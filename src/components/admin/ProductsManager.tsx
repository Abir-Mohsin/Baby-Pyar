import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';

function formatImageUrl(url: string) {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  } else if (url.includes('drive.google.com/open?id=')) {
     const match = url.match(/id=([a-zA-Z0-9_-]+)/);
     if (match && match[1]) {
       return `https://lh3.googleusercontent.com/d/${match[1]}`;
     }
  }
  return url;
}

export default function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    originalPrice: 0,
    description: '',
    badge: '',
    image: '',
    gallery: [] as string[],
    stock: 10,
    variationType: 'none',
    availableVariations: ''
  });

  const [galleryText, setGalleryText] = useState('');

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('প্রোডাক্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const gallery = galleryText.split(',').map(url => formatImageUrl(url.trim())).filter(url => url !== '');
    const variationArr = formData.availableVariations.split(',').map(v => v.trim()).filter(v => v !== '');
    const formattedMainImage = formatImageUrl(formData.image.trim());
    
    const productPayload: any = {
      name: formData.name,
      category: formData.category,
      price: formData.price,
      originalPrice: formData.originalPrice,
      description: formData.description,
      badge: formData.badge,
      image: formattedMainImage,
      gallery: gallery || [],
      stock: formData.stock,
      variationType: formData.variationType,
      availableVariations: variationArr,
      updatedAt: new Date()
    };

    try {
      if (editingId) {
        const productRef = doc(db, 'products', editingId);
        await updateDoc(productRef, productPayload);
        toast.success('প্রোডাক্ট আপডেট করা হয়েছে');
      } else {
        productPayload.createdAt = new Date();
        await addDoc(collection(db, 'products'), productPayload);
        toast.success('প্রোডাক্ট যোগ করা হয়েছে');
      }
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', category: '', price: 0, originalPrice: 0, description: '', badge: '', image: '', gallery: [], stock: 10, variationType: 'none', availableVariations: '' });
      setGalleryText('');
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(editingId ? 'প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে' : 'প্রোডাক্ট যোগ করতে সমস্যা হয়েছে');
    }
  };

  const startEditing = (p: any) => {
    setEditingId(p.id);
    setIsAdding(true);
    setFormData({
      name: p.name || '',
      category: p.category || '',
      price: p.price || 0,
      originalPrice: p.originalPrice || 0,
      description: p.description || '',
      badge: p.badge || '',
      image: p.image || '',
      gallery: p.gallery || [],
      stock: p.stock ?? 10,
      variationType: p.variationType || 'none',
      availableVariations: Array.isArray(p.availableVariations) ? p.availableVariations.join(', ') : ''
    });
    setGalleryText(Array.isArray(p.gallery) ? p.gallery.join(', ') : '');
    // scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', category: '', price: 0, originalPrice: 0, description: '', badge: '', image: '', gallery: [], stock: 10, variationType: 'none', availableVariations: '' });
    setGalleryText('');
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('আপনি কি নিশ্চিত?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('প্রোডাক্ট ডিলিট করা হয়েছে');
      setProducts(products.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('প্রোডাক্ট ডিলিট করতে সমস্যা হয়েছে');
    }
  }

  if (loading) return <div className="py-20 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">সকল প্রোডাক্ট</h2>
        <button onClick={() => isAdding ? handleCancel() : setIsAdding(true)} className="bg-accent text-gray-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-accent-hover transition-colors">
          {isAdding ? 'বাতিল' : 'নতুন প্রোডাক্ট'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateOrUpdate} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4" id="product-form">
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">নাম</label>
            <input required type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">ক্যাটাগরি</label>
            <input required type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">মূল্য</label>
            <input required type="number" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.price} onChange={e=>setFormData({...formData, price: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">আগের মূল্য</label>
            <input required type="number" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.originalPrice} onChange={e=>setFormData({...formData, originalPrice: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">ব্যাজ (ঐচ্ছিক - যেমন: NEW)</label>
            <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.badge} onChange={e=>setFormData({...formData, badge: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">স্টক</label>
            <input required type="number" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.stock} onChange={e=>setFormData({...formData, stock: Number(e.target.value)})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 font-medium mb-1">ভেরিয়েশনের ধরন</label>
            <select className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.variationType} onChange={e=>setFormData({...formData, variationType: e.target.value})}>
              <option value="none">কোনো ভেরিয়েশন নেই</option>
              <option value="size">সাইজ (Size)</option>
              <option value="age">বয়স (Age)</option>
            </select>
          </div>
          {formData.variationType !== 'none' && (
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 font-medium mb-1">
                {formData.variationType === 'size' ? 'লভ্য সাইজসমূহ (কমা দিয়ে আলাদা করুন)' : 'লভ্য বয়সসমূহ (কমা দিয়ে আলাদা করুন)'}
              </label>
              <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" placeholder={formData.variationType === 'size' ? 'S, M, L, XL' : '1-2 Y, 2-3 Y, 3-4 Y'} value={formData.availableVariations} onChange={e=>setFormData({...formData, availableVariations: e.target.value})} />
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 font-medium mb-1">ছবির URL</label>
            <input required type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 font-medium mb-1">গ্যালারি ছবির URL সমূহ (কমা দিয়ে আলাদা করুন)</label>
            <textarea className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand h-16 text-sm" placeholder="URL1, URL2, URL3..." value={galleryText} onChange={e=>setGalleryText(e.target.value)}></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 font-medium mb-1">বিবরণ</label>
            <RichTextEditor content={formData.description} onChange={(c) => setFormData({...formData, description: c})} placeholder="প্রোডাক্টের বিবরণ লিখুন..." />
          </div>
          <div className="md:col-span-2 flex gap-4">
            <button type="submit" className="bg-brand text-white flex-1 py-2 rounded-lg font-bold hover:bg-brand-hover transition-colors">
              {editingId ? 'আপডেট করুন' : 'সেভ করুন'}
            </button>
            <button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors">
              বাতিল
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl relative group border border-gray-200 shadow-sm hover:border-brand/30 hover:shadow-md transition-all">
             <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => startEditing(p)} className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-blue-600 transition-colors" title="এডিট করুন">
                 ✎
               </button>
               <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors" title="ডিলিট করুন">
                 ✕
               </button>
             </div>
             <img src={p.image} className="w-full aspect-square object-cover rounded-lg mb-3 bg-gray-50" />
             <div className="font-bold truncate text-gray-900" title={p.name}>{p.name}</div>
             <div className="flex items-center gap-2 mb-1">
               <span className="text-brand font-bold">৳{p.price}</span>
               {p.originalPrice > 0 && (
                 <span className="text-gray-400 line-through text-xs">৳{p.originalPrice}</span>
               )}
             </div>
             <div className="text-xs text-gray-500">স্টক: {p.stock} | {p.category}</div>
          </div>
        ))}
      </div>
      {products.length === 0 && <div className="text-center text-gray-500 py-10">কোনো প্রোডাক্ট নেই</div>}
    </div>
  );
}
