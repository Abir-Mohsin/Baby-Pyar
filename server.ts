import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

export function formatImageUrl(url: string) {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  } else if (url.includes('drive.google.com/open?id=')) {
     const match = url.match(/id=([a-zA-Z0-9_-]+)/);
     if (match && match[1]) {
       return `https://drive.google.com/uc?export=view&id=${match[1]}`;
     }
  }
  return url;
}

function escapeHtml(unsafe: string) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

async function getSiteSettings() {
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/baby-pyar/databases/(default)/documents/settings/site_settings`);
    if (res.ok) {
      const data: any = await res.json();
      if (data.fields) {
        return {
          siteTitle: data.fields.siteTitle?.stringValue || 'Baby Pyar - Best Baby Products',
          siteDescription: data.fields.siteDescription?.stringValue || 'Baby Pyar offers the best baby products.',
          ogImage: data.fields.ogImage?.stringValue || ''
        };
      }
    }
  } catch(e) {
    console.error('Error fetching site settings from firestore:', e);
  }
  return {
    siteTitle: 'Baby Pyar - Best Baby Products',
    siteDescription: 'Baby Pyar offers the best baby products.',
    ogImage: ''
  };
}

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

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      // Get all products. In a real app we might want to paginate or cache, but for now we fetch all we can reasonably get.
      let productLinks = '';
      try {
        const firestoreUrl = 'https://firestore.googleapis.com/v1/projects/baby-pyar/databases/(default)/documents/products';
        const fpRes = await fetch(firestoreUrl);
        if (fpRes.ok) {
          const data: any = await fpRes.json();
          if (data.documents) {
            data.documents.forEach((doc: any) => {
              const id = doc.name.split('/').pop();
              productLinks += `
  <url>
    <loc>https://babypyar.com/product/${id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
            });
          }
        }
      } catch (e) {
        console.error('Error fetching products for sitemap:', e);
      }

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://babypyar.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://babypyar.com/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>${productLinks}
  <url>
    <loc>https://babypyar.com/tracking</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://babypyar.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://babypyar.com/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://babypyar.com/return</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
      
      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (e) {
      res.status(500).end();
    }
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
      const urlWithoutQuery = url.split('?')[0];
      const segments = urlWithoutQuery.split('/').filter(Boolean);
      const fullUrl = `https://${req.get('host')}${urlWithoutQuery}`;
      
      const siteSettings = await getSiteSettings();
      let metaTitle = siteSettings.siteTitle;
      let metaDescription = siteSettings.siteDescription;
      let metaImage = siteSettings.ogImage || 'https://lh3.googleusercontent.com/d/1Y9SrxGk62MAgjl4BFrAYePj_ktLklIea';
      let isProduct = false;
      let productPrice = '0';
      
      if (segments[0] === 'product' && segments.length >= 2) {
        const productId = segments[segments.length - 1]; // last segment is the ID
        const product = await getProduct(productId);
        
        if (product) {
          isProduct = true;
          metaTitle = product.name;
          metaDescription = product.description || product.name;
          metaImage = formatImageUrl(product.image) || metaImage;
          productPrice = (product as any).price || '1000';
        }
      }

      const safeName = escapeHtml(metaTitle);
      const safeDesc = escapeHtml(metaDescription);
      const safeImage = escapeHtml(metaImage);

      // Inject meta tags for Facebook and Twitter
      let metaTags = `
        <meta property="og:site_name" content="Baby Pyar" />
        <meta property="og:title" content="${safeName}" />
        <meta property="og:description" content="${safeDesc}" />
        ${safeImage ? `
        <meta property="og:image" content="${safeImage}" />
        <meta property="og:image:secure_url" content="${safeImage}" />
        <meta property="og:image:type" content="image/jpeg" />
        ` : ''}
        <meta property="og:url" content="${fullUrl}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${safeName}" />
        <meta name="twitter:description" content="${safeDesc}" />
        ${safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : ''}
      `;

      if (isProduct) {
         metaTags += `
            <meta property="og:type" content="product" />
            <meta property="product:price:amount" content="${productPrice}" />
            <meta property="product:price:currency" content="BDT" />
            <script type="application/ld+json">
            {
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": "${safeName}",
              "image": [
                "${safeImage}"
              ],
              "description": "${safeDesc}",
              "brand": {
                "@type": "Brand",
                "name": "Baby Pyar"
              },
              "offers": {
                "@type": "Offer",
                "url": "${fullUrl}",
                "priceCurrency": "BDT",
                "price": "${productPrice}",
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/NewCondition"
              }
            }
            </script>
         `;
      } else {
         metaTags += `
            <meta property="og:type" content="website" />
         `;
      }
      
      template = template.replace('</head>', `${metaTags}\n</head>`);
      
      // Update HTML title
      template = template.replace(/<title>(.*?)<\/title>/, `<title>${safeName}</title>`);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
