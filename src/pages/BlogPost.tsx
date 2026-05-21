import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import SEO from '../components/SEO';
import { ArrowLeft } from 'lucide-react';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'blog_posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center">লোড হচ্ছে...</div>;
  }

  if (!post) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p className="mb-4">পোস্টটি পাওয়া যায়নি</p>
        <Link to="/blog" className="text-brand font-bold">ব্লগে ফিরে যান</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title={`${post.title} | Baby Pyar`}
        description={post.excerpt}
        image={post.image}
      />
      
      {/* Hero Header */}
      <div className="bg-gray-50 py-12 md:py-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/blog" className="inline-flex items-center gap-2 text-brand hover:text-brand-hover font-medium mb-6 transition-colors">
            <ArrowLeft size={18} />
            ব্লগে ফিরে যান
          </Link>
          
          <div className="text-sm text-gray-500 mb-4">
            {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric'}) : ''}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          {post.image && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-sm mt-8">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
           {/* Add prose classes for rich text */}
           <div 
             className="prose prose-lg md:prose-xl prose-img:rounded-xl prose-a:text-brand max-w-none text-gray-800"
             dangerouslySetInnerHTML={{ __html: post.content }}
           />
        </div>
      </div>
    </div>
  );
}
