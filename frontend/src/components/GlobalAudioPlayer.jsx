import React from 'react';
import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Button } from './ui/button';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

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
    startSeeking,
    seek,
    updateSeekTime,
    changeVolume,
    stopPlayback
  } = useAudioPlayer();

  if (!currentBeat) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const coverUrl = currentBeat.cover_url 
    ? `${API}/beats/cover/${currentBeat.cover_url.split('/').pop()}`
    : 'https://via.placeholder.com/60?text=🎵';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-red-900/30">
      {/* Progress Bar */}
      <div className="w-full h-8 flex items-center px-3 bg-zinc-800">
        <span className="text-xs text-gray-400 w-10 text-right mr-3 font-mono">
          {formatTime(currentTime)}
        </span>
        
        <div className="flex-1 relative h-full flex items-center">
          {/* Track background */}
          <div className="absolute inset-x-0 h-2 bg-zinc-700 rounded-full" />
          
          {/* Progress fill */}
          <div 
            className="absolute left-0 h-2 bg-red-600 rounded-full pointer-events-none"
            style={{ width: `${progress}%` }}
          />
          
          {/* Native range input */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onMouseDown={startSeeking}
            onTouchStart={startSeeking}
            onInput={(e) => updateSeekTime(parseFloat(e.target.value))}
            onMouseUp={(e) => seek(parseFloat(e.target.value))}
            onTouchEnd={(e) => seek(parseFloat(e.target.value))}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              zIndex: 10,
              margin: 0,
              padding: 0
            }}
          />
          
          {/* Thumb */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full shadow-lg pointer-events-none"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>
        
        <span className="text-xs text-gray-400 w-10 ml-3 font-mono">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Beat Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img 
              src={coverUrl}
              alt={currentBeat.name}
              className="w-12 h-12 rounded-lg object-cover shadow-lg flex-shrink-0"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=🎵'; }}
            />
            <div className="min-w-0">
              <h4 className="text-white font-semibold truncate">{currentBeat.name}</h4>
              <p className="text-sm text-gray-400">{currentBeat.genre} • {currentBeat.bpm} BPM</p>
            </div>
          </div>

          {/* Play/Pause & Volume */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              className={`rounded-full w-11 h-11 ${isPlaying ? 'bg-white text-black hover:bg-gray-200' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => changeVolume(volume > 0 ? 0 : 1)} 
                className="text-gray-400 hover:text-white p-1"
              >
                {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-16 h-1 cursor-pointer"
                style={{ accentColor: '#fff' }}
              />
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white" 
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
