import React, { useState, useEffect } from 'react';
import { useGlobal } from '../GlobalContext';

interface Article {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
}

const RSS_FEEDS: Record<string, string> = {
  'tecnologia': 'https://www.ilsole24ore.com/rss/tecnologia.xml',
  'italia': 'https://www.ilsole24ore.com/rss/italia.xml',
  'mondo': 'https://www.ilsole24ore.com/rss/mondo.xml',
  'finanza': 'https://www.ilsole24ore.com/rss/finanza.xml',
  'sport24': 'https://www.corrieredellosport.it/rss/calcio'
};

/**
 * Strips HTML tags and decodes HTML entities (e.g. &rsquo; &nbsp; &quot;)
 * safely via DOMParser — no innerHTML, no XSS risk.
 */
const sanitizeText = (raw: string): string => {
  if (!raw) return '';
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  return doc.body.textContent?.trim() || '';
};

/**
 * Extracts the thumbnail URL from an RSS <item> element.
 * Tries multiple common RSS/Atom image conventions.
 */
const extractThumbnail = (item: Element): string => {
  // 1. <media:content url="...">
  const mediaContent = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content')[0];
  if (mediaContent) {
    const url = mediaContent.getAttribute('url');
    if (url) return url;
  }

  // 2. <media:thumbnail url="...">
  const mediaThumbnail = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail')[0];
  if (mediaThumbnail) {
    const url = mediaThumbnail.getAttribute('url');
    if (url) return url;
  }

  // 3. <enclosure url="..." type="image/...">
  const enclosure = item.querySelector('enclosure');
  if (enclosure) {
    const type = enclosure.getAttribute('type') || '';
    if (type.startsWith('image/')) {
      const url = enclosure.getAttribute('url');
      if (url) return url;
    }
  }

  // 4. First <img> inside <description> CDATA
  const desc = item.querySelector('description')?.textContent || '';
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];

  return '';
};

const NewsWidget = () => {
  const { settings } = useGlobal();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const feedUrl = RSS_FEEDS[settings.newsTopic] || RSS_FEEDS['tecnologia'];

        // Fetch via background service worker per bypassare CORS
        const response: { ok: boolean; data?: string; error?: string } = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'FETCH_URL', url: feedUrl }, resolve);
        });

        if (!response?.ok || !response.data) {
          throw new Error(response?.error || 'Fetch failed');
        }

        const xml = new DOMParser().parseFromString(response.data, 'application/xml');

        const items = xml.querySelectorAll('item');
        const parsedArticles: Article[] = Array.from(items).slice(0, 8).map((item) => ({
          title: sanitizeText(item.querySelector('title')?.textContent || '') || 'Senza Titolo',
          link: item.querySelector('link')?.textContent?.trim() || '#',
          pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
          thumbnail: extractThumbnail(item),
        }));
        setArticles(parsedArticles);
      } catch (e) {
        console.error('Error fetching news:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [settings.newsTopic]);

  return (
    <div className="bg-[#050b14]/80 border border-cyan-500/50 rounded-2xl p-4 md:p-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md h-[400px] flex flex-col">
      <h3 className="tech-text text-cyan-500 text-[10px] w-full text-left border-b border-cyan-500/20 pb-1 mb-3 shrink-0">
        NEWS_ONLINE // {settings.newsTopic.toUpperCase()}
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <p className="text-cyan-500 text-sm animate-pulse">Recupero dati in corso...</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {articles.map((article, i) => (
              <li key={i}>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 items-start p-2 rounded-lg border border-transparent hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all duration-300"
                >
                  {article.thumbnail && (
                    <div className="w-16 h-16 shrink-0 overflow-hidden rounded border border-cyan-500/20">
                      <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-cyan-50 group-hover:text-cyan-300 transition-colors leading-snug line-clamp-3">
                    {article.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NewsWidget;
