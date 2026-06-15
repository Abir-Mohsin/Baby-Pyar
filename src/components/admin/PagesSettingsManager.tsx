import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';

export default function PagesSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    privacyPolicy: 'এখানে আপনার প্রাইভেসি পলিসি লিখুন...',
    returnPolicy: 'এখানে আপনার রিটার্ন পলিসি লিখুন...',
    contactInfo: 'এখানে আপনার যোগাযোগ তথ্য লিখুন...'
  });

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'pages');
        const docSnap = await getDoc(docRef);

        if (!isMounted) return;
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.data) {
            setFormData(prev => ({
              ...prev,
              ...data.data
            }));
          }
        }
      } catch (error: any) {
        console.error('Error fetching pages settings:', error);
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
      await setDoc(doc(db, 'settings', 'pages'), { data: formData }, { merge: true });
      toast.success('পেইজ সেটিং সেভ হয়েছে!');
    } catch (error: any) {
      console.error('Error saving pages settings:', error);
      toast.error('সেটিং সেভ করতে সমস্যা হয়েছে');
    }
  };

  if (loading) return <div className="py-20 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-gray-900">
      <h2 className="text-xl font-bold mb-6 text-gray-900">পেইজ কাস্টমাইজেশন</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 font-bold mb-2">প্রাইভেসি পলিসি</label>
              <RichTextEditor 
                content={formData.privacyPolicy} 
                onChange={(c) => setFormData({...formData, privacyPolicy: c})}
                placeholder="প্রাইভেসি পলিসি লিখুন..."
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 font-bold mb-2">রিটার্ন পলিসি</label>
              <RichTextEditor 
                content={formData.returnPolicy} 
                onChange={(c) => setFormData({...formData, returnPolicy: c})}
                placeholder="রিটার্ন পলিসি লিখুন..."
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 font-bold mb-2">যোগাযোগ</label>
              <RichTextEditor 
                content={formData.contactInfo} 
                onChange={(c) => setFormData({...formData, contactInfo: c})}
                placeholder="যোগাযোগ তথ্য লিখুন..."
              />
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
