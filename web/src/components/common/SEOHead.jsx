import { Helmet } from 'react-helmet-async';

/**
 * SEO Head component for page-level TDK management
 * @param {string} title - Page title (will be appended with brand name)
 * @param {string} description - Meta description (150-160 chars recommended)
 * @param {string} keywords - Meta keywords (comma separated)
 * @param {string} canonicalPath - Path for canonical URL (e.g. '/pricing')
 * @param {string} ogType - Open Graph type (default: 'website')
 */
const SEOHead = ({
  title,
  description,
  keywords,
  canonicalPath = '/',
  ogType = 'website',
}) => {
  const baseUrl = 'https://www.lingtrue.com';
  const brandName = 'LingTrue';
  const fullTitle = title ? `${title} | ${brandName}` : `${brandName} - AI API Gateway for GPT, Claude & Gemini`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const ogImage = `${baseUrl}/cover-4.webp`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEOHead;
