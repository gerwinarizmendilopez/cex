import React, { useCallback, useRef, useState, useEffect } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  // Calcular tiempo basado en posición del mouse
  const calculateTimeFromEvent = useCallback((e) => {
    if (!progressBarRef.current || !duration) return 0;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  }, [duration]);

  // Manejar inicio del drag
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    if (!duration) return;
    
    setIsDragging(true);
    const newTime = calculateTimeFromEvent(e);
    setDragTime(newTime);
  }, [duration, calculateTimeFromEvent]);

  // Manejar movimiento durante el drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      const newTime = calculateTimeFromEvent(e);
      setDragTime(newTime);
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      const finalTime = calculateTimeFromEvent(e);
      seek(finalTime);
      setIsDragging(false);
    };

    // Añadir listeners al document para capturar eventos fuera del elemento
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, calculateTimeFromEvent, seek]);

  // Click simple (sin drag)
  const handleClick = useCallback((e) => {
    if (isDragging) return;
    const newTime = calculateTimeFromEvent(e);
    seek(newTime);
  }, [isDragging, calculateTimeFromEvent, seek]);

  // Manejar click en la barra de volumen
  const handleVolumeClick = useCallback((e) => {
    if (!volumeBarRef.current) return;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    changeVolume(percentage);
  }, [changeVolume]);

  // No mostrar si no hay beat
  if (!currentBeat) return null;

  // Usar dragTime si estamos arrastrando, sino currentTime
  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration ? (displayTime / duration) * 100 : 0;
  
  const coverUrl = currentBeat.cover_url 
    ? `${API}/beats/cover/${currentBeat.cover_url.split('/').pop()}`
    : 'https://via.placeholder.com/60?text=🎵';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-zinc-900 to-zinc-900/95 border-t border-red-900/30 shadow-2xl">
      {/* Progress Bar Container */}
      <div 
        ref={progressBarRef}
        className="w-full h-4 bg-zinc-800 cursor-pointer relative group"
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={{ touchAction: 'none' }}
      >
        {/* Background track */}
        <div className="absolute inset-0 bg-zinc-700" />
        
        {/* Progress fill */}
        <div 
          className="absolute top-0 left-0 h-full bg-red-600 pointer-events-none"
          style={{ width: `${progress}%` }}
        />
        
        {/* Thumb/Handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg pointer-events-none transition-transform"
          style={{ 
            left: `${progress}%`,
            transform: `translateX(-50%) translateY(-50%) scale(${isDragging ? 1.3 : 1})`,
          }}
        />
        
        {/* Hover effect line */}
        <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
            <span className="w-12 text-right">{formatTime(displayTime)}</span>
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
                className="w-20 h-2 bg-zinc-700 rounded-full cursor-pointer relative group"
                onClick={handleVolumeClick}
              >
                <div 
                  className="h-full bg-white rounded-full"
                  style={{ width: `${volume * 100}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${volume * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                />
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
