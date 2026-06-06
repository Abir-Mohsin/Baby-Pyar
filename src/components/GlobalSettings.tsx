import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export default function GlobalSettings() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site_settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings?.pixelId) {
      // Inject Meta Pixel
      const pixelId = settings.pixelId;
      if (!window.fbq) {
        !function(f:any,b:any,e:any,v:any,n?:any,t?:any,s?:any)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
      }
    }
  }, [settings]);

  if (!settings) return null;

  return (
    <Helmet>
      {(settings.siteTitle) && <title>{settings.siteTitle}</title>}
      {(settings.siteDescription) && <meta name="description" content={settings.siteDescription} />}
      {(settings.siteTitle) && <meta property="og:title" content={settings.siteTitle} />}
      {(settings.siteDescription) && <meta property="og:description" content={settings.siteDescription} />}
      {(settings.ogImage) && <meta property="og:image" content={settings.ogImage} />}
    </Helmet>
  );
}
