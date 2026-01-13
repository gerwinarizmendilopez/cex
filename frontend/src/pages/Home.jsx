import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Download, Shield, Zap, Crown, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export const Home = () => {
  const [beats, setBeats] = useState([]);

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const response = await axios.get(`${API}/beats`);
        setBeats(response.data.beats || []);
      } catch (error) {
        console.error('Error loading beats:', error);
      }
    };
    fetchBeats();
  }, []);

  // Get cover images for the gallery
  const getGalleryImages = () => {
    if (beats.length === 0) {
      // Fallback placeholder images
      return Array(9).fill('https://via.placeholder.com/300x300?text=🎵');
    }
    // Repeat beats to fill 9 slots if needed
    const images = [];
    for (let i = 0; i < 9; i++) {
      const beat = beats[i % beats.length];
      images.push(`${API}/beats/cover/${beat.cover_url.split('/').pop()}`);
    }
    return images;
  };

  const galleryImages = getGalleryImages();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden hero-with-bg">
        <div className="absolute inset-0 hero-bg-image"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-400 font-medium">100+ Beats Profesionales</span>
            </div>
            
            <h1 className="md:text-7xl !font-bold !text-5xl mb-6">
              
              
              
              <span className="text-red-600"></span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Descarga beats listos para lanzar, monetizar y llevar tu carrera al siguiente nivel. Calidad de estudio, licencias claras, descarga inmediata.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">100+</div>
                <div className="text-sm text-gray-400 mt-1">Beats Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">500+</div>
                <div className="text-sm text-gray-400 mt-1">Artistas Confían</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">24h</div>
                <div className="text-sm text-gray-400 mt-1">Descarga Inmediata</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Beats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Beats Destacados</h2>
              <p className="text-gray-400">Los más vendidos esta semana</p>
            </div>
            <Link to="/catalogo">
              <Button variant="outline" className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white">
                Ver Todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBeats.map((beat) => <Card key={beat.id} className="bg-zinc-900 border-red-900/20 hover:border-red-600/50 transition-all group">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img src={beat.coverImage}
                    alt={beat.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="lg" className="bg-red-600 hover:bg-red-700">
                        <Play className="w-5 h-5 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{beat.name}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>{beat.bpm} BPM</span>
                      <span>{beat.genre}</span>
                      <span>{beat.key}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-500">${beat.prices.basica}</span>
                      <Link to={`/beat/${beat.id}`}>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          Ver Beat
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 value-props">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por qué estos beats son diferentes</h2>
            <p className="text-gray-400 text-lg">Todo lo que necesitas para lanzar tu música hoy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-zinc-900 rounded-xl border border-red-900/20 hover:border-red-600/50 transition-colors">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Licencias Claras</h3>
              <p className="text-gray-400">
                Sin letra pequeña. Sabes exactamente qué puedes hacer con cada beat. Contratos PDF incluidos.
              </p>
            </div>

            <div className="text-center p-8 bg-zinc-900 rounded-xl border border-red-900/20 hover:border-red-600/50 transition-colors">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Descarga Inmediata</h3>
              <p className="text-gray-400">
                Compra ahora, descarga en segundos. MP3 y WAV de alta calidad directo a tu email.
              </p>
            </div>

            <div className="text-center p-8 bg-zinc-900 rounded-xl border border-red-900/20 hover:border-red-600/50 transition-colors">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Listo para Monetizar</h3>
              <p className="text-gray-400">
                Sube a Spotify, Apple Music, YouTube. Todos los beats listos para uso comercial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-950/50 to-black border border-red-900/30 rounded-2xl p-12 text-center">
            <Crown className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              No pierdas más tiempo buscando
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Tus próximos hits están aquí. Escucha, elige y descarga en minutos.
            </p>
            <Link to="/catalogo">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg">
                Explorar Catálogo Completo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>);

};