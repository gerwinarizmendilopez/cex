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
      {/* Hero Section - EDM Ghost Style */}
      <section className="relative min-h-screen flex items-center justify-start px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image - B&W Beatmaker */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1920&q=80')`,
            filter: 'grayscale(100%) brightness(0.3)'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="max-w-2xl">
            {/* Subtitle */}
            <p className="text-gray-400 text-lg md:text-xl mb-4 font-light tracking-wide">
              Vive la experiencia de ser uno de los grandes de la industria
            </p>
            
            {/* Main Title */}
            <h1 
              className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight mb-12"
              style={{ fontFamily: "'Arial Black', 'Helvetica Bold', sans-serif" }}
            >
              HØME.
            </h1>
            
            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-8">
              <Link 
                to="/catalogo"
                className="group relative text-white text-sm font-medium tracking-widest uppercase"
              >
                <span className="relative z-10">CONÓCENOS</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              
              <Link 
                to="/contacto"
                className="group relative text-white text-sm font-medium tracking-widest uppercase border border-white/30 px-6 py-3 rounded-sm hover:bg-white hover:text-black transition-all duration-300"
              >
                <span>QUIERO UN BEAT PERSONALIZADO</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Beats - BeatStars Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            {/* Left Side - Text Content */}
            <div className="space-y-6">
              <span className="text-gray-400 text-sm tracking-widest font-medium">
                ESTO ES HOME.
              </span>
              
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight" style={{ fontFamily: "'Arial Black', 'Helvetica Bold', sans-serif" }}>
                TU PROXIMO HIT ESTA AQUÍ.
              </h2>
              
              <p className="text-gray-400 text-lg max-w-md">
                Descubre dentro del catálogo el beat perfecto para tu canción.
              </p>
              
              <Link to="/catalogo">
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white hover:text-black px-8 py-6 text-base rounded-sm transition-all duration-300 group"
                >
                  Explorar Catálogo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            {/* Right Side - Animated Gallery */}
            <div className="relative h-[500px] lg:h-[600px] overflow-hidden">
              {/* Gradient overlays for smooth edges */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
              
              <div className="flex gap-4 h-full">
                {/* Column 1 - Scrolls Down */}
                <div className="flex-1 overflow-hidden">
                  <div className="animate-scroll-down flex flex-col gap-4">
                    {[...galleryImages.slice(0, 3), ...galleryImages.slice(0, 3)].map((img, idx) => (
                      <div key={`col1-${idx}`} className="aspect-square rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={img} 
                          alt={`Beat ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=🎵'; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Column 2 - Scrolls Up */}
                <div className="flex-1 overflow-hidden">
                  <div className="animate-scroll-up flex flex-col gap-4">
                    {[...galleryImages.slice(3, 6), ...galleryImages.slice(3, 6)].map((img, idx) => (
                      <div key={`col2-${idx}`} className="aspect-square rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={img} 
                          alt={`Beat ${idx + 4}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=🎵'; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Column 3 - Scrolls Down */}
                <div className="flex-1 overflow-hidden">
                  <div className="animate-scroll-down-slow flex flex-col gap-4">
                    {[...galleryImages.slice(6, 9), ...galleryImages.slice(6, 9)].map((img, idx) => (
                      <div key={`col3-${idx}`} className="aspect-square rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={img} 
                          alt={`Beat ${idx + 7}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=🎵'; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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