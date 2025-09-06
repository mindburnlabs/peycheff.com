import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "peycheff.com - Founder & Systems Designer",
  description = "I build small teams that ship disproportionate outcomes. Founder & systems designer. I turn vague ideas into shippable products—fast.",
  url = "https://peycheff.com",
  image = "https://peycheff.com/og-image.jpg"
}) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Ivan Peychev",
    "alternateName": "peycheff",
    "jobTitle": "Founder & Systems Designer",
    "description": "Founder & systems designer focused on compressing idea→product cycles.",
    "url": "https://peycheff.com",
    "sameAs": [
      "https://x.com/ivanitrust",
      "https://instagram.com/ivanitrust"
    ],
    "email": "ivan@peycheff.com",
    "worksFor": {
      "@type": "Organization",
      "name": "peycheff.com"
    },
    "knowsAbout": [
      "Product Development",
      "Systems Design", 
      "Team Building",
      "Automation",
      "AI Tools",
      "Startup Operations"
    ],
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Systems Designer",
      "description": "Builds compact systems that turn ideas into products fast"
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Ivan Peychev" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="peycheff.com" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ivanitrust" />
      <meta name="twitter:creator" content="@ivanitrust" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default SEO;
