import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { PlusSquare, Trash2, GripVertical, X, Globe } from 'lucide-react';
import { useGlobal } from '../GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Shortcut {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface Section {
  id: string;
  title: string;
  links: Shortcut[];
}

const defaultSections: Section[] = [
  {
    id: 's-lavoro',
    title: 'LAVORO // SHORTCUTS',
    links: [
      { id: '1', name: 'Google', url: 'https://www.google.it', icon: 'https://www.google.com/favicon.ico' },
      { id: '3', name: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.svg' }
    ]
  },
  {
    id: 's-personale',
    title: 'PERSONALE // SHORTCUTS',
    links: [
      { id: '2', name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/favicon.ico' },
      { id: '4', name: 'Wikipedia', url: 'https://it.wikipedia.org', icon: 'https://it.wikipedia.org/favicon.ico' }
    ]
  }
];

const ShortcutIcon = ({ link, settings }: { link: Shortcut, settings: any }) => {
  const [error, setError] = useState(false);

  return (
    <div className="w-12 h-12 bg-cyan-900/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-900/40 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300">
      {error ? (
        <Globe className="w-5 h-5 text-cyan-600/70" />
      ) : (
        <img 
          src={link.icon} 
          alt={link.name} 
          className={`w-6 h-6 object-contain ${link.name.toLowerCase().includes('github') && settings.theme === 'theme-light' ? 'invert brightness-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]' : ''} ${link.name.toLowerCase().includes('github') ? 'invert brightness-200' : ''}`} 
          onError={() => setError(true)} 
        />
      )}
    </div>
  );
};

const ShortcutsWidget = () => {
  const { isEditMode, settings } = useGlobal();
  const [sections, setSections] = useState<Section[]>(() => {
    try {
      const saved = localStorage.getItem('dashboard_shortcuts_sections');
      if (saved) return JSON.parse(saved);
    } catch {
      /* dato corrotto: usa i default */
    }
    return defaultSections;
  });

  const [addingToSection, setAddingToSection] = useState<string | null>(null);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [sectionName, setSectionName] = useState('');

  const dragDisabled = !isEditMode || !settings.enableDragDrop;

  useEffect(() => {
    localStorage.setItem('dashboard_shortcuts_sections', JSON.stringify(sections));
  }, [sections]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim() || !addingToSection) return;

    let finalUrl = linkUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    let finalName = linkName.trim();
    if (!finalName) {
      try {
        const urlObj = new URL(finalUrl);
        const parts = urlObj.hostname.replace('www.', '').split('.');
        finalName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      } catch {
        finalName = finalUrl;
      }
    }

    let icon = '';
    try {
      const urlObj = new URL(finalUrl);
      icon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch {
      icon = `https://www.google.com/s2/favicons?domain=${finalUrl}&sz=64`;
    }

    const newLink: Shortcut = {
      id: Date.now().toString(),
      name: finalName,
      url: finalUrl,
      icon
    };

    setSections(sections.map(s => s.id === addingToSection ? { ...s, links: [...s.links, newLink] } : s));
    setAddingToSection(null);
    setLinkName('');
    setLinkUrl('');
  };

  const handleDeleteLink = (e: React.MouseEvent, sectionId: string, linkId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSections(sections.map(s => s.id === sectionId ? { ...s, links: s.links.filter(l => l.id !== linkId) } : s));
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    const title = sectionName.trim();
    if (!title) return;
    setSections([...sections, { id: Date.now().toString(), title: title.toUpperCase() + ' // SHORTCUTS', links: [] }]);
    setSectionName('');
    setAddingSection(false);
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-4xl mx-auto">
      <ReactSortable
        list={sections}
        setList={setSections}
        group="sections"
        animation={200}
        disabled={dragDisabled}
        handle=".section-handle"
        className="space-y-8 w-full"
      >
        {sections.map(section => (
          <div key={section.id} className="w-full flex flex-col relative">
            
            <div className="flex items-center gap-2 mb-4 border-b border-cyan-500/20 pb-1">
              {isEditMode && (
                <div className="section-handle cursor-grab active:cursor-grabbing text-cyan-500 hover:text-white">
                  <GripVertical className="w-4 h-4" />
                </div>
              )}
              <h3 className="tech-text text-cyan-500 text-[10px] w-full text-left">
                {section.title}
              </h3>
              {isEditMode && (
                <div className="flex gap-2">
                  <button onClick={() => setAddingToSection(section.id)} aria-label="Aggiungi link" className="text-cyan-500 hover:text-cyan-300"><PlusSquare className="w-4 h-4" /></button>
                  <button onClick={() => setSections(sections.filter(s => s.id !== section.id))} aria-label="Elimina sezione" className="text-red-500 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            <ReactSortable
              list={section.links}
              setList={(newLinks) => setSections(prev => prev.map(s => s.id === section.id ? { ...s, links: newLinks } : s))}
              group="links"
              animation={200}
              disabled={dragDisabled}
              className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-2 gap-y-4 justify-items-center w-full ${isEditMode && section.links.length === 0 ? 'min-h-[80px] bg-cyan-900/10 rounded-xl border border-dashed border-cyan-500/30' : ''}`}
            >
              {section.links.map(link => (
                <div key={link.id} className="relative group flex flex-col items-center justify-center gap-3 w-24 h-24 rounded-2xl transition duration-300 cursor-pointer">
                  <a 
                    href={isEditMode ? undefined : link.url} 
                    onClick={e => isEditMode && e.preventDefault()}
                    className="flex flex-col items-center w-full h-full justify-center cursor-pointer"
                  >
                    <ShortcutIcon link={link} settings={settings} />
                    <span className="text-xs font-medium text-cyan-500 group-hover:text-cyan-300 truncate w-full text-center px-1 mt-2">{link.name}</span>
                  </a>
                  {isEditMode && (
                    <button onClick={(e) => handleDeleteLink(e, section.id, link.id)} className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center transform translate-x-2 -translate-y-2 z-10 scale-0 group-hover:scale-100 transition-transform">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </ReactSortable>

            {/* Add placeholder button when in edit mode */}
            {!isEditMode && section.links.length === 0 && null}
          </div>
        ))}
      </ReactSortable>

      {isEditMode && (
        <button onClick={() => setAddingSection(true)} className="mt-4 px-6 py-2 border border-dashed border-cyan-500/50 rounded-xl text-cyan-500 hover:text-cyan-300 hover:bg-cyan-900/20 transition-all font-mono text-sm self-center">
          + NUOVA SEZIONE
        </button>
      )}

      {/* New Section Modal */}
      <AnimatePresence>
        {addingSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm p-6 rounded-2xl bg-[#050b14] border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 border-b border-cyan-500/30 pb-2">
                <h3 className="text-cyan-300 font-bold tech-text">NUOVA SEZIONE</h3>
                <button onClick={() => setAddingSection(false)} aria-label="Chiudi" className="text-cyan-600 hover:text-cyan-300"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddSection} className="flex flex-col gap-4">
                <input autoFocus type="text" value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="Nome sezione (es. Lavoro)" className="w-full p-2 bg-[#0a1120] border border-cyan-500/30 rounded focus:border-cyan-400 text-cyan-100" required />
                <button type="submit" className="w-full py-2 bg-cyan-900/50 border border-cyan-500 rounded text-cyan-100 hover:bg-cyan-600/50 transition">CREA SEZIONE</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Link Modal */}
      <AnimatePresence>
        {addingToSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm p-6 rounded-2xl bg-[#050b14] border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 border-b border-cyan-500/30 pb-2">
                <h3 className="text-cyan-300 font-bold tech-text">NUOVO LINK</h3>
                <button onClick={() => setAddingToSection(null)} className="text-cyan-600 hover:text-cyan-300"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddLink} className="flex flex-col gap-4">
                <input type="text" value={linkName} onChange={e => setLinkName(e.target.value)} placeholder="Nome (lascia vuoto per auto-generare)" className="w-full p-2 bg-[#0a1120] border border-cyan-500/30 rounded focus:border-cyan-400 text-cyan-100" />
                <input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="URL (es. netflix.com)" className="w-full p-2 bg-[#0a1120] border border-cyan-500/30 rounded focus:border-cyan-400 text-cyan-100" required />
                <button type="submit" className="w-full py-2 bg-cyan-900/50 border border-cyan-500 rounded text-cyan-100 hover:bg-cyan-600/50 transition">SALVA COLLEGAMENTO</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ShortcutsWidget;
