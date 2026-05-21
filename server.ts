import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

export function formatImageUrl(url: string) {
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

const DUMMY_PRODUCTS = [
  {
    id: 'p1',
    name: 'প্রিমিয়াম কটন টি-শার্ট',
    description: '১০০% কটন প্রিমিয়াম টি-শার্ট। সব ঋতুর জন্য আরামদায়ক।',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'p2',
    name: 'স্টাইলিশ সানগ্লাস',
    description: 'আধুনিক ডিজাইনের পোলারাইজড সানগ্লাস।',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'p3',
    name: 'লেদার ওয়ালেট',
    description: 'খাঁটি চামড়ার তৈরি টেকসই ওয়ালেট।',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'p4',
    name: 'স্মার্ট ওয়াচ প্রো',
    description: 'স্মার্ট ফিচার সহ প্রিমিয়াম স্মার্ট ওয়াচ।',
    image: 'https://images.unsplash.com/photo-1544117518-30dd5f2f30be?auto=format&fit=crop&q=80&w=800',
  }
];

async function getProduct(id: string) {
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/baby-pyar/databases/(default)/documents/products/${id}`);
    if (res.ok) {
      const data: any = await res.json();
      if (data.fields) {
        return {
          id: id,
          name: data.fields.name?.stringValue || '',
          description: data.fields.description?.stringValue || '',
          image: data.fields.image?.stringValue || ''
        };
      }
    }
  } catch(e) {
    console.error('Error fetching product from firestore:', e);
  }
  return DUMMY_PRODUCTS.find(p => p.id === id) || null;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  let vite: any;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false })); // Disable default index mapping
  }

  // Intercept all routes to serve index.html with potentially injected meta tags
  app.get('*all', async (req, res) => {
    try {
      const url = req.originalUrl;
      
      let template = '';
      if (!isProd) {
        template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        template = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf-8');
      }

      // Check if it's a product page request
      const productMatch = url.match(/\/product\/([^\/?]+)/);
      if (productMatch && productMatch[1]) {
        const productId = productMatch[1];
        const product = await getProduct(productId);
        
        if (product) {
          const imageUrl = formatImageUrl(product.image);
          // Inject meta tags
          const metaTags = `
            <meta property="og:title" content="${product.name}" />
            <meta property="og:description" content="${product.description}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:url" content="https://babypyar.com/product/${product.id}" />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:title" content="${product.name}" />
            <meta property="twitter:description" content="${product.description}" />
            <meta property="twitter:image" content="${imageUrl}" />
          `;
          
          template = template.replace('</head>', `${metaTags}</head>`);
        }
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
