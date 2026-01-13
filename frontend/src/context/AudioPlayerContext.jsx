import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const AudioPlayerContext = createContext();

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider = ({ children }) => {
  const [currentBeat, setCurrentBeat] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  // Crear elemento de audio una vez
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = () => {
      setIsPlaying(false);
      console.error('Error loading audio');
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  const playBeat = useCallback(async (beat, audioUrl) => {
    const audio = audioRef.current;
    
    // Si es el mismo beat, toggle play/pause
    if (currentBeat?.beat_id === beat.beat_id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
      return;
    }
    
    // Nuevo beat
    setCurrentBeat(beat);
    audio.src = audioUrl;
    setCurrentTime(0);
    setDuration(0);
    
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  }, [currentBeat, isPlaying]);

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!currentBeat) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  }, [currentBeat, isPlaying]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio && duration) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, [duration]);

  const seekPercentage = useCallback((percentage) => {
    const newTime = (percentage / 100) * duration;
    seek(newTime);
  }, [duration, seek]);

  const changeVolume = useCallback((newVolume) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
      setVolume(newVolume);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentBeat(null);
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentBeat,
        isPlaying,
        currentTime,
        duration,
        volume,
        playBeat,
        togglePlayPause,
        seek,
        seekPercentage,
        changeVolume,
        stopPlayback
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
