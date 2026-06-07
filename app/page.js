/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useMemo } from 'react';
import { getProducts, getCategories, initializeSampleData } from '@/lib/products';
import { logInquiry } from '@/lib/inquiries';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Instagram } from 'lucide-react';
import Link from 'next/link';
import { DeliveryInquiryWidget } from '@/components/delivery-inquiry-widget';

// ─────────────────────────────────────────────────────────────
// Configuration — update these to match your boutique
// ─────────────────────────────────────────────────────────────
const STORE_NAME = 'Maison Luxe';
const STORE_TAGLINE = 'Atelier of Leather';
const HERO_HEADLINE = 'Quietly\nExtraordinary.';
const HERO_SUBTEXT =
  'A curated edit of handcrafted leather goods — made slowly, in small ateliers, for a lifetime of wear.';
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1603219527847-24c87f552a77?w=1920&q=85';
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '15551234567'; // configurable via .env

const buildWhatsAppLink = (product) => {
  const mainImage = product.images?.[0] || '';
  const price = `$${Number(product.price).toFixed(2)}`;

  // Structured message — line breaks render in WhatsApp; the bare image
  // URL on its own line generates a rich image preview on the recipient's
  // phone so the operator can instantly see the exact product.
  const text = [
    `${STORE_NAME} - New Order Inquiry`,
    `----------------------------------`,
    `Product: ${product.name}`,
    `Category: ${product.category || '—'}`,
    `Price: ${price}`,
    `Reference Image: ${mainImage}`,
    ``,
    `Please let me know the delivery availability for this item.`,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
};

// ─────────────────────────────────────────────────────────────
// WhatsApp glyph (inline SVG so we don't add a dep)
// ─────────────────────────────────────────────────────────────
const WhatsAppIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.057 21.785c-1.835 0-3.638-.494-5.214-1.428l-.373-.222-3.873 1.016 1.034-3.776-.244-.39A9.86 9.86 0 0 1 2.187 11.9c0-5.443 4.427-9.87 9.87-9.87 2.637 0 5.114 1.027 6.98 2.892a9.821 9.821 0 0 1 2.892 6.984c-.003 5.443-4.43 9.879-9.872 9.879zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 0 0-3.473-8.413z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Loading skeleton (shown while localStorage is being read)
// ─────────────────────────────────────────────────────────────
const ProductSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[4/5] w-full bg-bone" />
    <div className="mt-5 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-2 w-16 bg-bone rounded" />
        <div className="h-4 w-3/4 bg-bone rounded" />
      </div>
      <div className="h-4 w-12 bg-bone rounded shrink-0" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Product card
// ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, onOpen }) => {
  const fallback =
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800';
  return (
    <button
      onClick={() => onOpen(product)}
      className="group text-left focus:outline-none"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-bone">
        <img
          src={product.images?.[0] || fallback}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {product.category && (
            <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-taupe">
              {product.category}
            </p>
          )}
          <h3 className="mt-1 font-serif text-xl font-light leading-tight text-ink">
            {product.name}
          </h3>
        </div>
        <div className="shrink-0 font-sans text-sm tracking-wide text-ink">
          ${Number(product.price).toFixed(2)}
        </div>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// Product detail modal with gallery
// ─────────────────────────────────────────────────────────────
const ProductDetailModal = ({ product, open, onClose }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [product?.id]);

  if (!product) return null;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200'];

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden bg-cream border-bone gap-0 sm:rounded-none [&>button]:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[92vh] overflow-y-auto">
          {/* Gallery */}
          <div className="relative bg-bone">
            <div className="relative aspect-square md:aspect-auto md:h-full min-h-[60vh]">
              <img
                src={images[idx]}
                alt={`${product.name} ${idx + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-cream/85 hover:bg-cream text-ink flex items-center justify-center transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-cream/85 hover:bg-cream text-ink flex items-center justify-center transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-4 bg-cream/60 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden border transition ${
                      i === idx ? 'border-ink' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="relative p-8 md:p-12 lg:p-14 bg-cream flex flex-col">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 h-9 w-9 rounded-full hover:bg-bone text-ink flex items-center justify-center transition"
            >
              <X className="h-4 w-4" />
            </button>

            {product.category && (
              <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-taupe">
                {product.category}
              </p>
            )}
            <h2 className="mt-3 font-serif text-4xl md:text-5xl font-light leading-[1.05] text-ink">
              {product.name}
            </h2>

            <div className="mt-5 h-px w-12 bg-taupe/40" />

            <p className="mt-6 font-sans text-[15px] leading-[1.8] text-charcoal/80">
              {product.description}
            </p>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="font-serif text-3xl text-ink">
                ${Number(product.price).toFixed(2)}
              </span>
              {!product.inStock && (
                <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-cognac">
                  · Made to order
                </span>
              )}
            </div>

            <a
              href={buildWhatsAppLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                logInquiry({
                  productId: product.id,
                  productName: product.name,
                  productPrice: product.price,
                  productCategory: product.category,
                  imageUrl: product.images?.[0] || '',
                })
              }
              className="mt-10 group inline-flex items-center justify-center gap-3 bg-ink text-cream hover:bg-charcoal transition-colors px-8 py-5 font-sans text-[12px] uppercase tracking-[0.28em]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Enquire via WhatsApp
            </a>

            <p className="mt-5 font-sans text-[11px] text-taupe leading-relaxed">
              Each piece is reserved on request. Our atelier will respond within one business day to confirm availability, shipping, and personalisation.
            </p>

            <div className="mt-auto pt-10 grid grid-cols-3 gap-6 text-[10px] uppercase tracking-[0.22em] text-taupe">
              <div>
                <p className="text-ink font-sans">Hand-finished</p>
                <p className="mt-1">In small batches</p>
              </div>
              <div>
                <p className="text-ink font-sans">Worldwide</p>
                <p className="mt-1">Complimentary shipping</p>
              </div>
              <div>
                <p className="text-ink font-sans">Lifetime</p>
                <p className="mt-1">Atelier care</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeSampleData();
    const all = getProducts();
    setProducts(all);
    setCategories(getCategories());
  }, []);

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="font-serif text-2xl text-ink/50">{STORE_NAME}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      {/* ── Navbar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-cream/85 backdrop-blur supports-[backdrop-filter]:bg-cream/70 border-b border-bone">
        <div className="container flex h-16 md:h-20 items-center justify-between">
          <div className="w-24" />
          <Link href="/" className="font-serif text-2xl md:text-3xl tracking-[0.15em] text-ink">
            {STORE_NAME.toUpperCase()}
          </Link>
          <div className="w-24 flex justify-end">
            <Link
              href="/admin"
              className="hidden md:inline-block font-sans text-[10px] uppercase tracking-[0.28em] text-taupe hover:text-ink transition-colors"
            >
              Atelier
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/20 to-ink/60" />
        <div className="relative z-10 h-full container flex flex-col justify-end pb-16 md:pb-24">
          <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-cream/80">
            {STORE_TAGLINE} · Est. MMXXIV
          </p>
          <h1 className="mt-6 font-serif text-[clamp(3rem,9vw,7.5rem)] font-light leading-[0.95] text-cream whitespace-pre-line">
            {HERO_HEADLINE}
          </h1>
          <p className="mt-8 max-w-xl font-sans text-base md:text-lg leading-relaxed text-cream/85">
            {HERO_SUBTEXT}
          </p>
          <a
            href="#collection"
            className="mt-10 inline-flex items-center gap-3 self-start border border-cream/70 text-cream hover:bg-cream hover:text-ink transition-colors px-8 py-4 font-sans text-[11px] uppercase tracking-[0.3em]"
          >
            View the Collection
          </a>
        </div>
      </section>

      {/* ── Editorial intro ───────────────────────────────── */}
      <section className="container py-20 md:py-28 max-w-3xl text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-taupe">
          The House
        </p>
        <h2 className="mt-5 font-serif text-4xl md:text-5xl font-light leading-tight text-ink">
          Crafted with patience.
          <br />
          Carried for decades.
        </h2>
        <p className="mt-7 font-sans text-[15px] leading-[1.9] text-charcoal/80">
          Every silhouette in the {STORE_NAME} collection is conceived in our
          atelier and shaped by hand from full-grain leathers selected for
          their character, their grain, and the way they soften with time.
        </p>
      </section>

      {/* ── Category filter ───────────────────────────────── */}
      <section id="collection" className="container">
        <div className="border-t border-bone pt-10 pb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-taupe">
              The Edit
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl font-light text-ink">
              Current Collection
            </h2>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-x-7 gap-y-2">
              {['All', ...categories].map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`font-sans text-[11px] uppercase tracking-[0.28em] pb-1 border-b transition-colors ${
                    activeCategory === c
                      ? 'text-ink border-ink'
                      : 'text-taupe border-transparent hover:text-ink'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Product grid ──────────────────────────────────── */}
      <section className="container pb-24 md:pb-32">
        {visibleProducts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-ink/60">
              The collection is being prepared.
            </p>
            <p className="mt-3 font-sans text-sm text-taupe">
              Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-20">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={setSelected} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-bone bg-cream">
        <div className="container py-16 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          <div>
            <p className="font-serif text-2xl tracking-[0.15em] text-ink">
              {STORE_NAME.toUpperCase()}
            </p>
            <p className="mt-3 font-sans text-sm text-taupe leading-relaxed max-w-xs">
              {STORE_TAGLINE}. Hand-finished leather goods, made in limited
              editions.
            </p>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-taupe">
              The Atelier
            </p>
            <ul className="mt-4 space-y-2 font-sans text-sm text-ink/80">
              <li>Open by appointment</li>
              <li>Mon — Sat, 10:00 — 18:00</li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink underline-offset-4 hover:underline"
                >
                  Message us on WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-taupe">
              Follow
            </p>
            <div className="mt-4 flex items-center gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="h-10 w-10 rounded-full border border-bone hover:border-ink hover:text-ink text-taupe flex items-center justify-center transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="h-10 w-10 rounded-full border border-bone hover:border-ink hover:text-ink text-taupe flex items-center justify-center transition-colors"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-bone">
          <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-sans text-xs text-taupe">
              © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
            </p>
            <Link
              href="/admin"
              className="font-sans text-[10px] uppercase tracking-[0.28em] text-taupe hover:text-ink"
            >
              Atelier Login
            </Link>
          </div>
        </div>
      </footer>

      <ProductDetailModal
        product={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />

      {/* Floating delivery inquiry widget */}
      <DeliveryInquiryWidget />
    </div>
  );
};

export default Home;
