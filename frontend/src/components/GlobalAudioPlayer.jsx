import React, { useCallback, useRef } from 'react';
import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Button } from './ui/button';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Formatear tiempo en mm:ss
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const GlobalAudioPlayer = () => {
  const {
    currentBeat,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    seek,
    changeVolume,
    stopPlayback
  } = useAudioPlayer();

  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);

  // Manejar click/drag en la barra de progreso
  const handleProgressClick = useCallback((e) => {
    if (!progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    seek(Math.max(0, Math.min(newTime, duration)));
  }, [duration, seek]);

  // Manejar drag en la barra de progreso
  const handleProgressDrag = useCallback((e) => {
    if (e.buttons !== 1) return; // Solo si el botón izquierdo está presionado
    handleProgressClick(e);
  }, [handleProgressClick]);

  // Manejar click en la barra de volumen
  const handleVolumeClick = useCallback((e) => {
    if (!volumeBarRef.current) return;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    changeVolume(Math.max(0, Math.min(1, percentage)));
  }, [changeVolume]);

  // No mostrar si no hay beat
  if (!currentBeat) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const coverUrl = currentBeat.cover_url 
    ? `${API}/beats/cover/${currentBeat.cover_url.split('/').pop()}`
    : 'https://via.placeholder.com/60?text=🎵';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-zinc-900 to-zinc-900/95 border-t border-red-900/30 shadow-2xl">
      {/* Progress Bar - Full width, clickable */}
      <div 
        ref={progressBarRef}
        className="w-full h-2 bg-zinc-700 cursor-pointer group"
        onClick={handleProgressClick}
        onMouseMove={handleProgressDrag}
      >
        <div 
          className="h-full bg-red-600 relative transition-all duration-100"
          style={{ width: `${progress}%` }}
        >
          {/* Thumb/Handle */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1/2" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Beat Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img 
              src={coverUrl}
              alt={currentBeat.name}
              className="w-14 h-14 rounded-lg object-cover shadow-lg flex-shrink-0"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/60?text=🎵';
              }}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-semibold truncate text-lg">{currentBeat.name}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-red-400">{currentBeat.genre}</span>
                <span>•</span>
                <span>{currentBeat.bpm} BPM</span>
                <span>•</span>
                <span>{currentBeat.key}</span>
              </div>
            </div>
          </div>

          {/* Time Display */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400 font-mono">
            <span className="w-12 text-right">{formatTime(currentTime)}</span>
            <span>/</span>
            <span className="w-12">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <Button
              size="lg"
              className={`rounded-full w-12 h-12 flex-shrink-0 ${isPlaying ? 'bg-white text-black hover:bg-gray-200' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            {/* Volume Control */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => changeVolume(volume > 0 ? 0 : 1)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <div 
                ref={volumeBarRef}
                className="w-20 h-1.5 bg-zinc-700 rounded-full cursor-pointer group"
                onClick={handleVolumeClick}
              >
                <div 
                  className="h-full bg-white rounded-full relative"
                  style={{ width: `${volume * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1/2" />
                </div>
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-zinc-800"
              onClick={stopPlayback}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
