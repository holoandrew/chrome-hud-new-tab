import React, { useState, useEffect, useRef } from 'react';
import { useGlobal } from '../GlobalContext';

interface GoogleTask {
  id: string;
  title: string;
  status: string;
}

const TasksWidget = () => {
  const { isEditMode } = useGlobal();
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'active' | 'completed'>('active');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'it-IT';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewTaskTitle(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    // Attempt silent auth on mount
    getAuthToken(false).then(token => {
      if (token) setAuthToken(token);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (authToken) {
      loadTasks();
    }
  }, [authToken]);

  const getAuthToken = (interactive: boolean): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (typeof chrome === 'undefined' || !chrome.identity) {
        reject(new Error('chrome.identity non disponibile'));
        return;
      }
      chrome.identity.getAuthToken({ interactive }, (result) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve((typeof result === 'string' ? result : result?.token) ?? null);
      });
    });
  };

  // Token scaduto/revocato: scartalo dalla cache e forza un nuovo login.
  const handleExpiredToken = () => {
    const token = authToken;
    if (token && typeof chrome !== 'undefined' && chrome.identity) {
      chrome.identity.removeCachedAuthToken({ token }, () => setAuthToken(null));
    } else {
      setAuthToken(null);
    }
  };

  const loadTasks = async () => {
    try {
      let listId = currentListId;
      if (!listId) {
        const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
          headers: { 'Authorization': 'Bearer ' + authToken }
        });
        if (listsRes.status === 401) return handleExpiredToken();
        if (!listsRes.ok) throw new Error('API Error');
        const lists = await listsRes.json();
        if (lists.items && lists.items.length > 0) {
          listId = lists.items[0].id;
          setCurrentListId(listId);
        } else return;
      }

      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      if (res.status === 401) return handleExpiredToken();
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setTasks(data.items || []);
    } catch (e) {
      console.error('Tasks load error:', e);
    }
  };

  const handleLogin = async () => {
    try {
      const token = await getAuthToken(true);
      if (token) setAuthToken(token);
    } catch (e: any) {
      if (typeof chrome === 'undefined' || !chrome.identity) {
        alert('Autenticazione fallita. Devi avviare l\'app come Estensione Chrome per usare questa feature (chrome.identity non disponibile: probabilmente stai testando con "npm run dev" nel browser invece di caricare la cartella dist come estensione).');
      } else {
        alert('Autenticazione fallita: ' + (e?.message || 'errore sconosciuto') + '\n\nControlla in Google Cloud Console che: 1) l\'ID client OAuth (tipo "Estensione di Chrome") corrisponda esattamente all\'ID mostrato in chrome://extensions per questa estensione; 2) la Google Tasks API sia abilitata; 3) il tuo account sia tra gli Utenti di Test (se l\'app OAuth è in stato "Testing").');
      }
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentListId || !authToken) return;

    try {
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${currentListId}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTaskTitle })
      });
      setNewTaskTitle('');
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!currentListId || !authToken) return;
    
    // Ottimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));

    try {
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${currentListId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });
    } catch (err) {
      await loadTasks(); // Revert on fail
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    setIsListening(true);
    recognitionRef.current.start();
  };

  const filteredTasks = tasks.filter(t => currentTab === 'active' ? t.status === 'needsAction' : t.status === 'completed');

  return (
    <div className={`glass-panel w-full flex flex-col overflow-hidden h-[400px] transition-opacity duration-300 ${isEditMode ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="px-4 py-3 border-b border-cyan-500/20 shrink-0 bg-[#050b14]/40 flex justify-between items-center group">
        <div className="flex gap-2 items-center text-[9px] sm:text-[10px]">
          <h2 className="tech-text text-[10px] text-cyan-50 mr-1">G_TASKS</h2>
          <span className="text-cyan-700">//</span>
          <button onClick={() => setCurrentTab('active')} className={`tech-text transition-colors pb-0.5 ${currentTab === 'active' ? 'text-cyan-300 border-b border-cyan-300' : 'text-cyan-700 hover:text-cyan-500'}`}>ATTIVI</button>
          <span className="text-cyan-700">//</span>
          <button onClick={() => setCurrentTab('completed')} className={`tech-text transition-colors pb-0.5 ${currentTab === 'completed' ? 'text-cyan-300 border-b border-cyan-300' : 'text-cyan-700 hover:text-cyan-500'}`}>COMPLETATI</button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${authToken ? 'bg-green-500' : 'bg-cyan-700'}`}></span>
        </div>
      </div>
      
      {!authToken ? (
        <div className="p-4 flex flex-col items-center justify-center gap-3 h-full">
          <p className="text-xs text-cyan-500 text-center font-mono">Autenticazione richiesta per sincronizzazione DB.</p>
          <button onClick={handleLogin} className="px-4 py-1.5 tech-text bg-cyan-900/50 border border-cyan-500 hover:bg-cyan-600/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] rounded text-cyan-100 transition text-[10px]">AUTH_REQ</button>
        </div>
      ) : (
        <div className="flex-col flex h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2 min-h-[150px]">
            {filteredTasks.length === 0 ? (
              <p className="text-[10px] text-cyan-700 text-center italic mt-4">Nessun task {currentTab === 'active' ? 'in sospeso' : 'completato'}.</p>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="group flex items-start gap-2 p-2 hover:bg-cyan-900/20 rounded transition-colors cursor-pointer" onClick={() => task.status !== 'completed' && completeTask(task.id)}>
                  <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed' ? 'border-cyan-300' : 'border-cyan-500/50 group-hover:border-cyan-300'}`}>
                    {task.status === 'completed' ? (
                      <svg className="w-3 h-3 text-cyan-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    ) : (
                      <svg className="w-3 h-3 text-cyan-300 opacity-0 group-hover:opacity-50 transition-opacity" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    )}
                  </div>
                  <span className={`text-xs font-medium leading-snug ${task.status === 'completed' ? 'text-cyan-700 line-through' : 'text-cyan-100'}`}>{task.title}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 shrink-0">
            <form onSubmit={addTask} className="flex items-center relative w-full">
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Aggiungi task..." 
                className="w-full bg-[#0a1120]/60 border border-cyan-500/30 text-cyan-50 text-xs rounded-full py-2.5 pl-4 pr-16 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] placeholder-cyan-700 transition-all" 
                required 
              />
              
              <div className="absolute right-3 flex items-center gap-1.5">
                <button type="button" onClick={toggleMic} aria-label="Dettatura vocale" className={`transition-colors ${isListening ? 'text-cyan-300 animate-pulse' : 'text-cyan-700 hover:text-cyan-400'}`} title="Dettatura vocale">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>

                <button type="submit" aria-label="Aggiungi task" className="text-cyan-500 hover:text-cyan-300 transition-colors pl-1 border-l border-cyan-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksWidget;
