// Prefetch utilities for likely assets and routes

/**
 * Prefetch a route's JavaScript bundle
 * @param {string} routePath - The route path to prefetch
 */
export const prefetchRoute = (routePath) => {
  if (typeof window === 'undefined') return;
  
  try {
    // For Vite, we can prefetch the route's chunk
    const routeMap = {
      '/': () => import('../pages/Home'),
      '/about': () => import('../pages/About'),
      '/work': () => import('../pages/Work'),
      '/notes': () => import('../pages/Notes'),
      '/advisory': () => import('../pages/Advisory'),
      '/contact': () => import('../pages/Contact'),
      '/products': () => import('../pages/Products'),
      '/utilities': () => import('../pages/Utilities'),
      '/schedule': () => import('../pages/ScheduleDemo'),
      '/admin/metrics': () => import('../pages/AdminMetrics'),
      '/admin/control': () => import('../pages/ControlCenter')
    };

    const prefetchFn = routeMap[routePath];
    if (prefetchFn) {
      prefetchFn().catch(console.warn);
    }
  } catch (error) {
    console.warn('Failed to prefetch route:', routePath, error);
  }
};

/**
 * Prefetch a component's JavaScript bundle
 * @param {Function} componentImport - The component import function
 */
export const prefetchComponent = (componentImport) => {
  if (typeof window === 'undefined') return;
  
  try {
    componentImport().catch(console.warn);
  } catch (error) {
    console.warn('Failed to prefetch component:', error);
  }
};

/**
 * Prefetch critical images
 * @param {string[]} imageUrls - Array of image URLs to prefetch
 */
export const prefetchImages = (imageUrls) => {
  if (typeof window === 'undefined') return;
  
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

/**
 * Prefetch critical fonts
 * @param {string[]} fontUrls - Array of font URLs to prefetch
 */
export const prefetchFonts = (fontUrls) => {
  if (typeof window === 'undefined') return;
  
  fontUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'font';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Prefetch critical API endpoints
 * @param {string[]} apiUrls - Array of API URLs to prefetch
 */
export const prefetchAPIs = (apiUrls) => {
  if (typeof window === 'undefined') return;
  
  apiUrls.forEach(url => {
    fetch(url, { 
      method: 'HEAD',
      mode: 'cors'
    }).catch(() => {
      // Silently fail - this is just a prefetch
    });
  });
};

/**
 * Smart prefetch based on user behavior
 * @param {string} currentPath - Current page path
 */
export const smartPrefetch = (currentPath) => {
  if (typeof window === 'undefined') return;
  
  // Define likely next pages based on current path
  const likelyNextPages = {
    '/': ['/about', '/work', '/products'],
    '/about': ['/work', '/advisory'],
    '/work': ['/advisory', '/contact'],
    '/notes': ['/about', '/work'],
    '/advisory': ['/contact', '/products'],
    '/products': ['/utilities', '/schedule'],
    '/contact': ['/advisory', '/products']
  };

  const nextPages = likelyNextPages[currentPath] || [];
  
  // Prefetch likely next pages after a delay
  setTimeout(() => {
    nextPages.forEach(route => prefetchRoute(route));
  }, 2000);
};

/**
 * Prefetch on hover for better UX
 * @param {HTMLElement} element - The element to add hover prefetch to
 * @param {string} routePath - The route to prefetch on hover
 */
export const addHoverPrefetch = (element, routePath) => {
  if (typeof window === 'undefined' || !element) return;
  
  let prefetched = false;
  
  const handleMouseEnter = () => {
    if (!prefetched) {
      prefetchRoute(routePath);
      prefetched = true;
    }
  };
  
  element.addEventListener('mouseenter', handleMouseEnter);
  
  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
  };
};

/**
 * Initialize prefetching for the app
 */
export const initPrefetching = () => {
  if (typeof window === 'undefined') return;
  
  // Prefetch critical routes immediately
  const criticalRoutes = ['/about', '/work', '/products'];
  criticalRoutes.forEach(route => prefetchRoute(route));
  
  // Prefetch likely assets
  const criticalImages = [
    '/assets/images/avatar.jpg',
    '/assets/images/no_image.png'
  ];
  prefetchImages(criticalImages);
  
  // Set up smart prefetching
  const currentPath = window.location.pathname;
  smartPrefetch(currentPath);
};