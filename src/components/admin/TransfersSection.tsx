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
        className="bg-white rounded-xl p-8 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Send className="w-8 h-8 text-secondary" />
            <div>
              <h2 className="font-heading text-2xl text-foreground">Transferencias y Pagos</h2>
              <p className="font-paragraph text-foreground/60">
                Gestiona transferencias entre miembros
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewTransferForm(!showNewTransferForm)}
            className="bg-secondary text-secondary-foreground"
          >
            {showNewTransferForm ? 'Cancelar' : 'Nueva Transferencia'}
          </Button>
        </div>

        {showNewTransferForm && (
          <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-heading text-lg text-foreground mb-4">Nueva Transferencia</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="transactionType" className="font-paragraph">Tipo de Transacción</Label>
                <Input
                  id="transactionType"
                  value={formData.transactionType}
                  onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                  placeholder="Transferencia, Pago, etc."
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sender" className="font-paragraph">Remitente</Label>
                  <select
                    id="sender"
                    value={formData.senderMemberId}
                    onChange={(e) => setFormData({ ...formData, senderMemberId: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg font-paragraph"
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
                  <Label htmlFor="receiver" className="font-paragraph">Destinatario</Label>
                  <select
                    id="receiver"
                    value={formData.receiverMemberId}
                    onChange={(e) => setFormData({ ...formData, receiverMemberId: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg font-paragraph"
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
                <Label htmlFor="amount" className="font-paragraph">Cantidad</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-paragraph">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el motivo de la transferencia"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleCreateTransfer}
                disabled={isSubmitting || !formData.senderMemberId || !formData.receiverMemberId || !formData.amount}
                className="w-full bg-secondary text-secondary-foreground"
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
                  <tr className="border-b border-gray-200">
                    <th className="font-heading text-left py-4 px-4">Fecha</th>
                    <th className="font-heading text-left py-4 px-4">Tipo</th>
                    <th className="font-heading text-left py-4 px-4">Remitente</th>
                    <th className="font-heading text-left py-4 px-4">Destinatario</th>
                    <th className="font-heading text-right py-4 px-4">Cantidad</th>
                    <th className="font-heading text-left py-4 px-4">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="font-paragraph py-4 px-4 text-sm">
                        {transfer.transactionDate 
                          ? new Date(transfer.transactionDate).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm">
                        {transfer.transactionType}
                      </td>
                      <td className="font-paragraph py-4 px-4">
                        {getMemberName(transfer.senderMemberId)}
                      </td>
                      <td className="font-paragraph py-4 px-4">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-secondary" />
                          {getMemberName(transfer.receiverMemberId)}
                        </div>
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right font-bold text-secondary">
                        {(transfer.amount || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm">
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
