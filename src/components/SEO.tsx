import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  structuredData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Awesome Mini PC - Complete Database of Mini PCs, SBCs & Homelab Machines',
  description = 'Comprehensive catalog of mini PCs, single board computers (SBCs), and homelab machines with detailed specifications, networking capabilities, and comparison tools. Find the perfect mini PC for your needs.',
  keywords = ['mini PC', 'single board computer', 'SBC', 'homelab', 'self-hosting', 'mini computer', 'specifications', 'comparison'],
  image = 'https://awesomeminipc.com/og-image.jpg',
  url = 'https://awesomeminipc.com',
  type = 'website',
  structuredData
}) => {
  const keywordsString = keywords.join(', ');

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      <link rel="canonical" href={url} />
      
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}; 