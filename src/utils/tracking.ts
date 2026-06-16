export const trackPixelEvent = (eventName: string, data: any = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, data);
  }

  // Also send event to our server for CAPI processing
  if (typeof window !== 'undefined') {
    fetch('/api/capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventName,
        data,
        sourceUrl: window.location.href
      })
    }).catch(err => {
       console.error("CAPI error:", err);
    });
  }
};
