
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  const [content, setContent] = useState('এখানে আপনার প্রাইভেসি পলিসি লিখুন...');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchPolicy = async () => {
      try {
        const docRef = doc(db, 'settings', 'pages');
        const docSnap = await getDoc(docRef);

        if (!isMounted) return;
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.data && data.data.privacyPolicy) {
            setContent(data.data.privacyPolicy);
          }
        }
      } catch (error: any) {
        console.error('Error fetching privacy policy:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPolicy();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="py-16 px-4 bg-white min-h-screen text-gray-900">
      <SEO title="Privacy Policy" url="https://babypyar.com/privacy" />
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex flex-row gap-2 items-center text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} /> <span>ফিরে যান</span>
        </button>
        <h1 className="text-4xl font-black mb-8">প্রাইভেসি পলিসি</h1>
        {loading ? (
          <div className="py-20 text-center text-gray-500">লোড হচ্ছে...</div>
        ) : (
          <div className="prose prose-sm sm:prose-base max-w-none text-left" dangerouslySetInnerHTML={{ __html: content }}>
          </div>
        )}
      </div>
    </div>
  );
}
