import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { EconomaGeneral } from '@/entities';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function EconomySection() {
  const [economyData, setEconomyData] = useState<EconomaGeneral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    tipoMovimiento: 'Aumento',
    cantidadCambio: '',
    descripcion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await BaseCrudService.getAll<EconomaGeneral>('economia', {}, { limit: 50 });
      setEconomyData(result.items);
    } catch (error) {
      console.error('Error loading economy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.cantidadCambio || !formData.descripcion) return;

    setIsSubmitting(true);
    try {
      // Get the latest economy record to calculate new total
      const latestResult = await BaseCrudService.getAll<EconomaGeneral>('economia', {}, { limit: 1 });
      const currentTotal = latestResult.items.length > 0 ? latestResult.items[0].montoTotal || 0 : 0;
      const changeAmount = parseFloat(formData.cantidadCambio);
      const newTotal = formData.tipoMovimiento === 'Aumento' 
        ? currentTotal + changeAmount 
        : Math.max(0, currentTotal - changeAmount);

      await BaseCrudService.create('economia', {
        _id: crypto.randomUUID(),
        montoTotal: newTotal,
        fechaHora: new Date().toISOString(),
        tipoMovimiento: formData.tipoMovimiento,
        cantidadCambio: changeAmount,
        descripcion: formData.descripcion
      });

      setFormData({ tipoMovimiento: 'Aumento', cantidadCambio: '', descripcion: '' });
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Error adding economy record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTotal = economyData.length > 0 ? economyData[0].montoTotal || 0 : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-halloween-purple/20 rounded-xl p-8 border border-halloween-purple/40"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <DollarSign className="w-8 h-8 text-halloween-orange-light" />
            <div>
              <h2 className="font-heading text-2xl text-halloween-orange-light">Gestión de Economía</h2>
              <p className="font-paragraph text-foreground/60">
                Total actual: {currentTotal.toLocaleString()} P
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
          >
            {showAddForm ? 'Cancelar' : 'Registrar Movimiento'}
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-6 bg-halloween-purple/10 rounded-xl p-6 border border-halloween-purple/40">
            <h3 className="font-heading text-lg text-halloween-orange-light mb-4">Nuevo Movimiento Económico</h3>
            <div className="space-y-4">
              <div>
                <Label className="font-paragraph text-foreground">Tipo de Movimiento</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={formData.tipoMovimiento === 'Aumento' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, tipoMovimiento: 'Aumento' })}
                    className={formData.tipoMovimiento === 'Aumento' ? 'bg-green-500 text-white' : 'border-halloween-purple/40 text-foreground hover:bg-halloween-purple/20'}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Aumento
                  </Button>
                  <Button
                    variant={formData.tipoMovimiento === 'Disminución' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, tipoMovimiento: 'Disminución' })}
                    className={formData.tipoMovimiento === 'Disminución' ? 'bg-red-500 text-white' : 'border-halloween-purple/40 text-foreground hover:bg-halloween-purple/20'}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Disminución
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="font-paragraph text-foreground">Cantidad</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.cantidadCambio}
                  onChange={(e) => setFormData({ ...formData, cantidadCambio: e.target.value })}
                  placeholder="0"
                  className="mt-2 bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground placeholder:text-foreground/40"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-paragraph text-foreground">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe el motivo del movimiento"
                  className="mt-2 bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground placeholder:text-foreground/40 resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.cantidadCambio || !formData.descripcion}
                className="w-full bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Movimiento'}
              </Button>
            </div>
          </div>
        )}

        <div className="min-h-[300px]">
          {isLoading ? null : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-halloween-purple/40">
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Fecha</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Tipo</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Descripción</th>
                    <th className="font-heading text-right py-4 px-4 text-halloween-purple-bright">Cambio</th>
                    <th className="font-heading text-right py-4 px-4 text-halloween-purple-bright">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {economyData.map((item) => (
                    <tr key={item._id} className="border-b border-halloween-purple/20 hover:bg-halloween-purple/10">
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {item.fechaHora ? new Date(item.fechaHora).toLocaleDateString('es-ES') : 'N/A'}
                      </td>
                      <td className="font-paragraph py-4 px-4">
                        <div className="flex items-center gap-2">
                          {item.tipoMovimiento === 'Aumento' ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-sm text-foreground">{item.tipoMovimiento}</span>
                        </div>
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {item.descripcion}
                      </td>
                      <td className={`font-paragraph py-4 px-4 text-right font-bold ${
                        item.tipoMovimiento === 'Aumento' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {item.tipoMovimiento === 'Aumento' ? '+' : '-'}
                        {Math.abs(item.cantidadCambio || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right font-bold text-halloween-orange-light">
                        {(item.montoTotal || 0).toLocaleString()} P
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
