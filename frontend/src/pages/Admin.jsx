import React, { useState, useEffect, useRef } from 'react';
import { Upload, Music, DollarSign, TrendingUp, ShoppingBag, Plus, Trash2, X, Check, User, Mail, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('beats'); // 'beats' | 'sales'
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [beats, setBeats] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [newBeat, setNewBeat] = useState({
    name: '',
    bpm: '',
    key: '',
    mood: '',
    genre: '',
    priceBasica: '',
    pricePremium: '',
    priceExclusiva: ''
  });
  
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    fetchBeats();
    fetchSales();
  }, []);

  const fetchBeats = async () => {
    try {
      const response = await axios.get(`${API}/beats`);
      setBeats(response.data.beats || []);
    } catch (error) {
      console.error('Error cargando beats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API}/payment/sales`);
      setSales(response.data.sales || []);
    } catch (error) {
      console.error('Error cargando ventas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBeat(prev => ({ ...prev, [name]: value }));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
        toast.error('Por favor selecciona un archivo MP3 o WAV');
        return;
      }
      setAudioFile(file);
      setAudioPreview(file.name);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida');
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!audioFile) {
      toast.error('Por favor selecciona un archivo de audio');
      return;
    }
    if (!coverFile) {
      toast.error('Por favor selecciona una imagen de portada');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', newBeat.name);
      formData.append('genre', newBeat.genre);
      formData.append('bpm', newBeat.bpm);
      formData.append('key', newBeat.key);
      formData.append('mood', newBeat.mood);
      formData.append('price_basica', newBeat.priceBasica);
      formData.append('price_premium', newBeat.pricePremium);
      formData.append('price_exclusiva', newBeat.priceExclusiva);
      formData.append('audio_file', audioFile);
      formData.append('cover_file', coverFile);
      
      await axios.post(`${API}/beats/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('¡Beat publicado exitosamente!');
      
      setShowUploadForm(false);
      setNewBeat({ name: '', bpm: '', key: '', mood: '', genre: '', priceBasica: '', pricePremium: '', priceExclusiva: '' });
      setAudioFile(null);
      setCoverFile(null);
      setAudioPreview(null);
      setCoverPreview(null);
      fetchBeats();
      
    } catch (error) {
      console.error('Error subiendo beat:', error);
      toast.error('Error al subir el beat');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBeat = async (beatId, beatName) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${beatName}"?`)) return;
    
    try {
      await axios.delete(`${API}/beats/${beatId}`);
      toast.success('Beat eliminado');
      fetchBeats();
    } catch (error) {
      toast.error('Error al eliminar el beat');
    }
  };

  const totalBeats = beats.length;
  const totalPlays = beats.reduce((sum, b) => sum + (b.plays || 0), 0);
  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);

  const licenseColors = {
    basica: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    exclusiva: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-gray-400">Gestiona tu catálogo y ventas</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700" onClick={() => setShowUploadForm(!showUploadForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Subir Beat
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-zinc-900 border-red-900/20">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-red-500 mb-2" />
              <div className="text-3xl font-bold mb-1">${totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Ingresos Totales</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-red-900/20">
            <CardContent className="p-6">
              <Music className="w-8 h-8 text-red-500 mb-2" />
              <div className="text-3xl font-bold mb-1">{totalBeats}</div>
              <div className="text-sm text-gray-400">Beats en Catálogo</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-red-900/20">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-red-500 mb-2" />
              <div className="text-3xl font-bold mb-1">{totalPlays.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Reproducciones</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-red-900/20">
            <CardContent className="p-6">
              <ShoppingBag className="w-8 h-8 text-red-500 mb-2" />
              <div className="text-3xl font-bold mb-1">{totalSalesCount}</div>
              <div className="text-sm text-gray-400">Ventas Totales</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'beats' ? 'default' : 'outline'}
            className={activeTab === 'beats' ? 'bg-red-600' : 'border-red-900/20 text-gray-400'}
            onClick={() => setActiveTab('beats')}
          >
            <Music className="w-4 h-4 mr-2" />
            Beats ({totalBeats})
          </Button>
          <Button
            variant={activeTab === 'sales' ? 'default' : 'outline'}
            className={activeTab === 'sales' ? 'bg-red-600' : 'border-red-900/20 text-gray-400'}
            onClick={() => setActiveTab('sales')}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Ventas ({totalSalesCount})
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="bg-zinc-900 border-red-900/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Subir Nuevo Beat</span>
                <Button variant="ghost" size="sm" onClick={() => setShowUploadForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Nombre del Beat *</Label>
                    <Input id="name" name="name" value={newBeat.name} onChange={handleInputChange}
                      className="bg-black border-red-900/20" placeholder="Ej: Midnight Trap" required />
                  </div>
                  <div>
                    <Label htmlFor="genre">Género *</Label>
                    <Input id="genre" name="genre" value={newBeat.genre} onChange={handleInputChange}
                      className="bg-black border-red-900/20" placeholder="Ej: Trap, Reggaeton" required />
                  </div>
                  <div>
                    <Label htmlFor="bpm">BPM *</Label>
                    <Input id="bpm" name="bpm" type="number" value={newBeat.bpm} onChange={handleInputChange}
                      className="bg-black border-red-900/20" placeholder="140" required />
                  </div>
                  <div>
                    <Label htmlFor="key">Tonalidad *</Label>
                    <Input id="key" name="key" value={newBeat.key} onChange={handleInputChange}
                      className="bg-black border-red-900/20" placeholder="C Minor" required />
                  </div>
                  <div>
                    <Label htmlFor="mood">Mood *</Label>
                    <Input id="mood" name="mood" value={newBeat.mood} onChange={handleInputChange}
                      className="bg-black border-red-900/20" placeholder="Dark, Energetic" required />
                  </div>
                </div>

                {/* Audio Upload */}
                <div>
                  <Label>Archivo de Audio (MP3/WAV) *</Label>
                  <div 
                    className={`mt-2 flex justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer ${
                      audioFile ? 'border-green-600/50 bg-green-950/10' : 'border-red-900/20 hover:border-red-600/50'
                    }`}
                    onClick={() => audioInputRef.current?.click()}
                  >
                    {audioFile ? (
                      <div className="text-center">
                        <Check className="mx-auto h-8 w-8 text-green-500" />
                        <p className="text-sm text-green-400 mt-2">{audioPreview}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-400 mt-2">Click para seleccionar</p>
                      </div>
                    )}
                  </div>
                  <input ref={audioInputRef} type="file" className="hidden" accept=".mp3,.wav" onChange={handleAudioChange} />
                </div>

                {/* Cover Upload */}
                <div>
                  <Label>Imagen de Portada *</Label>
                  <div 
                    className={`mt-2 flex justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer ${
                      coverFile ? 'border-green-600/50 bg-green-950/10' : 'border-red-900/20 hover:border-red-600/50'
                    }`}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-400 mt-2">Click para seleccionar</p>
                      </div>
                    )}
                  </div>
                  <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="priceBasica">Licencia Básica ($) *</Label>
                    <Input id="priceBasica" name="priceBasica" type="number" step="0.01" value={newBeat.priceBasica}
                      onChange={handleInputChange} className="bg-black border-red-900/20" placeholder="29.99" required />
                  </div>
                  <div>
                    <Label htmlFor="pricePremium">Licencia Premium ($) *</Label>
                    <Input id="pricePremium" name="pricePremium" type="number" step="0.01" value={newBeat.pricePremium}
                      onChange={handleInputChange} className="bg-black border-red-900/20" placeholder="79.99" required />
                  </div>
                  <div>
                    <Label htmlFor="priceExclusiva">Licencia Exclusiva ($) *</Label>
                    <Input id="priceExclusiva" name="priceExclusiva" type="number" step="0.01" value={newBeat.priceExclusiva}
                      onChange={handleInputChange} className="bg-black border-red-900/20" placeholder="299.99" required />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={uploading}>
                    {uploading ? 'Subiendo...' : 'Publicar Beat'}
                  </Button>
                  <Button type="button" variant="outline" className="border-red-900/20" onClick={() => setShowUploadForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Content based on active tab */}
        {activeTab === 'beats' && (
          <Card className="bg-zinc-900 border-red-900/20">
            <CardHeader>
              <CardTitle>Beats en Catálogo</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                </div>
              ) : beats.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No hay beats en el catálogo</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-red-900/20">
                        <th className="text-left py-3 px-4 text-sm text-gray-400">Beat</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400">Género</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400">BPM</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400">Plays</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400">Precio Base</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-400">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {beats.map((beat) => (
                        <tr key={beat.beat_id} className="border-b border-red-900/10 hover:bg-red-950/10">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={`${API}/beats/cover/${beat.cover_url?.split('/').pop()}`} 
                                alt={beat.name}
                                className="w-12 h-12 rounded object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                              />
                              <span className="font-medium">{beat.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-400">{beat.genre}</td>
                          <td className="py-4 px-4 text-gray-400">{beat.bpm}</td>
                          <td className="py-4 px-4 text-gray-400">{beat.plays || 0}</td>
                          <td className="py-4 px-4 text-red-500 font-semibold">${beat.price_basica}</td>
                          <td className="py-4 px-4 text-right">
                            <Button size="sm" variant="outline" className="border-red-900/20 text-red-500"
                              onClick={() => handleDeleteBeat(beat.beat_id, beat.name)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'sales' && (
          <Card className="bg-zinc-900 border-red-900/20">
            <CardHeader>
              <CardTitle>Historial de Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No hay ventas registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-red-900/20">
                        <th className="text-left py-3 px-4 text-sm text-gray-400">Fecha</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400">Beat</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400">Comprador</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400">Email</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400">Licencia</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-400">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale, index) => (
                        <tr key={sale.payment_intent_id || index} className="border-b border-red-900/10 hover:bg-red-950/10">
                          <td className="py-4 px-4 text-gray-400 text-sm">
                            {formatDate(sale.created_at)}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium">{sale.beat_name}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-white">{sale.buyer_name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-400">{sale.buyer_email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${licenseColors[sale.license_type] || 'bg-gray-500/20 text-gray-400'}`}>
                              {sale.license_type === 'exclusiva' && '⭐ '}
                              {sale.license_type?.charAt(0).toUpperCase() + sale.license_type?.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-green-500 font-bold">${sale.amount?.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
