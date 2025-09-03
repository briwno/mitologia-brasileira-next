// src/components/UI/ShareButtons.js
"use client";

import { useState } from 'react';
import Icon from '@/components/UI/Icon';

export default function ShareButtons({ url, title, text }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text || title || '');
  const encodedTitle = encodeURIComponent(title || '');

  const twitterHref = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
  const whatsappHref = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) {
      // ignore
    }
  };

  const onNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ url, title, text });
      } catch (_) { /* user canceled */ }
    } else {
      await onCopy();
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <a
        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow border border-sky-400 transition flex items-center gap-2"
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        title="Compartilhar no Twitter/X"
      >
        <Icon name="twitter" size={16} />
        Twitter/X
      </a>
      <a
        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold shadow border border-green-400 transition flex items-center gap-2"
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        title="Compartilhar no WhatsApp"
      >
        <Icon name="whatsapp" size={16} />
        WhatsApp
      </a>
      <a
        className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-semibold shadow border border-blue-500 transition"
        href={facebookHref}
        target="_blank"
        rel="noopener noreferrer"
        title="Compartilhar no Facebook"
      >
        f Facebook
      </a>
      <button
        type="button"
        onClick={onNativeShare}
        className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold shadow border border-neutral-600 transition flex items-center gap-2"
        title="Compartilhar via dispositivo ou copiar link"
      >
        <Icon name={typeof navigator !== 'undefined' && navigator.share ? 'share' : 'link'} size={16} />
        {typeof navigator !== 'undefined' && navigator.share ? 'Compartilhar' : 'Copiar Link'}
      </button>
      {copied && (
        <span className="text-sm text-emerald-300 self-center">Link copiado!</span>
      )}
    </div>
  );
}
