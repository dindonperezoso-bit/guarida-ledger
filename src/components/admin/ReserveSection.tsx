import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { ReservaBancaria } from '@/entities';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ReserveSection() {
  const [movements, setMovements] = useState<ReservaBancaria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    movementType: 'Entrada',
    amount: '',
    description: '',
    responsibleUser: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await BaseCrudService.getAll<ReservaBancaria>('reserva', {}, { limit: 50 });
      setMovements(result.items);
    } catch (error) {
      console.error('Error loading reserve data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description || !formData.responsibleUser) return;

    setIsSubmitting(true);
    try {
      // Get the latest reserve movement to calculate new balance
      const latestResult = await BaseCrudService.getAll<ReservaBancaria>('reserva', {}, { limit: 1 });
      const currentBalance = latestResult.items.length > 0 ? latestResult.items[0].currentReserveBalance || 0 : 0;
      const changeAmount = parseFloat(formData.amount);
      const newBalance = formData.movementType === 'Entrada' 
        ? currentBalance + changeAmount 
        : Math.max(0, currentBalance - changeAmount);

      await BaseCrudService.create('reserva', {
        _id: crypto.randomUUID(),
        movementType: formData.movementType,
        amount: changeAmount,
        movementDateTime: new Date().toISOString(),
        currentReserveBalance: newBalance,
        description: formData.description,
        responsibleUser: formData.responsibleUser
      });

      setFormData({ movementType: 'Entrada', amount: '', description: '', responsibleUser: '' });
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Error adding reserve movement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentBalance = movements.length > 0 ? movements[0].currentReserveBalance || 0 : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-halloween-purple/20 rounded-xl p-8 border border-halloween-purple/40"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Wallet className="w-8 h-8 text-halloween-orange-light" />
            <div>
              <h2 className="font-heading text-2xl text-halloween-orange-light">Gestión de Reserva</h2>
              <p className="font-paragraph text-foreground/60">
                Saldo actual: {currentBalance.toLocaleString()} P
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
            <h3 className="font-heading text-lg text-halloween-orange-light mb-4">Nuevo Movimiento de Reserva</h3>
            <div className="space-y-4">
              <div>
                <Label className="font-paragraph text-foreground">Tipo de Movimiento</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={formData.movementType === 'Entrada' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, movementType: 'Entrada' })}
                    className={formData.movementType === 'Entrada' ? 'bg-green-500 text-white' : 'border-halloween-purple/40 text-foreground hover:bg-halloween-purple/20'}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Entrada
                  </Button>
                  <Button
                    variant={formData.movementType === 'Salida' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, movementType: 'Salida' })}
                    className={formData.movementType === 'Salida' ? 'bg-red-500 text-white' : 'border-halloween-purple/40 text-foreground hover:bg-halloween-purple/20'}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Salida
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="font-paragraph text-foreground">Cantidad</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className="mt-2 bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground placeholder:text-foreground/40"
                />
              </div>

              <div>
                <Label htmlFor="responsible" className="font-paragraph text-foreground">Usuario Responsable</Label>
                <Input
                  id="responsible"
                  value={formData.responsibleUser}
                  onChange={(e) => setFormData({ ...formData, responsibleUser: e.target.value })}
                  placeholder="Nombre del responsable"
                  className="mt-2 bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground placeholder:text-foreground/40"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-paragraph text-foreground">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el motivo del movimiento"
                  className="mt-2 bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground placeholder:text-foreground/40 resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.amount || !formData.description || !formData.responsibleUser}
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
                    <th className="font-heading text-right py-4 px-4 text-halloween-purple-bright">Monto</th>
                    <th className="font-heading text-right py-4 px-4 text-halloween-purple-bright">Saldo</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement._id} className="border-b border-halloween-purple/20 hover:bg-halloween-purple/10">
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {movement.movementDateTime 
                          ? new Date(movement.movementDateTime).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </td>
                      <td className="font-paragraph py-4 px-4">
                        <div className="flex items-center gap-2">
                          {movement.movementType === 'Entrada' ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-sm text-foreground">{movement.movementType}</span>
                        </div>
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {movement.description}
                      </td>
                      <td className={`font-paragraph py-4 px-4 text-right font-bold ${
                        movement.movementType === 'Entrada' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {movement.movementType === 'Entrada' ? '+' : '-'}
                        {Math.abs(movement.amount || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right font-bold text-halloween-orange-light">
                        {(movement.currentReserveBalance || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm">
                        {movement.responsibleUser}
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
