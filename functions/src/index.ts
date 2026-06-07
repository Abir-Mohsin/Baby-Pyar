import * as functions from 'firebase-functions';
import express from 'express';
import path from 'path';
import fs from 'fs';

// Initialize the Express app
const app = express();

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
  } else if (url.includes('drive.google.com/uc')) {
     const match = url.match(/id=([a-zA-Z0-9_-]+)/);
     if (match && match[1]) {
       return `https://lh3.googleusercontent.com/d/${match[1]}`;
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
    console.error('Error fetching site settings:', e);
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
          image: data.fields.image?.stringValue || '',
          price: data.fields.price?.integerValue || data.fields.price?.doubleValue || '0'
        };
      }
    }
  } catch(e) {
    console.error('Error fetching product:', e);
  }
  return null;
}

// In Firebase functions, process.cwd() is the 'functions' directory.
// We'll read index.html from a specific path since we will copy the built 'dist' there.
app.get('/(*)', async (req, res) => {
  try {
    const url = req.originalUrl;
    
    // We will copy dist/index.html to functions/index.html during deployment
    const indexPath = path.join(process.cwd(), 'index.html');
    if (!fs.existsSync(indexPath)) {
      res.status(500).send('index.html not found. Please build the frontend and copy dist/index.html to the functions directory.');
      return;
    }
    
    let template = fs.readFileSync(indexPath, 'utf-8');

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
        // Basic plain text conversion for HTML descriptions from the WYSIWYG editor
        metaDescription = product.description.replace(/<[^>]*>?/gm, '') || product.name;
        metaImage = formatImageUrl(product.image) || metaImage;
        productPrice = product.price || '1000';
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
    console.error(e);
    res.status(500).end('Server error');
  }
});

export const ssr = functions.https.onRequest(app);
