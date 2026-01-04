import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Music2, Filter, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { mockBeats } from '../mock';

export const Catalogo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const genres = ['all', 'Trap', 'Reggaeton', 'R&B', 'Hip Hop', 'Drill', 'Lo-Fi', 'Afrobeat'];

  const filteredBeats = mockBeats
    .filter(beat => {
      const matchesSearch = beat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           beat.genre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || beat.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.prices.basica - b.prices.basica;
      if (sortBy === 'price-high') return b.prices.basica - a.prices.basica;
      if (sortBy === 'popular') return b.plays - a.plays;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Catálogo de Beats</h1>
          <p className="text-gray-400 text-lg">Explora {mockBeats.length} beats profesionales listos para usar</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre o género..."
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
              <Card key={beat.id} className="bg-zinc-900 border-red-900/20 hover:border-red-600/50 transition-all group">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img 
                      src={beat.coverImage} 
                      alt={beat.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black/80 text-xs text-red-400 rounded-full border border-red-600/30">
                        {beat.genre}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="lg" className="bg-red-600 hover:bg-red-700">
                        <Play className="w-5 h-5 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 truncate">{beat.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <Music2 className="w-3 h-3" />
                      <span>{beat.bpm} BPM</span>
                      <span>•</span>
                      <span>{beat.key}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span>{beat.plays.toLocaleString()} plays</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400">Desde</span>
                        <div className="text-xl font-bold text-red-500">${beat.prices.basica}</div>
                      </div>
                      <Link to={`/beat/${beat.id}`}>
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
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No se encontraron beats</h3>
            <p className="text-gray-500">Intenta con otros filtros o términos de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};