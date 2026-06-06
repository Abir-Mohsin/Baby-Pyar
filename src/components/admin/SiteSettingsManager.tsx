import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function SiteSettingsManager() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    pixelId: '',
    siteTitle: 'Baby Pyar - Best Baby Products',
    siteDescription: 'Baby Pyar offers the best baby products.',
    ogImage: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'site_settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data() as any);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await setDoc(doc(db, 'settings', 'site_settings'), formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error saving settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">সাইট সেটিং ও SEO</h2>
      
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 font-bold">
          সেটিং সফলভাবে আপডেট হয়েছে!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-brand">Tracking & Analytics</h3>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Meta Pixel ID
            </label>
            <input
              type="text"
              value={formData.pixelId}
              onChange={e => setFormData({...formData, pixelId: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-accent/20 focus:border-brand transition-all"
              placeholder="e.g. 123456789012345"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to disable Meta Pixel tracking.</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
          <h3 className="font-bold text-lg mb-2 text-brand">SEO Settings (Global)</h3>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Default Site Title
            </label>
            <input
              type="text"
              value={formData.siteTitle}
              onChange={e => setFormData({...formData, siteTitle: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-accent/20 focus:border-brand transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Default Site Description
            </label>
            <textarea
              value={formData.siteDescription}
              onChange={e => setFormData({...formData, siteDescription: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 min-h-[100px] focus:ring-2 focus:ring-accent/20 focus:border-brand transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Default OG Image URL (For Facebook/Social Share)
            </label>
            <input
              type="url"
              value={formData.ogImage}
              onChange={e => setFormData({...formData, ogImage: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-accent/20 focus:border-brand transition-all"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand/90 transition-all disabled:opacity-50"
        >
          {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'সেভ করুন'}
        </button>
      </form>
    </div>
  );
}
