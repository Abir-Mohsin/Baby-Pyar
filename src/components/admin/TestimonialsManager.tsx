import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { formatImageUrl } from '../../utils/formatImage';

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    text: '',
    image: '',
    rating: 5
  });

  const fetchTestimonials = async () => {
    try {
      const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTestimonials(data || []);
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
      toast.error('রিভিউ লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        image: formatImageUrl(formData.image),
        createdAt: new Date()
      };
      await addDoc(collection(db, 'testimonials'), payload);
      
      toast.success('রিভিউ যোগ করা হয়েছে');
      setIsAdding(false);
      setFormData({ name: '', location: '', text: '', image: '', rating: 5 });
      fetchTestimonials();
    } catch (error: any) {
      console.error('Error creating testimonial:', error);
      toast.error('রিভিউ যোগ করতে সমস্যা হয়েছে');
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('আপনি কি নিশ্চিত?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      toast.success('রিভিউ ডিলিট করা হয়েছে');
      setTestimonials(testimonials.filter(t => t.id !== id));
    } catch (error: any) {
      console.error('Error deleting testimonial:', error);
      toast.error('রিভিউ ডিলিট করতে সমস্যা হয়েছে');
    }
  }

  if (loading) return <div className="py-20 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">কাস্টমার রিভিউ</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-accent text-gray-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-accent-hover transition-colors">
          {isAdding ? 'বাতিল' : 'নতুন রিভিউ'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4" id="testimonial-form">
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">কাস্টমারের নাম</label>
            <input required type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">এলাকা (যেমন: ঢাকা)</label>
            <input required type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">রেটিং (১-৫)</label>
            <input required type="number" min="1" max="5" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.rating} onChange={e=>setFormData({...formData, rating: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">ছবির URL (ঐচ্ছিক)</label>
            <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 font-medium mb-1">মতামত (Review text)</label>
            <textarea required className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none h-20 focus:ring-1 focus:ring-accent focus:border-brand" value={formData.text} onChange={e=>setFormData({...formData, text: e.target.value})}></textarea>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-brand text-white w-full py-2 rounded-lg font-bold hover:bg-brand-hover transition-colors">সেভ করুন</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-xl relative group border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
             <button onClick={() => handleDelete(t.id)} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow">
               ✕
             </button>
             <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 rounded-full bg-accent/5 text-brand flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                 {t.image ? <img src={formatImageUrl(t.image)} className="w-full h-full object-cover" /> : t.name.charAt(0)}
               </div>
               <div>
                 <div className="font-bold text-gray-900">{t.name}</div>
                 <div className="text-xs text-gray-500">{t.location} | {t.rating} ⭐</div>
               </div>
             </div>
             <p className="text-sm text-gray-600 italic">"{t.text}"</p>
          </div>
        ))}
      </div>
      {testimonials.length === 0 && <div className="text-center text-gray-500 py-10">কোনো রিভিউ নেই</div>}
    </div>
  );
}
