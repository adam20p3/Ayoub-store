/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useMemo } from 'react';
import { getProducts, getCategories, initializeSampleData } from '@/lib/products';
import { logInquiry } from '@/lib/inquiries';
import { fmtMAD, fmtMADPlain } from '@/lib/currency';
import { LanguageProvider, useLanguage, buildProductWaMessage } from '@/lib/i18n';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, Instagram, Menu } from 'lucide-react';
import Link from 'next/link';
import { DeliveryInquiryWidget } from '@/components/delivery-inquiry-widget';

// ─────────────────────────────────────────────────────────────
const STORE_NAME = 'Maison Luxe';
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1603219527847-24c87f552a77?w=1920&q=85';
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '15551234567';

const WhatsAppIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.057 21.785c-1.835 0-3.638-.494-5.214-1.428l-.373-.222-3.873 1.016 1.034-3.776-.244-.39A9.86 9.86 0 0 1 2.187 11.9c0-5.443 4.427-9.87 9.87-9.87 2.637 0 5.114 1.027 6.98 2.892a9.821 9.821 0 0 1 2.892 6.984c-.003 5.443-4.43 9.879-9.872 9.879zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 0 0-3.473-8.413z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Skeleton card
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
      type="button"
      onClick={() => onOpen(product)}
      className="group text-start focus:outline-none"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-bone">
        <img
          src={product.images?.[0] || fallback}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
          {fmtMAD(product.price)}
        </div>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// Product detail modal
