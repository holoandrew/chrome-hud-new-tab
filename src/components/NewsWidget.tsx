import { useState, useEffect } from 'react';
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
 * Rimuove i tag HTML e decodifica le entità (es. &rsquo; &nbsp; &quot;)
 * in sicurezza via DOMParser — niente innerHTML, niente rischio XSS.
 */
const sanitizeText = (raw: string): string => {
  if (!raw) return '';
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  return doc.body.textContent?.trim() || '';
};

/** Estrae l'URL thumbnail da un <item> RSS provando le convenzioni comuni. */
const extractThumbnail = (item: Element): string => {
  // 1. <media:content url="...">
  const mediaContent = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content')[0];
  if (mediaContent?.getAttribute('url')) return mediaContent.getAttribute('url')!;

  // 2. <media:thumbnail url="...">
  const mediaThumbnail = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail')[0];
  if (mediaThumbnail?.getAttribute('url')) return mediaThumbnail.getAttribute('url')!;

  // 3. <enclosure url="..." type="image/...">
  const enclosure = item.querySelector('enclosure');
  if (enclosure && (enclosure.getAttribute('type') || '').startsWith('image/')) {
    const url = enclosure.getAttribute('url');
    if (url) return url;
  }

  // 4. primo <img> dentro la <description> CDATA
  const desc = item.querySelector('description')?.textContent || '';
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];

  return '';
};

const faviconFor = (link: string): string => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(link).hostname}&sz=64`;
  } catch {
    return '';
  }
};

// Estrae og:image dalla pagina articolo (host già in host_permissions).
// Usato solo come ripiego per i feed privi di immagini nell'XML.
const fetchOgImage = async (link: string): Promise<string> => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(link, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return '';
    const html = (await res.text()).slice(0, 60000); // og:image sta nell'<head>
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return m ? m[1] : '';
  } catch {
    return '';
  }
};

// Riempi le thumbnail mancanti: og:image dell'articolo, poi favicon di ripiego.
const enrichThumbnails = (items: Article[]): Promise<Article[]> =>
  Promise.all(
    items.map(async (a) =>
      a.thumbnail ? a : { ...a, thumbnail: (await fetchOgImage(a.link)) || faviconFor(a.link) }
    )
  );

// Parsa l'XML RSS in articoli.
const parseFeed = (xmlText: string): Article[] => {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('RSS parse error');
  return Array.from(xml.querySelectorAll('item')).slice(0, 8).map((item) => ({
    title: sanitizeText(item.querySelector('title')?.textContent || '') || 'Senza Titolo',
    link: item.querySelector('link')?.textContent?.trim() || '#',
    pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
    thumbnail: extractThumbnail(item),
  }));
};

// Fetch via background service worker (bypassa CORS in modo affidabile).
const fetchViaSW = async (feedUrl: string): Promise<Article[]> => {
  const response: { ok: boolean; data?: string; error?: string } = await new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'FETCH_URL', url: feedUrl }, resolve);
  });
  if (!response?.ok || !response.data) throw new Error(response?.error || 'Fetch failed');
  return parseFeed(response.data);
};

// Ripiego via proxy quando il background non è disponibile (es. dev web).
const fetchViaProxy = async (feedUrl: string): Promise<Article[]> => {
  const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
  const data = await res.json();
  if (!data.items) throw new Error('proxy: no items');
  return data.items.slice(0, 8).map((item: any) => ({
    title: item.title || 'Senza Titolo',
    link: item.link || '#',
    pubDate: item.pubDate || '',
    thumbnail: item.thumbnail || item.enclosure?.link || '',
  }));
};

const NewsWidget = () => {
  const { settings } = useGlobal();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(false);
      const feedUrl = RSS_FEEDS[settings.newsTopic] || RSS_FEEDS['tecnologia'];
      try {
        let items: Article[];
        try {
          items = await fetchViaSW(feedUrl);
        } catch {
          items = await fetchViaProxy(feedUrl);
        }
        // Mostra subito il testo, poi arricchisci le thumbnail mancanti.
        setArticles(items);
        setArticles(await enrichThumbnails(items));
      } catch (e) {
        console.error('Error fetching news:', e);
        setError(true);
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
        ) : error ? (
          <p className="text-red-400 text-xs tech-text">NEWS_OFFLINE // feed non raggiungibile.</p>
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
                      <img
                        src={article.thumbnail}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const fb = faviconFor(article.link);
                          if (fb && e.currentTarget.src !== fb) e.currentTarget.src = fb;
                        }}
                      />
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
