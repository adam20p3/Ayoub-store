'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'maison_luxe_lang';
const DEFAULT_LANG = 'fr';

// ─────────────────────────────────────────────────────────────
// Translation dictionary
// ─────────────────────────────────────────────────────────────
export const DICT = {
  fr: {
    code: 'fr',
    label: 'FR',
    nav: {
      home: 'Accueil',
      collection: 'Collection',
      atelier: 'Atelier',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      switchTo: 'Passer en arabe',
    },
    hero: {
      tagline: 'Atelier de cuir · Est. MMXXIV',
      headline: "D'une élégance\ndiscrète.",
      subtext:
        'Une sélection de pièces en cuir façonnées à la main — en petits ateliers, pour durer toute une vie.',
      cta: 'Voir la collection',
    },
    intro: {
      eyebrow: 'La Maison',
      title: 'Façonné avec patience.\nPorté pendant des décennies.',
      body:
        "Chaque silhouette de la collection {store} est imaginée dans notre atelier et façonnée à la main à partir de cuirs pleine fleur, choisis pour leur caractère et leur capacité à s'adoucir avec le temps.",
    },
    collection: {
      eyebrow: 'La Sélection',
      title: 'Collection Actuelle',
      all: 'Tout',
      empty: 'La collection est en préparation.',
      emptySub: 'Revenez très bientôt.',
      countOne: 'pièce',
      countMany: 'pièces',
    },
    modal: {
      madeToOrder: 'Sur commande',
      cta: 'Commander via WhatsApp',
      note:
        "Chaque pièce est réservée sur demande. Notre atelier vous répond sous un jour ouvré pour confirmer la disponibilité, la livraison et la personnalisation.",
      handFinished: 'Fini à la main',
      handFinishedSub: 'En petites séries',
      worldwide: 'International',
      worldwideSub: 'Livraison offerte',
      lifetime: 'À vie',
      lifetimeSub: 'Suivi atelier',
      prevImage: 'Image précédente',
      nextImage: 'Image suivante',
      close: 'Fermer',
    },
    footer: {
      tagline: 'Maroquinerie finie à la main, en éditions limitées.',
      atelier: "L'Atelier",
      byAppointment: 'Ouvert sur rendez-vous',
      hours: 'Lun — Sam, 10h — 18h',
      message: 'Écrivez-nous sur WhatsApp',
      follow: 'Nous suivre',
      rights: 'Tous droits réservés.',
      login: 'Espace Atelier',
    },
    widget: {
      eyebrow: 'Livraison & sur mesure',
      title: 'Demande directe',
      intro:
        "Indiquez-nous votre région et ce qui vous intéresse. Collez le lien d'une image Instagram ou décrivez la pièce — nous vous répondons sur WhatsApp.",
      regionLabel: 'Région de livraison',
      regionPlaceholder: 'Choisir une région',
      noteLabel: "Lien d'image ou note",
      notePlaceholder:
        "ex : https://instagram.com/p/abc123 — ou — « J'ai vu un sac cognac sur votre Instagram, livrez-vous à Casablanca ? »",
      submit: 'Envoyer via WhatsApp',
      submitNote:
        'Ouvre WhatsApp dans un nouvel onglet. Nous répondons sous un jour ouvré.',
      openAria: 'Ouvrir la demande de livraison',
      closeAria: 'Fermer la demande',
      hoverLabel: 'Livraison',
      regions: [
        'Maroc',
        'Afrique du Nord',
        'France',
        'Europe',
        'Royaume-Uni',
        'Moyen-Orient',
        'Amérique du Nord',
        'Reste du monde',
        "Retrait à l'atelier",
        'Je ne sais pas',
      ],
    },
    wa: {
      headerSuffix: 'Nouvelle demande',
      product: 'Produit',
      category: 'Catégorie',
      price: 'Prix',
      reference: 'Image de référence',
      closing:
        "Merci de me confirmer la disponibilité et la livraison de cet article.",
      deliveryHello: "Bonjour, j'ai une demande de livraison concernant",
      deliveryNote: 'Note',
    },
  },

  ar: {
    code: 'ar',
    label: 'ع',
    nav: {
      home: 'الرئيسية',
      collection: 'التشكيلة',
      atelier: 'الورشة',
      openMenu: 'فتح القائمة',
      closeMenu: 'إغلاق القائمة',
      switchTo: 'Passer en français',
    },
    hero: {
      tagline: 'ورشة الجلد · تأسست MMXXIV',
      headline: 'أناقة\nهادئة.',
      subtext:
        'تشكيلة مختارة من القطع الجلدية المصنوعة يدوياً — في ورشات صغيرة، لتدوم العمر كله.',
      cta: 'اكتشف التشكيلة',
    },
    intro: {
      eyebrow: 'البيت',
      title: 'مصنوعة بصبر.\nتُحمل لعقود.',
      body:
        'كل قطعة في تشكيلة {store} تُصمَّم في ورشتنا وتُصنع يدوياً من أجود أنواع الجلد الكامل، المختار لطابعه وللطريقة التي يلين بها مع الوقت.',
    },
    collection: {
      eyebrow: 'المختارات',
      title: 'التشكيلة الحالية',
      all: 'الكل',
      empty: 'التشكيلة قيد التحضير.',
      emptySub: 'يرجى العودة قريباً.',
      countOne: 'قطعة',
      countMany: 'قطع',
    },
    modal: {
      madeToOrder: 'حسب الطلب',
      cta: 'اطلب عبر واتساب',
      note:
        'كل قطعة تُحجز عند الطلب. ستردّ عليك ورشتنا خلال يوم عمل لتأكيد التوفر والتوصيل والتخصيص.',
      handFinished: 'صنع يدوي',
      handFinishedSub: 'بكميات محدودة',
      worldwide: 'دولي',
      worldwideSub: 'شحن مجاني',
      lifetime: 'مدى الحياة',
      lifetimeSub: 'متابعة الورشة',
      prevImage: 'الصورة السابقة',
      nextImage: 'الصورة التالية',
      close: 'إغلاق',
    },
    footer: {
      tagline: 'مصنوعات جلدية يدوية، بإصدارات محدودة.',
      atelier: 'الورشة',
      byAppointment: 'مفتوح بحجز موعد',
      hours: 'الاثنين — السبت، 10:00 — 18:00',
      message: 'راسلونا عبر واتساب',
      follow: 'تابعنا',
      rights: 'جميع الحقوق محفوظة.',
      login: 'دخول الورشة',
    },
    widget: {
      eyebrow: 'التوصيل والطلبات الخاصة',
      title: 'استفسار مباشر',
      intro:
        'أخبرنا أين أنت وما الذي تبحث عنه. الصق رابط صورة من إنستغرام أو صف القطعة — سنرد عليك عبر واتساب.',
      regionLabel: 'منطقة التوصيل',
      regionPlaceholder: 'اختر منطقة',
      noteLabel: 'رابط صورة أو ملاحظة',
      notePlaceholder:
        'مثال: https://instagram.com/p/abc123 — أو — «رأيت حقيبة جلدية على إنستغرام، هل توصلون إلى الدار البيضاء؟»',
      submit: 'إرسال عبر واتساب',
      submitNote:
        'يفتح واتساب في تبويب جديد. نرد عادةً خلال يوم عمل.',
      openAria: 'فتح استفسار التوصيل',
      closeAria: 'إغلاق الاستفسار',
      hoverLabel: 'استفسار',
      regions: [
        'المغرب',
        'شمال إفريقيا',
        'فرنسا',
        'أوروبا',
        'المملكة المتحدة',
        'الشرق الأوسط',
        'أمريكا الشمالية',
        'بقية العالم',
        'الاستلام من الورشة',
        'غير محدد',
      ],
    },
    wa: {
      headerSuffix: 'طلب جديد',
      product: 'المنتج',
      category: 'الفئة',
      price: 'السعر',
      reference: 'صورة مرجعية',
      closing: 'يرجى إخباري بتوفر التوصيل لهذا المنتج.',
      deliveryHello: 'مرحباً، لدي استفسار بخصوص التوصيل إلى',
      deliveryNote: 'ملاحظة',
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Context + Provider + Hook
// ─────────────────────────────────────────────────────────────
const LangCtx = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: DICT[DEFAULT_LANG],
  dir: 'ltr',
  hydrated: false,
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ar' || saved === 'fr') setLang(saved);
    } catch { /* noop */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* noop */ }
  }, [lang, hydrated]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t: DICT[lang] || DICT[DEFAULT_LANG],
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    hydrated,
  }), [lang, hydrated]);

  return React.createElement(LangCtx.Provider, { value }, children);
};

export const useLanguage = () => useContext(LangCtx);

// ─────────────────────────────────────────────────────────────
// Helpers for building WhatsApp messages in the active language
// ─────────────────────────────────────────────────────────────
export const buildProductWaMessage = (t, storeName, { name, category, price, imageUrl }) => {
  return [
    `${storeName} — ${t.wa.headerSuffix}`,
    '----------------------------------',
    `${t.wa.product}: ${name}`,
    `${t.wa.category}: ${category || '—'}`,
    `${t.wa.price}: ${price}`,
    `${t.wa.reference}: ${imageUrl || ''}`,
    '',
    t.wa.closing,
  ].join('\n');
};

export const buildDeliveryWaMessage = (t, { region, note }) => {
  return `${t.wa.deliveryHello} ${region}. ${t.wa.deliveryNote}: ${note}`;
};