// ─────────────────────────────────────────────────────────────
const ProductDetailModal = ({ product, open, onClose }) => {
  const { t, dir } = useLanguage();
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

  const buildWaLink = () => {
    const msg = buildProductWaMessage(t, STORE_NAME, {
      name: product.name,
      category: product.category,
      price: fmtMADPlain(product.price),
      imageUrl: product.images?.[0] || '',
    });
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        dir={dir}
        className="max-w-6xl p-0 overflow-hidden bg-cream border-bone gap-0 sm:rounded-none [&>button]:hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300"
      >
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
                    type="button"
                    onClick={prev}
                    aria-label={t.modal.prevImage}
                    className="absolute start-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-cream/85 hover:bg-cream text-ink flex items-center justify-center transition"
                  >
                    {dir === 'rtl' ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label={t.modal.nextImage}
                    className="absolute end-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-cream/85 hover:bg-cream text-ink flex items-center justify-center transition"
                  >
                    {dir === 'rtl' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-4 bg-cream/60 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden border transition ${
                      i === idx ? 'border-ink' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`${t.modal.prevImage} ${i + 1}`}
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
              type="button"
              onClick={onClose}
              aria-label={t.modal.close}
              className="absolute top-5 end-5 h-9 w-9 rounded-full hover:bg-bone text-ink flex items-center justify-center transition"
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
                {fmtMAD(product.price)}
              </span>
              {!product.inStock && (
                <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-cognac">
                  · {t.modal.madeToOrder}
                </span>
              )}
            </div>

            <a
              href={buildWaLink()}
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
              {t.modal.cta}
            </a>

            <p className="mt-5 font-sans text-[11px] text-taupe leading-relaxed">
              {t.modal.note}
            </p>

            <div className="mt-auto pt-10 grid grid-cols-3 gap-6 text-[10px] uppercase tracking-[0.22em] text-taupe">
              <div>
                <p className="text-ink font-sans">{t.modal.handFinished}</p>
                <p className="mt-1">{t.modal.handFinishedSub}</p>
              </div>
              <div>
                <p className="text-ink font-sans">{t.modal.worldwide}</p>
                <p className="mt-1">{t.modal.worldwideSub}</p>
              </div>
              <div>
                <p className="text-ink font-sans">{t.modal.lifetime}</p>
                <p className="mt-1">{t.modal.lifetimeSub}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────
// Language toggle (FR | ع)
// ─────────────────────────────────────────────────────────────
const LangToggle = () => {
  const { lang, setLang } = useLanguage();
  return (
    <div
      role="group"
      aria-label="Language switch"
      dir="ltr"
      className="inline-flex items-center rounded-full border border-bone bg-cream/60 backdrop-blur-sm p-0.5 select-none"
    >
      <button
        type="button"
        onClick={() => setLang('fr')}
        aria-pressed={lang === 'fr'}
        className={`h-7 px-3 rounded-full font-sans text-[10px] uppercase tracking-[0.22em] transition-colors ${
          lang === 'fr' ? 'bg-ink text-cream' : 'text-taupe hover:text-ink'
        }`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLang('ar')}
        aria-pressed={lang === 'ar'}
        className={`h-7 w-9 rounded-full text-base leading-none transition-colors flex items-center justify-center ${
          lang === 'ar' ? 'bg-ink text-cream' : 'text-taupe hover:text-ink'
        }`}
      >
        <span className="font-serif">ع</span>
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Navbar (sticky)
// ─────────────────────────────────────────────────────────────
const Navbar = () => {
  const { t, dir } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when an anchor is clicked
  const handleLinkClick = () => setMobileOpen(false);

  const links = [
    { href: '#top',        label: t.nav.home },
    { href: '#collection', label: t.nav.collection },
  ];

  return (
    <header
      dir={dir}
      className={`sticky top-0 z-40 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-cream/95 backdrop-blur-md border-bone shadow-[0_1px_0_rgba(0,0,0,0.02)]'
          : 'bg-cream/80 backdrop-blur supports-[backdrop-filter]:bg-cream/70 border-transparent'
      }`}
    >
      <div className="container flex h-16 md:h-20 items-center justify-between gap-4">
        <Link
          href="#top"
          aria-label={STORE_NAME}
          className="flex items-center gap-3 whitespace-nowrap"
        >
          <img
            src="/logo.jpg"
            alt={STORE_NAME}
            className="h-10 md:h-12 w-auto rounded-full ring-1 ring-bone/60 object-cover"
          />
          <span className="hidden sm:inline font-serif text-lg md:text-xl tracking-[0.18em] text-ink">
            {STORE_NAME.toUpperCase()}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`font-sans text-[11px] uppercase tracking-[0.28em] text-ink/70 hover:text-ink transition-colors ${
                dir === 'rtl' ? 'font-serif text-sm normal-case tracking-normal' : ''
              }`}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/admin"
            className={`font-sans text-[10px] uppercase tracking-[0.28em] text-taupe hover:text-ink transition-colors ${
              dir === 'rtl' ? 'font-serif text-sm normal-case tracking-normal' : ''
            }`}
          >
            {t.nav.atelier}
          </Link>
          <LangToggle />
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <LangToggle />
          <button
            type="button"
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="h-10 w-10 flex items-center justify-center text-ink rounded-full hover:bg-bone/60 transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          mobileOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="container pb-6 pt-2 flex flex-col gap-1 border-t border-bone">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={handleLinkClick}
              className={`px-1 py-3 border-b border-bone/60 last:border-b-0 ${
                dir === 'rtl' ? 'font-serif text-lg text-ink text-end' : 'font-sans text-[12px] uppercase tracking-[0.28em] text-ink'
              }`}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/admin"
            onClick={handleLinkClick}
            className={`mt-3 self-start ${
              dir === 'rtl' ? 'font-serif text-sm self-end text-taupe' : 'font-sans text-[10px] uppercase tracking-[0.28em] text-taupe hover:text-ink'
            }`}
          >
            {t.nav.atelier} →
          </Link>
        </nav>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────
// Storefront
// ─────────────────────────────────────────────────────────────
const Storefront = () => {
  const { t, dir, hydrated } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('__all__');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSampleData();
    setProducts(getProducts());
    setCategories(getCategories());
    setLoading(false);
  }, []);

  const visibleProducts = useMemo(() => {
    if (activeCategory === '__all__') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <div dir={dir} className="min-h-screen bg-cream text-ink font-sans">
      <Navbar />

      {/* Hero */}
      <section
        id="top"
        className="relative h-[88vh] min-h-[600px] w-full overflow-hidden scroll-mt-20"
      >
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/20 to-ink/60" />
        <div className="relative z-10 h-full container flex flex-col justify-end pb-16 md:pb-24">
          <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-cream/80">
            {t.hero.tagline}
          </p>
          <h1 className="mt-6 font-serif text-[clamp(3rem,9vw,7.5rem)] font-light leading-[0.95] text-cream whitespace-pre-line">
            {t.hero.headline}
          </h1>
          <p className="mt-8 max-w-xl font-sans text-base md:text-lg leading-relaxed text-cream/85">
            {t.hero.subtext}
          </p>
          <a
            href="#collection"
            className="mt-10 inline-flex items-center gap-3 self-start border border-cream/70 text-cream hover:bg-cream hover:text-ink transition-colors px-8 py-4 font-sans text-[11px] uppercase tracking-[0.3em]"
          >
            {t.hero.cta}
          </a>
        </div>
      </section>

      {/* Editorial intro */}
      <section className="container py-20 md:py-28 max-w-3xl text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-taupe">
          {t.intro.eyebrow}
        </p>
        <h2 className="mt-5 font-serif text-4xl md:text-5xl font-light leading-tight text-ink whitespace-pre-line">
          {t.intro.title}
        </h2>
        <p className="mt-7 font-sans text-[15px] leading-[1.9] text-charcoal/80">
          {t.intro.body.replace('{store}', STORE_NAME)}
        </p>
      </section>

      {/* Filter */}
      <section id="collection" className="container scroll-mt-24">
        <div className="border-t border-bone pt-10 pb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-taupe">
              {t.collection.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl font-light text-ink">
              {t.collection.title}
            </h2>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-x-7 gap-y-2">
              {[{ key: '__all__', label: t.collection.all }, ...categories.map((c) => ({ key: c, label: c }))].map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`font-sans text-[11px] uppercase tracking-[0.28em] pb-1 border-b transition-colors ${
                    activeCategory === c.key
                      ? 'text-ink border-ink'
                      : 'text-taupe border-transparent hover:text-ink'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="container pb-24 md:pb-32">
        {loading || !hydrated ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-20">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-ink/60">{t.collection.empty}</p>
            <p className="mt-3 font-sans text-sm text-taupe">{t.collection.emptySub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-20">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={setSelected} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-bone bg-cream">
        <div className="container py-16 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt={STORE_NAME}
                className="h-14 w-14 rounded-full ring-1 ring-bone object-cover"
              />
              <p className="font-serif text-2xl tracking-[0.15em] text-ink">
                {STORE_NAME.toUpperCase()}
              </p>
            </div>
            <p className="mt-4 font-sans text-sm text-taupe leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-taupe">
              {t.footer.atelier}
            </p>
            <ul className="mt-4 space-y-2 font-sans text-sm text-ink/80">
              <li>{t.footer.byAppointment}</li>
              <li>{t.footer.hours}</li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink underline-offset-4 hover:underline"
                >
                  {t.footer.message}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-taupe">
              {t.footer.follow}
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
              © {new Date().getFullYear()} {STORE_NAME}. {t.footer.rights}
            </p>
            <Link
              href="/admin"
              className="font-sans text-[10px] uppercase tracking-[0.28em] text-taupe hover:text-ink"
            >
              {t.footer.login}
            </Link>
          </div>
        </div>
      </footer>

      <ProductDetailModal
        product={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />

      <DeliveryInquiryWidget />
    </div>
  );
};

const Home = () => (
  <LanguageProvider>
    <Storefront />
  </LanguageProvider>
);

export default Home;
