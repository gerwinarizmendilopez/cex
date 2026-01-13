import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Music2, Filter, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import axios from 'axios';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export const Catalogo = () => {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  const { currentBeat, isPlaying, playBeat } = useAudioPlayer();

  const genres = ['all', 'Trap', 'Reggaeton', 'R&B', 'Hip Hop', 'Drill', 'Lo-Fi', 'Afrobeat'];

  useEffect(() => {
    fetchBeats();
  }, []);

  const fetchBeats = async () => {
    try {
      const response = await axios.get(`${API}/beats`);
      setBeats(response.data.beats || []);
    } catch (error) {
      console.error('Error cargando beats:', error);
      toast.error('Error al cargar los beats');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar beats
  const filteredBeats = beats
    .filter(beat => {
      const matchesSearch = beat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           beat.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           beat.mood.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || beat.genre.toLowerCase() === selectedGenre.toLowerCase();
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price_basica - b.price_basica;
      if (sortBy === 'price-high') return b.price_basica - a.price_basica;
      if (sortBy === 'popular') return (b.plays || 0) - (a.plays || 0);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const handlePlayPause = async (beat) => {
    const audioUrl = `${API}/beats/audio/${beat.audio_url.split('/').pop()}`;
    await playBeat(beat, audioUrl);
    
    // Registrar play en el servidor (solo si es un nuevo beat)
    if (currentBeat?.beat_id !== beat.beat_id) {
      axios.post(`${API}/beats/${beat.beat_id}/play`).catch(() => {});
    }
  };

  const isCurrentBeatPlaying = (beatId) => {
    return currentBeat?.beat_id === beatId && isPlaying;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando beats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Catálogo de Beats</h1>
          <p className="text-gray-400 text-lg">
            Explora {beats.length} beat{beats.length !== 1 ? 's' : ''} profesional{beats.length !== 1 ? 'es' : ''} listo{beats.length !== 1 ? 's' : ''} para usar
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre, género o mood..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900 border-red-900/20 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            {genres.map(genre => (
              <Button
                key={genre}
                size="sm"
                variant={selectedGenre === genre ? 'default' : 'outline'}
                className={selectedGenre === genre 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-red-900/20 text-gray-400 hover:border-red-600 hover:text-white'
                }
                onClick={() => setSelectedGenre(genre)}
              >
                {genre === 'all' ? 'Todos' : genre}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-red-900/20 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            >
              <option value="recent">Más recientes</option>
              <option value="popular">Más populares</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Mostrando {filteredBeats.length} beat{filteredBeats.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Beats Grid */}
        {filteredBeats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBeats.map((beat) => (
              <Card key={beat.beat_id} className="bg-zinc-900 border-red-900/20 hover:border-red-600/50 transition-all group">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img 
                      src={`${API}/beats/cover/${beat.cover_url.split('/').pop()}`}
                      alt={beat.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=🎵';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black/80 text-xs text-red-400 rounded-full border border-red-600/30">
                        {beat.genre}
                      </span>
                    </div>
                    {/* Play/Pause Button Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        size="lg" 
                        className={`rounded-full w-14 h-14 ${isCurrentBeatPlaying(beat.beat_id) ? 'bg-white text-black hover:bg-gray-200' : 'bg-red-600 hover:bg-red-700'}`}
                        onClick={() => handlePlayPause(beat)}
                      >
                        {isCurrentBeatPlaying(beat.beat_id) ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </Button>
                    </div>
                    {/* Playing Indicator */}
                    {isCurrentBeatPlaying(beat.beat_id) && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-red-600 rounded-full">
                        <div className="flex gap-0.5">
                          <span className="w-1 h-3 bg-white rounded-full animate-pulse"></span>
                          <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                          <span className="w-1 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                        </div>
                        <span className="text-xs text-white ml-1">Playing</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 truncate text-white">{beat.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <Music2 className="w-3 h-3" />
                      <span>{beat.bpm} BPM</span>
                      <span>•</span>
                      <span>{beat.key}</span>
                      <span>•</span>
                      <span>{beat.mood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span>{(beat.plays || 0).toLocaleString()} plays</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400">Desde</span>
                        <div className="text-xl font-bold text-red-500">${beat.price_basica}</div>
                      </div>
                      <Link to={`/beat/${beat.beat_id}`}>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          Ver Más
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Music2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {beats.length === 0 ? 'No hay beats disponibles aún' : 'No se encontraron beats'}
            </h3>
            <p className="text-gray-500">
              {beats.length === 0 
                ? 'Pronto agregaremos nuevos beats al catálogo' 
                : 'Intenta con otros filtros o términos de búsqueda'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
