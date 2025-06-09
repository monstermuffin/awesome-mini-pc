import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Awesome Mini PC - Complete Database of Mini PCs, SBCs & Homelab Machines',
  description = 'Comprehensive catalog of mini PCs, single board computers (SBCs), and homelab machines with detailed specifications, networking capabilities, and comparison tools. Find the perfect mini PC for your needs.',
  keywords = ['mini PC', 'single board computer', 'SBC', 'homelab', 'self-hosting', 'mini computer', 'specifications', 'comparison']
}) => {
  useEffect(() => {
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords.join(', '));
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }
    
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title);
    }
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description);
    }
  }, [title, description, keywords]);

  return null;
}; 