import { useState, useEffect } from 'react';
import { useGlobal } from '../GlobalContext';

interface Article {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
}

const RSS_FEEDS: Record<string, string> = {
  'tecnologia': 'https://www.ansa.it/sito/notizie/tecnologia/tecnologia_rss.xml',
  'italia': 'https://www.ansa.it/sito/notizie/cronaca/cronaca_rss.xml',
  'mondo': 'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml',
  'finanza': 'https://www.ilsole24ore.com/rss/finanza.xml',
  'sport24': 'https://www.gazzetta.it/rss/home.xml'
};

// Parsing diretto dell'XML RSS (funziona in estensione con host_permissions).
const fetchDirect = async (feedUrl: string): Promise<Article[]> => {
  const res = await fetch(feedUrl);
  if (!res.ok) throw new Error('RSS HTTP ' + res.status);
  const xml = new DOMParser().parseFromString(await res.text(), 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('RSS parse error');
  return Array.from(xml.querySelectorAll('item')).slice(0, 8).map((item) => {
    const get = (tag: string) => item.querySelector(tag)?.textContent?.trim() || '';
    const media =
      item.querySelector('enclosure')?.getAttribute('url') ||
      item.getElementsByTagName('media:content')[0]?.getAttribute('url') ||
      item.getElementsByTagName('media:thumbnail')[0]?.getAttribute('url') ||
      '';
    return {
      title: get('title') || 'Senza Titolo',
      link: get('link') || '#',
      pubDate: get('pubDate'),
      thumbnail: media,
    };
  });
};

// Fallback via proxy quando il fetch diretto è bloccato da CORS (es. in dev web).
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
          items = await fetchDirect(feedUrl);
        } catch {
          items = await fetchViaProxy(feedUrl);
        }
        setArticles(items);
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
          <ul className="flex flex-col gap-4">
            {articles.map((article, i) => (
              <li key={i} className="flex gap-3 items-start group border-b border-cyan-500/10 pb-3 last:border-0 last:pb-0">
                {article.thumbnail && (
                  <div className="w-16 h-16 shrink-0 overflow-hidden rounded border border-cyan-500/20">
                    <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-cyan-50 group-hover:text-cyan-300 transition-colors leading-snug line-clamp-3">
                  {article.title}
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
