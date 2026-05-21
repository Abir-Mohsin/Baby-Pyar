import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';

export default function BlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
  });

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      toast.error('ব্লগ পোস্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEdit = (post: any) => {
    setFormData({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      image: post.image || '',
    });
    setEditingId(post.id);
    setIsAdding(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content) {
       toast.error('বিস্তারিত কিছু লিখুন');
       return;
    }
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'blog_posts', editingId), {
          ...formData,
          updatedAt: new Date(),
        });
        toast.success('ব্লগ পোস্ট আপডেট করা হয়েছে');
      } else {
        await addDoc(collection(db, 'blog_posts'), {
          ...formData,
          createdAt: new Date(),
        });
        toast.success('নতুন ব্লগ পোস্ট যোগ করা হয়েছে');
      }
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({ title: '', excerpt: '', content: '', image: '' });
      fetchPosts();
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      toast.error('ব্লগ পোস্ট সেভ করতে সমস্যা হয়েছে');
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('আপনি কি নিশ্চিত যে এই পোস্টটি ডিলিট করতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'blog_posts', id));
      toast.success('ব্লগ পোস্ট ডিলিট করা হয়েছে');
      setPosts(posts.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('ব্লগ পোস্ট ডিলিট করতে সমস্যা হয়েছে');
    }
  };

  if (loading) return <div className="py-20 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">ব্লগ ম্যানেজমেন্ট</h2>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if(isAdding) {
               setEditingId(null);
               setFormData({ title: '', excerpt: '', content: '', image: '' });
            }
          }} 
          className="bg-accent text-gray-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-accent-hover transition-colors"
        >
          {isAdding ? 'বাতিল' : 'নতুন পোস্ট'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 gap-4 flex flex-col">
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">পোস্টের শিরোনাম (Title)</label>
            <input required type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
             <label className="block text-xs text-gray-500 font-medium mb-1">সারসংক্ষেপ (Excerpt) - সর্বোচ্চ ১৫০ অক্ষর</label>
             <textarea maxLength={150} required className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none h-16 focus:ring-1 focus:ring-accent focus:border-brand" value={formData.excerpt} onChange={e=>setFormData({...formData, excerpt: e.target.value})}></textarea>
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">কভার ছবির URL</label>
            <input required type="text" className="w-full bg-white border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-accent focus:border-brand" value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-2">বিস্তারিত (Content)</label>
            <RichTextEditor content={formData.content} onChange={(content) => setFormData({...formData, content})} />
          </div>
          <div className="mt-4">
            <button type="submit" className="bg-brand text-white w-full py-3 rounded-lg font-bold hover:bg-brand-hover transition-colors">
              {editingId ? 'আপডেট করুন' : 'সেভ করুন'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
             <div className="aspect-video bg-gray-100 relative group">
               {post.image ? (
                 <img src={post.image} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">কোনো ছবি নেই</div>
               )}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                 <button onClick={() => handleEdit(post)} className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow">এডিট</button>
                 <button onClick={() => handleDelete(post.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow">ডিলিট</button>
               </div>
             </div>
             <div className="p-4">
               <div className="text-xs text-gray-500 mb-1">
                 {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('bn-BD') : ''}
               </div>
               <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
               <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
             </div>
          </div>
        ))}
      </div>
      {posts.length === 0 && !isAdding && <div className="text-center text-gray-500 py-10">কোনো ব্লগ পোস্ট নেই</div>}
    </div>
  );
}
