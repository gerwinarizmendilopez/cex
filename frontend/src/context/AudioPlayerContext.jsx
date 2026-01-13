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
  const isSeekingRef = useRef(false); // Usar ref en lugar de state

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;
    
    const handleTimeUpdate = () => {
      // NO actualizar si el usuario está arrastrando el slider
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
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
  }, []); // Sin dependencias - solo se ejecuta una vez

  const playBeat = useCallback(async (beat, audioUrl) => {
    const audio = audioRef.current;
    
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

  // Iniciar seeking
  const startSeeking = useCallback(() => {
    isSeekingRef.current = true;
  }, []);

  // Hacer seek real al audio
  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio && !isNaN(time) && audio.duration) {
      const clampedTime = Math.max(0, Math.min(time, audio.duration));
      audio.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
    isSeekingRef.current = false;
  }, []);

  // Actualizar tiempo visual mientras se arrastra
  const updateSeekTime = useCallback((time) => {
    setCurrentTime(time);
  }, []);

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
        startSeeking,
        seek,
        updateSeekTime,
        changeVolume,
        stopPlayback
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
