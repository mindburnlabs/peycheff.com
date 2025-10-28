// Advanced analytics utilities for tracking events across the application

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: number
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  referrer?: string
  utm?: Record<string, string>
}

// Generate unique session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get or create session ID from localStorage
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = localStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Get UTM parameters from URL
export function getUTMParameters(): Record<string, string> {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  const utm: Record<string, string> = {}

  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  utmParams.forEach(param => {
    const value = params.get(param)
    if (value) {
      utm[param.replace('utm_', '')] = value
    }
  })

  return utm
}

// Track event to our API endpoint
export async function trackEvent(eventData: {
  event: string
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
  url?: string
}): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false

    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...eventData,
        sessionId: eventData.sessionId || getSessionId(),
        url: eventData.url || window.location.href,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        utm: getUTMParameters(),
        timestamp: new Date().toISOString(),
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return false
  }
}

// Google Analytics 4 integration
export function initGA4(measurementId: string) {
  if (typeof window === 'undefined') return

  // Load gtag script
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  script.async = true
  document.head.appendChild(script)

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  window.gtag = function(...args: any[]) {
    window.dataLayer?.push(arguments)
  }

  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: false, // We'll track page views manually
  })
}

// Track page view in GA4
export function trackPageViewGA4(url?: string) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'page_view', {
    page_location: url || window.location.href,
    page_title: document.title,
  })
}

// Track custom event in GA4
export function trackEventGA4(eventName: string, parameters?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', eventName, parameters)
}

// Meta Pixel (Facebook) integration
export function initMetaPixel(pixelId: string) {
  if (typeof window === 'undefined') return

  // Load Facebook Pixel script
  const script = document.createElement('script')
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `
  document.head.appendChild(script)

  // Add noscript fallback
  const noscript = document.createElement('noscript')
  noscript.innerHTML = `
    <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
  `
  document.head.appendChild(noscript)
}

// Track Meta Pixel event
export function trackMetaPixel(eventName: string, parameters?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.fbq) return

  window.fbq('trackCustom', eventName, parameters)
}

class Analytics {
  private isDev = process.env.NODE_ENV === 'development'

  // Track to our API + external services
  async track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      utm: getUTMParameters(),
    }

    if (this.isDev) {
      console.log('Analytics Event:', analyticsEvent)
    }

    // Track to our API
    await trackEvent(analyticsEvent)

    // Track to GA4
    trackEventGA4(event, properties)

    // Track to Meta Pixel
    trackMetaPixel(event, properties)
  }

  // E-commerce specific tracking
  async trackProductView(productId: string, productName: string, price: number) {
    await this.track('product_viewed', {
      product_id: productId,
      product_name: productName,
      price,
      currency: 'USD'
    })
  }

  async trackAddToCart(productId: string, productName: string, price: number, quantity: number = 1) {
    await this.track('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      currency: 'USD',
      value: price * quantity
    })
  }

  async trackPurchase(orderId: string, products: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>, total: number) {
    await this.track('purchase_completed', {
      order_id: orderId,
      products,
      total_amount: total,
      currency: 'USD'
    })
  }

  async trackPageView(page: string, title?: string) {
    await this.track('page_view', {
      page,
      title: title || page,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      search: typeof window !== 'undefined' ? window.location.search : '',
      url: typeof window !== 'undefined' ? window.location.href : ''
    })
  }

  async trackFormSubmission(formName: string, success: boolean, additionalData?: Record<string, any>) {
    await this.track('form_submission', {
      form_name: formName,
      success,
      ...additionalData
    })
  }

  async trackButtonClick(buttonText: string, buttonLocation: string, additionalData?: Record<string, any>) {
    await this.track('button_click', {
      button_text: buttonText,
      button_location: buttonLocation,
      ...additionalData
    })
  }

  async trackDownload(fileName: string, fileType: string) {
    await this.track('download', {
      file_name: fileName,
      file_type: fileType
    })
  }

  async trackContactForm(data: { name: string; email: string; company?: string }) {
    await this.track('contact_form_submitted', {
      form_type: 'contact',
      has_company: !!data.company,
    })
  }

  async trackNewsletterSignup(email: string) {
    await this.track('newsletter_signup', {
      signup_source: 'website',
    })
  }
}

export const analytics = new Analytics()

// E-commerce event tracking shortcuts
export const ecommerceEvents = {
  productView: analytics.trackProductView.bind(analytics),
  addToCart: analytics.trackAddToCart.bind(analytics),
  purchase: analytics.trackPurchase.bind(analytics),
  contactForm: analytics.trackContactForm.bind(analytics),
  newsletterSignup: analytics.trackNewsletterSignup.bind(analytics),
  pageView: analytics.trackPageView.bind(analytics),
}

// Initialize analytics on client side
export function initializeAnalytics() {
  if (typeof window === 'undefined') return

  // Initialize GA4 if measurement ID is available
  const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  if (ga4MeasurementId) {
    initGA4(ga4MeasurementId)
  }

  // Initialize Meta Pixel if pixel ID is available
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (metaPixelId) {
    initMetaPixel(metaPixelId)
  }

  // Track initial page view
  analytics.trackPageView(
    window.location.pathname,
    document.title
  )
}

// Hook for React components to use analytics
export function useAnalytics() {
  if (typeof window === 'undefined') {
    return {
      track: () => Promise.resolve(),
      trackProductView: () => Promise.resolve(),
      trackAddToCart: () => Promise.resolve(),
      trackPurchase: () => Promise.resolve(),
      trackPageView: () => Promise.resolve(),
      trackFormSubmission: () => Promise.resolve(),
      trackButtonClick: () => Promise.resolve(),
      trackDownload: () => Promise.resolve(),
      trackContactForm: () => Promise.resolve(),
      trackNewsletterSignup: () => Promise.resolve(),
      ecommerceEvents,
    }
  }

  return {
    track: analytics.track.bind(analytics),
    trackProductView: analytics.trackProductView.bind(analytics),
    trackAddToCart: analytics.trackAddToCart.bind(analytics),
    trackPurchase: analytics.trackPurchase.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackButtonClick: analytics.trackButtonClick.bind(analytics),
    trackDownload: analytics.trackDownload.bind(analytics),
    trackContactForm: analytics.trackContactForm.bind(analytics),
    trackNewsletterSignup: analytics.trackNewsletterSignup.bind(analytics),
    ecommerceEvents,
  }
}