import { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { uploadMusic, getUserUploads } from '../services/StorageService';
import { Upload, FileMusic, Cloud, AlertCircle, Trash2, Play } from 'lucide-react';

export default function UploadHub() {
  const { userSession, setUserUploads, userUploads, setCurrentTrack, setIsPlaying } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (!userSession) {
      alert("Bitte logge dich ein, um Cloud-Power zu nutzen.");
      return;
    }

    setIsUploading(true);
    for (const file of Array.from(files)) {
      if (file.type.startsWith('audio/')) {
        try {
          await uploadMusic(file, userSession.user.id);
        } catch (err) {
          console.error(err);
        }
      }
    }
    
    // Refresh list
    const uploads = await getUserUploads(userSession.user.id);
    setUserUploads(uploads);
    setIsUploading(false);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="hero-section text-center">
        <h2 className="hero-title" style={{ fontSize: '3.5rem' }}>CLOUD<span>STORAGE</span></h2>
        <p className="hero-subtitle">Deine Musik. Überall. Sicher in der OmniMusic Cloud.</p>
      </div>

      <div 
        className={`glass-panel upload-zone ${dragActive ? 'drag-active' : ''}`}
        style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center', 
          border: `2px dashed ${dragActive ? 'var(--accent-cyan)' : 'var(--glass-border)'}`,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative'
        }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFiles(e.target.files)} style={{ display: 'none' }} multiple accept="audio/*" />
        
        <div style={{ color: isUploading ? 'var(--accent-cyan)' : 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {isUploading ? <Cloud size={60} className="pulse" /> : <Upload size={60} />}
        </div>
        
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {isUploading ? 'Hochladen...' : 'Musik hier ablegen'}
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>MP3, WAV, OGG bis zu 50MB</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <FileMusic size={20} color="var(--accent-purple)" />
           Deine Cloud-Songs ({userUploads.length})
        </h3>

        {userUploads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
             <AlertCircle size={40} style={{ margin: '0 auto 1rem' }} />
             <p>Noch keine Musik in der Cloud.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {userUploads.map((track) => (
              <div 
                key={track.id} 
                className="glass-panel" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.5rem', 
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  border: '1px solid transparent'
                }}
                onClick={() => {
                  setCurrentTrack({
                    trackId: track.id,
                    trackName: track.title,
                    artistName: track.artist,
                    artworkUrl100: 'https://api.dicebear.com/7.x/abstract/svg?seed=' + track.id,
                    previewUrl: track.file_url,
                    collectionName: 'Cloud Upload',
                    primaryGenreName: 'User Audio'
                  });
                  setIsPlaying(true);
                }}
              >
                <div className="play-btn-circle flex-center" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
                   <Play size={16} fill="currentColor" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', margin: 0 }}>{track.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{track.artist}</p>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                   {(track.size / (1024 * 1024)).toFixed(2)} MB
                </div>
                <button className="btn-icon" style={{ padding: '0.5rem' }}>
                   <Trash2 size={16} color="var(--error)" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .upload-zone.drag-active {
          background: rgba(0, 242, 254, 0.05);
          transform: scale(1.02);
        }
        .pulse {
          animation: pulse 1.5s infinite alternate;
        }
        @keyframes pulse {
          from { transform: scale(1); opacity: 0.5; }
          to { transform: scale(1.2); opacity: 1; }
        }
      `}</style>

    </div>
  );
}
