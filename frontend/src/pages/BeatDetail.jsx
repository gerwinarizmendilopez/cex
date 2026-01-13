import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Download, Shield, Music2, Clock, Gauge, Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AudioPlayer } from '../components/AudioPlayer';
import { mockBeats, licenseTypes } from '../mock';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';

export const BeatDetail = () => {
  const { id } = useParams();
  const beat = mockBeats.find(b => b.id === id);
  const [selectedLicense, setSelectedLicense] = useState('basica');
  const { addToCart, isInCart } = useCart();

  if (!beat) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Beat no encontrado</h2>
          <Link to="/catalogo">
            <Button className="bg-red-600 hover:bg-red-700">Volver al Catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePurchase = () => {
    toast.success(`¡Compra simulada! Beat "${beat.name}" con licencia ${licenseTypes[selectedLicense].name}`, {
      description: 'En producción, esto procesará el pago real y enviará el beat por email.'
    });
  };

  const handleAddToCart = () => {
    addToCart(beat, selectedLicense);
  };

  const inCart = isInCart(beat.id, selectedLicense);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/catalogo" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Beat Info & Player */}
          <div>
            <div className="relative rounded-xl overflow-hidden mb-6">
              <img 
                src={beat.coverImage} 
                alt={beat.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
                  {beat.genre}
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4">{beat.name}</h1>
            <p className="text-gray-400 mb-6">Por {beat.producer}</p>

            {/* Beat Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-900 border border-red-900/20 rounded-lg p-4 text-center">
                <Gauge className="w-5 h-5 text-red-500 mx-auto mb-2" />
                <div className="text-lg font-bold">{beat.bpm}</div>
                <div className="text-xs text-gray-400">BPM</div>
              </div>
              <div className="bg-zinc-900 border border-red-900/20 rounded-lg p-4 text-center">
                <Music2 className="w-5 h-5 text-red-500 mx-auto mb-2" />
                <div className="text-lg font-bold">{beat.key}</div>
                <div className="text-xs text-gray-400">Tonalidad</div>
              </div>
              <div className="bg-zinc-900 border border-red-900/20 rounded-lg p-4 text-center">
                <Clock className="w-5 h-5 text-red-500 mx-auto mb-2" />
                <div className="text-lg font-bold">{beat.duration}</div>
                <div className="text-xs text-gray-400">Duración</div>
              </div>
              <div className="bg-zinc-900 border border-red-900/20 rounded-lg p-4 text-center">
                <Sparkles className="w-5 h-5 text-red-500 mx-auto mb-2" />
                <div className="text-lg font-bold">{beat.mood}</div>
                <div className="text-xs text-gray-400">Mood</div>
              </div>
            </div>

            {/* Audio Player */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Escucha el Preview</h3>
              <AudioPlayer src={beat.audioPreviewUrl} beatName={beat.name} />
            </div>

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {beat.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-red-950/30 border border-red-900/30 text-red-400 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Licenses & Purchase */}
          <div>
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Elige tu licencia</h2>

              <div className="space-y-4 mb-8">
                {/* Basica */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedLicense === 'basica'
                      ? 'bg-red-950/30 border-red-600'
                      : 'bg-zinc-900 border-red-900/20 hover:border-red-600/50'
                  }`}
                  onClick={() => setSelectedLicense('basica')}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{licenseTypes.basica.name}</CardTitle>
                        <p className="text-sm text-gray-400 mt-1">Para lanzamientos digitales</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-500">${beat.prices.basica}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {licenseTypes.basica.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Premium */}
                <Card 
                  className={`cursor-pointer transition-all relative overflow-hidden ${
                    selectedLicense === 'premium'
                      ? 'bg-red-950/30 border-red-600'
                      : 'bg-zinc-900 border-red-900/20 hover:border-red-600/50'
                  }`}
                  onClick={() => setSelectedLicense('premium')}
                >
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    MÁS POPULAR
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{licenseTypes.premium.name}</CardTitle>
                        <p className="text-sm text-gray-400 mt-1">Para artistas serios</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-500">${beat.prices.premium}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {licenseTypes.premium.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Exclusiva */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedLicense === 'exclusiva'
                      ? 'bg-red-950/30 border-red-600'
                      : 'bg-zinc-900 border-red-900/20 hover:border-red-600/50'
                  }`}
                  onClick={() => setSelectedLicense('exclusiva')}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{licenseTypes.exclusiva.name}</CardTitle>
                        <p className="text-sm text-gray-400 mt-1">Derechos completos</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-500">${beat.prices.exclusiva}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {licenseTypes.exclusiva.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                onClick={handlePurchase}
              >
                <Download className="w-5 h-5 mr-2" />
                Comprar Ahora - ${beat.prices[selectedLicense]}
              </Button>

              <div className="mt-6 p-4 bg-zinc-900 border border-red-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-400">
                    <p className="font-semibold text-white mb-1">Compra 100% Segura</p>
                    <p>Descarga inmediata por email. Contrato PDF incluido. Soporte 24/7.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};