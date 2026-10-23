import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { PagosyTransferencias, MiembrosdelaGuaridaVirgilio } from '@/entities';
import { Send, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function TransfersSection() {
  const [transfers, setTransfers] = useState<PagosyTransferencias[]>([]);
  const [members, setMembers] = useState<MiembrosdelaGuaridaVirgilio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTransferForm, setShowNewTransferForm] = useState(false);
  const [formData, setFormData] = useState({
    transactionType: 'Transferencia',
    senderMemberId: '',
    receiverMemberId: '',
    amount: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transfersResult, membersResult] = await Promise.all([
        BaseCrudService.getAll<PagosyTransferencias>('transferencias', {}, { limit: 100 }),
        BaseCrudService.getAll<MiembrosdelaGuaridaVirgilio>('miembros', {}, { limit: 100 })
      ]);

      setTransfers(transfersResult.items);
      setMembers(membersResult.items);
    } catch (error) {
      console.error('Error loading transfers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTransfer = async () => {
    if (!formData.senderMemberId || !formData.receiverMemberId || !formData.amount) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSubmitting(true);
    try {
      // Get sender and receiver
      const sender = members.find(m => m._id === formData.senderMemberId);
      const receiver = members.find(m => m._id === formData.receiverMemberId);

      if (!sender || !receiver) {
        console.error('Sender or receiver not found');
        return;
      }

      // Check if sender has enough points
      if ((sender.availablePoints || 0) < amount) {
        alert('El remitente no tiene suficientes puntos');
        return;
      }

      // Update sender balance
      await BaseCrudService.update<MiembrosdelaGuaridaVirgilio>('miembros', {
        _id: sender._id,
        availablePoints: (sender.availablePoints || 0) - amount,
        lastActivityDate: new Date().toISOString()
      });

      // Update receiver balance
      await BaseCrudService.update<MiembrosdelaGuaridaVirgilio>('miembros', {
        _id: receiver._id,
        availablePoints: (receiver.availablePoints || 0) + amount,
        lastActivityDate: new Date().toISOString()
      });

      // Create transfer record
      await BaseCrudService.create('transferencias', {
        _id: crypto.randomUUID(),
        transactionType: formData.transactionType,
        senderMemberId: formData.senderMemberId,
        receiverMemberId: formData.receiverMemberId,
        amount: amount,
        transactionDate: new Date().toISOString(),
        description: formData.description
      });

      setFormData({ 
        transactionType: 'Transferencia', 
        senderMemberId: '', 
        receiverMemberId: '', 
        amount: '', 
        description: '' 
      });
      setShowNewTransferForm(false);
      await loadData();
    } catch (error) {
      console.error('Error creating transfer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMemberName = (memberId?: string) => {
    if (!memberId) return 'Desconocido';
    const member = members.find(m => m._id === memberId);
    return member?.memberName || 'Desconocido';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-halloween-purple/20 rounded-xl p-8 border border-halloween-purple/40"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Send className="w-8 h-8 text-halloween-orange-light" />
            <div>
              <h2 className="font-heading text-2xl text-halloween-orange-light">Transferencias y Pagos</h2>
              <p className="font-paragraph text-foreground/60">
                Gestiona transferencias entre miembros
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewTransferForm(!showNewTransferForm)}
            className="bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
          >
            {showNewTransferForm ? 'Cancelar' : 'Nueva Transferencia'}
          </Button>
        </div>

        {showNewTransferForm && (
          <div className="mb-6 bg-halloween-purple/10 rounded-xl p-6 border border-halloween-purple/40">
            <h3 className="font-heading text-lg text-halloween-orange-light mb-4">Nueva Transferencia</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="transactionType" className="font-paragraph text-foreground">Tipo de Transacción</Label>
                <Input
                  id="transactionType"
                  value={formData.transactionType}
                  onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                  placeholder="Transferencia, Pago, etc."
                  className="mt-2 bg-halloween-purple/20 border-halloween-purple/40 text-foreground placeholder:text-foreground/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sender" className="font-paragraph text-foreground">Remitente</Label>
                  <select
                    id="sender"
                    value={formData.senderMemberId}
                    onChange={(e) => setFormData({ ...formData, senderMemberId: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-halloween-purple/40 rounded-lg font-paragraph bg-halloween-purple/20 text-foreground"
                  >
                    <option value="">Seleccionar remitente</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.memberName} ({(member.availablePoints || 0).toLocaleString()} P)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="receiver" className="font-paragraph text-foreground">Destinatario</Label>
                  <select
                    id="receiver"
                    value={formData.receiverMemberId}
                    onChange={(e) => setFormData({ ...formData, receiverMemberId: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-halloween-purple/40 rounded-lg font-paragraph bg-halloween-purple/20 text-foreground"
                  >
                    <option value="">Seleccionar destinatario</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.memberName}
                      </option>
                    ))}
                  </select>
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
                  className="mt-2 bg-halloween-purple/20 border-halloween-purple/40 text-foreground placeholder:text-foreground/40"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-paragraph text-foreground">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el motivo de la transferencia"
                  className="mt-2 bg-halloween-purple/20 border-halloween-purple/40 text-foreground placeholder:text-foreground/40"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleCreateTransfer}
                disabled={isSubmitting || !formData.senderMemberId || !formData.receiverMemberId || !formData.amount}
                className="w-full bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
              >
                {isSubmitting ? 'Procesando...' : 'Ejecutar Transferencia'}
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
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Remitente</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Destinatario</th>
                    <th className="font-heading text-right py-4 px-4 text-halloween-purple-bright">Cantidad</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer._id} className="border-b border-halloween-purple/20 hover:bg-halloween-purple/10">
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {transfer.transactionDate 
                          ? new Date(transfer.transactionDate).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {transfer.transactionType}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-foreground">
                        {getMemberName(transfer.senderMemberId)}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-foreground">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-halloween-orange-light" />
                          {getMemberName(transfer.receiverMemberId)}
                        </div>
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right font-bold text-halloween-orange-light">
                        {(transfer.amount || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground/70">
                        {transfer.description || 'Sin descripción'}
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
