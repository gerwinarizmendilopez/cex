import React, { useState, useCallback } from 'react';
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

  // Estado local para manejar el drag sin interferir con el audio
  const [localTime, setLocalTime] = useState(null);
  const [localVolume, setLocalVolume] = useState(null);

  // Cuando está arrastrando, usar localTime; si no, usar currentTime
  const displayTime = localTime !== null ? localTime : currentTime;
  const displayVolume = localVolume !== null ? localVolume : volume;

  const handleProgressChange = useCallback((e) => {
    const newTime = parseFloat(e.target.value);
    setLocalTime(newTime);
  }, []);

  const handleProgressMouseUp = useCallback((e) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
    setLocalTime(null);
  }, [seek]);

  const handleVolumeChange = useCallback((e) => {
    const newVol = parseFloat(e.target.value);
    setLocalVolume(newVol);
    changeVolume(newVol);
  }, [changeVolume]);

  const handleVolumeMouseUp = useCallback(() => {
    setLocalVolume(null);
  }, []);

  // No mostrar si no hay beat
  if (!currentBeat) return null;

  const progress = duration ? (displayTime / duration) * 100 : 0;
  
  const coverUrl = currentBeat.cover_url 
    ? `${API}/beats/cover/${currentBeat.cover_url.split('/').pop()}`
    : 'https://via.placeholder.com/60?text=🎵';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-zinc-900 to-zinc-900/95 border-t border-red-900/30 shadow-2xl">
      {/* Custom Progress Bar usando input range */}
      <div className="w-full px-0 relative h-5 flex items-center group">
        {/* Background track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-zinc-700 group-hover:h-2 transition-all" />
        
        {/* Progress fill */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-red-600 group-hover:h-2 transition-all pointer-events-none"
          style={{ width: `${progress}%` }}
        />
        
        {/* Invisible range input for interaction */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={displayTime}
          onChange={handleProgressChange}
          onMouseUp={handleProgressMouseUp}
          onTouchEnd={handleProgressMouseUp}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
          style={{ height: '100%' }}
        />
        
        {/* Visible thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
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
                onClick={() => changeVolume(displayVolume > 0 ? 0 : 1)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                {displayVolume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              {/* Volume slider */}
              <div className="relative w-20 h-4 flex items-center group">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-zinc-700 rounded-full" />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-white rounded-full pointer-events-none"
                  style={{ width: `${displayVolume * 100}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={displayVolume}
                  onChange={handleVolumeChange}
                  onMouseUp={handleVolumeMouseUp}
                  onTouchEnd={handleVolumeMouseUp}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow pointer-events-none"
                  style={{ left: `calc(${displayVolume * 100}% - 6px)` }}
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
