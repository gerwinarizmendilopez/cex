import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Download, Music, FileAudio, Archive, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const [purchase, setPurchase] = useState(null);
  const [beat, setBeat] = useState(null);
  const [loading, setLoading] = useState(true);

  const purchaseId = searchParams.get('purchase_id');
  const beatId = searchParams.get('beat_id');
  const licenseType = searchParams.get('license');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del beat
        if (beatId) {
          const beatResponse = await axios.get(`${API}/beats/${beatId}`);
          setBeat(beatResponse.data);
        }
        
        // Obtener datos de la compra si hay purchase_id
        if (purchaseId) {
          try {
            const purchaseResponse = await axios.get(`${API}/payment/purchase/${purchaseId}`);
            setPurchase(purchaseResponse.data);
          } catch (err) {
            console.log('Purchase details not found, using URL params');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [beatId, purchaseId]);

  const license = purchase?.license_type || licenseType || 'basica';

  // Determinar qué archivos mostrar según la licencia
  const getAvailableFiles = () => {
    const files = [];
    
    // MP3 siempre disponible
    files.push({
      type: 'mp3',
      label: 'Archivo MP3',
      description: 'Alta calidad para streaming',
      icon: Music,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      url: beat?.audio_url
    });

    // WAV para Premium y Exclusiva
    if (license === 'premium' || license === 'exclusiva') {
      files.push({
        type: 'wav',
        label: 'Archivo WAV',
        description: 'Calidad de estudio sin compresión',
        icon: FileAudio,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        url: beat?.wav_url
      });
    }

    // Stems solo para Exclusiva
    if (license === 'exclusiva') {
      files.push({
        type: 'stems',
        label: 'Stems (RAR)',
        description: 'Pistas separadas del proyecto',
        icon: Archive,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        url: beat?.stems_url
      });
    }

    return files;
  };

  const handleDownload = (url, filename) => {
    if (!url) {
      return;
    }
    const fullUrl = `${API}${url.replace('/api', '')}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLicenseLabel = () => {
    const labels = {
      basica: 'Básica',
      premium: 'Premium',
      exclusiva: 'Exclusiva'
    };
    return labels[license] || 'Básica';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tu compra...</p>
        </div>
      </div>
    );
  }

  const availableFiles = getAvailableFiles();

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Main Title */}
        <h1 
          className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight text-center mb-6"
          style={{ fontFamily: "'Arial Black', 'Helvetica Bold', sans-serif" }}
        >
          GRACIAS POR TU COMPRA.
        </h1>

        {/* Beat Info */}
        {beat && (
          <Card className="bg-zinc-900 border-red-900/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <img 
                  src={`${API}/beats/cover/${beat.cover_url?.split('/').pop()}`}
                  alt={beat.name}
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">{beat.name}</h2>
                  <p className="text-gray-400">{beat.genre} • {beat.bpm} BPM • {beat.key}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                    license === 'exclusiva' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    license === 'premium' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {license === 'exclusiva' && '⭐ '}
                    Licencia {getLicenseLabel()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Tus archivos disponibles:</h3>
          <div className="space-y-4">
            {availableFiles.map((file) => (
              <Card 
                key={file.type} 
                className={`${file.bgColor} border ${file.borderColor} hover:scale-[1.02] transition-transform cursor-pointer`}
                onClick={() => file.url && handleDownload(file.url, `${beat?.name || 'beat'}_${file.type}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${file.bgColor} rounded-lg flex items-center justify-center`}>
                        <file.icon className={`w-6 h-6 ${file.color}`} />
                      </div>
                      <div>
                        <h4 className={`text-lg font-bold ${file.color}`}>{file.label}</h4>
                        <p className="text-gray-400 text-sm">{file.description}</p>
                      </div>
                    </div>
                    <Button 
                      className={`${file.bgColor} ${file.color} border ${file.borderColor} hover:opacity-80`}
                      disabled={!file.url}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {file.url ? 'Descargar' : 'No disponible'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* License Info */}
        <Card className="bg-zinc-900/50 border-red-900/20 mb-8">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-white mb-2">Información de tu licencia</h4>
            <p className="text-gray-400 text-sm">
              {license === 'basica' && 
                'Tu licencia Básica incluye el archivo MP3 de alta calidad. Puedes usar este beat en streaming con hasta 500,000 reproducciones. Recuerda dar crédito al productor.'}
              {license === 'premium' && 
                'Tu licencia Premium incluye archivos MP3 y WAV de calidad de estudio. Puedes usar este beat en streaming ilimitado, monetizar en YouTube y distribuir en tiendas digitales.'}
              {license === 'exclusiva' && 
                'Tu licencia Exclusiva incluye todos los archivos: MP3, WAV y Stems completos. Tienes derechos exclusivos sobre este beat. El beat ha sido retirado del catálogo y nadie más podrá comprarlo.'}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/catalogo">
            <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 px-8 py-6 text-lg">
              Explorar más beats
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto border-red-900/20 text-gray-400 hover:text-white px-8 py-6 text-lg">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
