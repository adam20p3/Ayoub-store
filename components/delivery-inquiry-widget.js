'use client'

import { useState } from 'react';
import { Send, X, Truck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage, buildDeliveryWaMessage } from '@/lib/i18n';

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '15551234567';

const WhatsAppIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.057 21.785c-1.835 0-3.638-.494-5.214-1.428l-.373-.222-3.873 1.016 1.034-3.776-.244-.39A9.86 9.86 0 0 1 2.187 11.9c0-5.443 4.427-9.87 9.87-9.87 2.637 0 5.114 1.027 6.98 2.892a9.821 9.821 0 0 1 2.892 6.984c-.003 5.443-4.43 9.879-9.872 9.879zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 0 0-3.473-8.413z" />
  </svg>
);

export const DeliveryInquiryWidget = () => {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState('');
  const [note, setNote] = useState('');

  const canSubmit = !!region && note.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const msg = buildDeliveryWaMessage(t, { region, note: note.trim() });
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setOpen(false);
    setRegion('');
    setNote('');
  };

  // Anchor the widget on the trailing edge of the viewport in the active dir.
  const anchorClass = isRtl
    ? 'fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-50 pointer-events-none'
    : 'fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 pointer-events-none';
  const panelPos = isRtl
    ? 'pointer-events-auto absolute bottom-20 left-0 w-[92vw] max-w-[360px] origin-bottom-left'
    : 'pointer-events-auto absolute bottom-20 right-0 w-[92vw] max-w-[360px] origin-bottom-right';

  return (
    <div className={anchorClass} dir={dir} aria-live="polite">
      <div
        className={`${panelPos} transition-all duration-300 ease-out ${
          open
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <div className="bg-cream border border-bone shadow-2xl rounded-md overflow-hidden">
          <div className="bg-ink text-cream px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-cream/10 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-cream/70">
                  {t.widget.eyebrow}
                </p>
                <h3 className="font-serif text-lg leading-tight">
                  {t.widget.title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.widget.closeAria}
              className="text-cream/70 hover:text-cream transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-cream">
            <p className="text-[13px] leading-relaxed text-charcoal/75">
              {t.widget.intro}
            </p>

            <div className="space-y-1.5">
              <label className="block font-sans text-[10px] uppercase tracking-[0.22em] text-taupe">
                {t.widget.regionLabel}
              </label>
              <Select value={region} onValueChange={setRegion} dir={dir}>
                <SelectTrigger className="bg-white border-bone h-11 text-sm">
                  <SelectValue placeholder={t.widget.regionPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {t.widget.regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-sans text-[10px] uppercase tracking-[0.22em] text-taupe">
                {t.widget.noteLabel}
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.widget.notePlaceholder}
                rows={4}
                className="bg-white border-bone text-sm resize-none"
                dir={dir}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink text-cream hover:bg-charcoal disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-5 py-3.5 font-sans text-[11px] uppercase tracking-[0.28em]"
            >
              <Send className="h-3.5 w-3.5" />
              {t.widget.submit}
            </button>

            <p className="text-[11px] text-taupe leading-relaxed text-center">
              {t.widget.submitNote}
            </p>
          </form>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t.widget.closeAria : t.widget.openAria}
        className={`pointer-events-auto relative h-14 w-14 rounded-full shadow-2xl ring-1 ring-black/5 transition-all duration-300 flex items-center justify-center ${
          open ? 'bg-cream text-ink hover:bg-bone' : 'bg-ink text-cream hover:scale-105'
        }`}
      >
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${open ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
          <WhatsAppIcon className="h-6 w-6" />
        </span>
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${open ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
          <X className="h-5 w-5" />
        </span>
        {!open && (
          <span className="absolute inset-0 rounded-full bg-ink/30 animate-ping opacity-20" />
        )}
      </button>
    </div>
  );
};

export default DeliveryInquiryWidget;
