import React, { useState } from 'react';

const SpotifyWidget = () => {
  const [playlistId, setPlaylistId] = useState('37i9dQZF1DXcBWIGoYBM5M'); // Default: Today's Top Hits
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(playlistId);

  const savePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    setPlaylistId(inputVal);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#050b14]/80 border border-cyan-500/50 rounded-2xl p-4 md:p-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md flex flex-col gap-2">
      <div className="flex justify-between items-center border-b border-cyan-500/20 pb-1 mb-2">
        <h3 className="tech-text text-cyan-500 text-[10px]">SPOTIFY // PLAYER</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="text-[10px] text-cyan-600 hover:text-cyan-400 font-mono"
        >
          {isEditing ? 'ANNULLA' : 'CAMBIA'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={savePlaylist} className="flex gap-2">
          <input 
            type="text" 
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="ID Playlist (es. 37i...)"
            className="flex-1 p-2 bg-[#0a1120] border border-cyan-500/30 rounded focus:border-cyan-400 text-cyan-100 text-sm"
          />
          <button type="submit" className="px-3 py-1 bg-cyan-900/50 border border-cyan-500 rounded text-cyan-100 hover:bg-cyan-600/50 text-xs font-bold">OK</button>
        </form>
      ) : (
        <iframe 
          style={{ borderRadius: '12px' }} 
          src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`} 
          width="100%" 
          height="152" 
          frameBorder="0" 
          allowFullScreen 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        ></iframe>
      )}
    </div>
  );
};

export default SpotifyWidget;
