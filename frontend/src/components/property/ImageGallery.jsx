import { useState, useEffect, useCallback } from 'react';
import './ImageGallery.css';

const PLACEHOLDER = (
  <div className="ig-placeholder" aria-hidden="true">
    <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
      <path d="M5 15L20 5l15 10v20H5V15z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="14" y="24" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
    <p>No images available</p>
  </div>
);

/**
 * ImageGallery
 * images: [{ id, image_url, is_primary }]
 * title: string (alt text)
 */
const ImageGallery = ({ images = [], title = '' }) => {
  const [active, setActive]       = useState(0);
  const [lightbox, setLightbox]   = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // Keyboard navigation in lightbox
  const handleKeyDown = useCallback((e) => {
    if (!lightbox) return;
    if (e.key === 'ArrowRight') setLightboxIdx((i) => (i + 1) % images.length);
    if (e.key === 'ArrowLeft')  setLightboxIdx((i) => (i - 1 + images.length) % images.length);
    if (e.key === 'Escape')     setLightbox(false);
  }, [lightbox, images.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setLightbox(true);
  };

  if (!images.length) return PLACEHOLDER;

  const primaryIdx = images.findIndex((img) => img.is_primary);
  const orderedImages = primaryIdx > 0
    ? [images[primaryIdx], ...images.filter((_, i) => i !== primaryIdx)]
    : images;

  return (
    <>
      {/* ── Main Gallery ──────────────────────────── */}
      <div className="image-gallery">
        {/* Large active image */}
        <div
          className="ig-main"
          onClick={() => openLightbox(active)}
          role="button"
          tabIndex={0}
          aria-label="Open image lightbox"
          onKeyDown={(e) => e.key === 'Enter' && openLightbox(active)}
        >
          <img
            src={orderedImages[active]?.image_url}
            alt={`${title} — image ${active + 1}`}
            className="ig-main__img"
            loading="eager"
          />
          <div className="ig-main__overlay" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {images.length > 1 && (
            <span className="ig-main__count">{active + 1} / {images.length}</span>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="ig-thumbs" role="list" aria-label="Image thumbnails">
            {orderedImages.map((img, i) => (
              <button
                key={img.id}
                className={`ig-thumb ${i === active ? 'ig-thumb--active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                role="listitem"
              >
                <img src={img.image_url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────── */}
      {lightbox && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(false); }}
        >
          {/* Close */}
          <button
            className="lightbox__close"
            onClick={() => setLightbox(false)}
            aria-label="Close lightbox"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="lightbox__nav lightbox__nav--prev"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i - 1 + images.length) % images.length); }}
              aria-label="Previous image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="lightbox__img-wrap">
            <img
              src={orderedImages[lightboxIdx]?.image_url}
              alt={`${title} — image ${lightboxIdx + 1}`}
              className="lightbox__img"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              className="lightbox__nav lightbox__nav--next"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i + 1) % images.length); }}
              aria-label="Next image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="lightbox__counter" aria-live="polite">
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
