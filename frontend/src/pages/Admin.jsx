import React, { useState } from 'react';
import { Upload, Music, DollarSign, TrendingUp, Users, ShoppingBag, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { mockBeats, mockSales, dashboardStats } from '../mock';
import { toast } from 'sonner';

export const Admin = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBeat(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = (e) => {
    e.preventDefault();
    toast.success('Beat subido exitosamente (simulación)', {
      description: `"${newBeat.name}" fue agregado al catálogo`
    });
    setShowUploadForm(false);
    setNewBeat({
      name: '',
      bpm: '',
      key: '',
      mood: '',
      genre: '',
      priceBasica: '',
      pricePremium: '',
      priceExclusiva: ''
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-gray-400">Gestiona tu catálogo y ventas</p>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Subir Beat
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-zinc-900 border-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-red-500" />
                <span className="text-xs text-green-500 font-semibold">+12.5%</span>
              </div>
              <div className="text-3xl font-bold mb-1">${dashboardStats.totalSales.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Ventas Totales</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Music className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-3xl font-bold mb-1">{dashboardStats.totalBeats}</div>
              <div className="text-sm text-gray-400">Beats en Catálogo</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-red-500" />
                <span className="text-xs text-green-500 font-semibold">+8.2%</span>
              </div>
              <div className="text-3xl font-bold mb-1">{dashboardStats.totalPlays.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Reproducciones</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ShoppingBag className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-3xl font-bold mb-1">{dashboardStats.totalPurchases}</div>
              <div className="text-sm text-gray-400">Compras Totales</div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="bg-zinc-900 border-red-900/20 mb-12">
            <CardHeader>
              <CardTitle>Subir Nuevo Beat</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Nombre del Beat</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newBeat.name}
                      onChange={handleInputChange}
                      className="bg-black border-red-900/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre">Género</Label>
                    <Input
                      id="genre"
                      name="genre"
                      value={newBeat.genre}
                      onChange={handleInputChange}
                      className="bg-black border-red-900/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bpm">BPM</Label>
                    <Input
                      id="bpm"
                      name="bpm"
                      type="number"
                      value={newBeat.bpm}
                      onChange={handleInputChange}
                      className="bg-black border-red-900/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="key">Tonalidad</Label>
                    <Input
                      id="key"
                      name="key"
                      value={newBeat.key}
                      onChange={handleInputChange}
                      className="bg-black border-red-900/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mood">Mood</Label>
                    <Input
                      id="mood"
                      name="mood"
                      value={newBeat.mood}
                      onChange={handleInputChange}
                      className="bg-black border-red-900/20 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Archivo de Audio (MP3 con tag)</Label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-red-900/20 border-dashed rounded-lg hover:border-red-600/50 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label className="relative cursor-pointer rounded-md font-medium text-red-500 hover:text-red-400">
                          <span>Subir archivo</span>
                          <input type="file" className="sr-only" accept=".mp3,.wav" />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">MP3 o WAV hasta 50MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Imagen de Portada</Label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-red-900/20 border-dashed rounded-lg hover:border-red-600/50 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label className="relative cursor-pointer rounded-md font-medium text-red-500 hover:text-red-400">
                          <span>Subir imagen</span>
                          <input type="file" className="sr-only" accept="image/*" />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="priceBasica">Precio Licencia Básica ($)</Label>
                    <Input
                      id="priceBasica"
                      name="priceBasica"
                      type="number"
                      step="0.01"
                      value={newBeat.priceBasica}
                      onChange={handleInputChange}
                      className="bg-black border-red-900/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricePremium">Precio Licencia Premium ($)</Label>
                    <Input
                      id="pricePremium"
                      name="pricePremium"
                      type="number"
                      step="0.01"
                      value={newBeat.pricePremium}
                      onChange={handleInputChange}
                      className="bg-black border-red-900/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priceExclusiva">Precio Licencia Exclusiva ($)</Label>
                    <Input
                      id="priceExclusiva"
                      name="priceExclusiva"
                      type="number"
                      step="0.01"
                      value={newBeat.priceExclusiva}
                      onChange={handleInputChange}
                      className="bg-black border-red-900/20 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    Publicar Beat
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="border-red-900/20 text-gray-400"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Beats Management */}
        <Card className="bg-zinc-900 border-red-900/20 mb-12">
          <CardHeader>
            <CardTitle>Beats en Catálogo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-red-900/20">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Beat</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Género</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">BPM</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Plays</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Ventas</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Precio Base</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBeats.map((beat) => (
                    <tr key={beat.id} className="border-b border-red-900/10 hover:bg-red-950/10">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img src={beat.coverImage} alt={beat.name} className="w-12 h-12 rounded object-cover" />
                          <span className="font-medium">{beat.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-400">{beat.genre}</td>
                      <td className="py-4 px-4 text-gray-400">{beat.bpm}</td>
                      <td className="py-4 px-4 text-gray-400">{beat.plays.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-400">{beat.sales}</td>
                      <td className="py-4 px-4 text-red-500 font-semibold">${beat.prices.basica}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="border-red-900/20">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-900/20 text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="bg-zinc-900 border-red-900/20">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-black rounded-lg border border-red-900/10">
                  <div className="flex-1">
                    <h4 className="font-semibold">{sale.beatName}</h4>
                    <p className="text-sm text-gray-400">{sale.buyerEmail}</p>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-xs text-gray-400">Licencia</span>
                    <p className="font-medium capitalize">{sale.licenseType}</p>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-xs text-gray-400">Método</span>
                    <p className="font-medium">{sale.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-red-500">${sale.amount}</div>
                    <div className="text-xs text-gray-400">{sale.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};