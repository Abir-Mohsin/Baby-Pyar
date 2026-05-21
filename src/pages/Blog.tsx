import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
     return <div className="py-20 text-center">লোড হচ্ছে...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 md:py-20">
      <SEO 
        title="ব্লগ | Baby Pyar - প্যারেন্টিং ও বাচ্চাদের টিপস"
        description="Baby Pyar ব্লগে পড়ুন প্যারেন্টিং, বাচ্চাদের যত্ন, সঠিক পোশাক নির্বাচন এবং আরও অনেক প্রয়োজনীয় টিপস ও গাইডলাইন।"
      />
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black mb-4">আমাদের ব্লগ</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            প্যারেন্টিং এবং বাচ্চাদের যত্নের বিভিন্ন বিষয়ে আমাদের নতুন সব তথ্য ও আর্টিকেল। 
          </p>
        </div>

        {posts.length === 0 ? (
           <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
             এখনো কোনো ব্লগ পোস্ট যোগ করা হয়নি।
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <Link to={`/blog/${post.id}`} key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">কোনো ছবি নেই</div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-sm text-gray-500 mb-3">
                    {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric'}) : ''}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="text-brand font-semibold group-hover:text-black transition-colors cursor-pointer mt-auto">
                    আরও পড়ুন →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
