import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function HomeSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    heroTitle: 'Baby Pyar এ স্বাগতম আপনাকে! 🎉',
    heroSubtitle: 'প্রিমিয়াম কোয়ালিটির প্রোডাক্ট সবচেয়ে সাশ্রয়ী মূল্যে। বিকাশে পেমেন্ট করলে পাচ্ছেন ১০% এক্সট্রা ডিসকাউন্ট! সারা বাংলাদেশে দ্রুত ডেলিভারি।',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    stats: {
      customers: '5000+',
      districts: '64+',
      rating: '4.9/5'
    },
    promoCards: [
      { image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', link: '/shop' },
      { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', link: '/shop' }
    ]
  });

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'home');
        const docSnap = await getDoc(docRef);

        if (!isMounted) return;
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.data) {
            setFormData((prev: any) => ({
              ...prev,
              ...data.data,
              stats: { ...prev.stats, ...(data.data.stats || {}) }
            }));
          }
        }
      } catch (error: any) {
        console.error('Error fetching settings:', error);
        if (isMounted) toast.error('সেটিং লোড করতে সমস্যা হয়েছে');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSettings();
    return () => { isMounted = false; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'home'), { data: formData }, { merge: true });
      toast.success('হোমপেজ সেটিং সেভ হয়েছে!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('সেটিং সেভ করতে সমস্যা হয়েছে');
    }
  };

  const updatePromo = (index: number, field: string, value: string) => {
    const newCards = [...formData.promoCards];
    newCards[index] = { ...newCards[index], [field]: value };
    setFormData({ ...formData, promoCards: newCards });
  };

  if (loading) return <div className="py-20 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-gray-900">
      <h2 className="text-xl font-bold mb-6 text-gray-900">হোমপেজ কাস্টমাইজেশন</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <h3 className="font-bold border-b border-gray-200 pb-2 text-gray-900">হিরো সেকশন</h3>
            <div>
              <label className="block text-xs text-gray-500 font-medium mb-1">শিরোনাম (Title)</label>
              <input type="text" className="w-full bg-white p-2 rounded-lg outline-none border border-gray-300 focus:ring-1 focus:ring-accent focus:border-accent" value={formData.heroTitle} onChange={e=>setFormData({...formData, heroTitle: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-medium mb-1">সাব-টাইটেল (Subtitle)</label>
              <textarea className="w-full bg-white p-2 rounded-lg outline-none h-20 border border-gray-300 focus:ring-1 focus:ring-accent focus:border-accent" value={formData.heroSubtitle} onChange={e=>setFormData({...formData, heroSubtitle: e.target.value})}></textarea>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <h3 className="font-bold border-b border-gray-200 pb-2 text-gray-900">ভিডিও সেকশন</h3>
            <div>
              <label className="block text-xs text-gray-500 font-medium mb-1">ইউটিউব এমবেড URL (YouTube Embed Link)</label>
              <input type="text" className="w-full bg-white p-2 rounded-lg outline-none border border-gray-300 focus:ring-1 focus:ring-accent focus:border-accent" value={formData.videoUrl} onChange={e=>setFormData({...formData, videoUrl: e.target.value})} />
              <div className="text-xs text-gray-500 mt-1">উদাহরণ: https://www.youtube.com/embed/abc123XYZ</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <h3 className="font-bold border-b border-gray-200 pb-2 text-gray-900">পরিসংখ্যান (Stats)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">কাস্টমার</label>
                <input type="text" className="w-full bg-white p-2 rounded-lg outline-none border border-gray-300 focus:ring-1 focus:ring-accent focus:border-accent" value={formData.stats.customers} onChange={e=>setFormData({...formData, stats: {...formData.stats, customers: e.target.value}})} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">জেলা</label>
                <input type="text" className="w-full bg-white p-2 rounded-lg outline-none border border-gray-300 focus:ring-1 focus:ring-accent focus:border-accent" value={formData.stats.districts} onChange={e=>setFormData({...formData, stats: {...formData.stats, districts: e.target.value}})} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">রেটিং</label>
                <input type="text" className="w-full bg-white p-2 rounded-lg outline-none border border-gray-300 focus:ring-1 focus:ring-accent focus:border-accent" value={formData.stats.rating} onChange={e=>setFormData({...formData, stats: {...formData.stats, rating: e.target.value}})} />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <h3 className="font-bold border-b border-gray-200 pb-2 text-gray-900">প্রোমো কার্ড (Ads)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.promoCards.map((card, i) => (
                <div key={i} className="space-y-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="font-bold text-sm text-gray-900">কার্ড {i+1}</div>
                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-1">ছবির URL</label>
                    <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none text-sm focus:ring-1 focus:ring-accent focus:border-accent" value={card.image} onChange={e=>updatePromo(i, 'image', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-1">লিংক</label>
                    <input type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none text-sm focus:ring-1 focus:ring-accent focus:border-accent" value={card.link} onChange={e=>updatePromo(i, 'link', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="bg-brand text-white w-full py-3 rounded-full font-bold text-lg hover:bg-brand-hover hover:shadow-lg transition-all">
          সেভ করুন
        </button>
      </form>
    </div>
  );
}
