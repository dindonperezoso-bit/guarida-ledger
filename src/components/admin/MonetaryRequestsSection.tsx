import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { SolicitudesMonetarias, EmisionesMonetarias } from '@/entities';
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function MonetaryRequestsSection() {
  const [requests, setRequests] = useState<SolicitudesMonetarias[]>([]);
  const [emissions, setEmissions] = useState<EmisionesMonetarias[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    requestedAmount: '',
    reason: '',
    requester: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsResult, emissionsResult] = await Promise.all([
        BaseCrudService.getAll<SolicitudesMonetarias>('solicitudesmonetarias', {}, { limit: 50 }),
        BaseCrudService.getAll<EmisionesMonetarias>('emisiones', {}, { limit: 50 })
      ]);

      setRequests(requestsResult.items);
      setEmissions(emissionsResult.items);
    } catch (error) {
      console.error('Error loading monetary requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!formData.requestedAmount || !formData.reason || !formData.requester) return;

    setIsSubmitting(true);
    try {
      await BaseCrudService.create('solicitudesmonetarias', {
        _id: crypto.randomUUID(),
        requestedAmount: parseFloat(formData.requestedAmount),
        reason: formData.reason,
        requester: formData.requester,
        requestDate: new Date().toISOString(),
        status: 'Pendiente',
        approverComments: ''
      });

      setFormData({ requestedAmount: '', reason: '', requester: '' });
      setShowNewRequestForm(false);
      await loadData();
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveRequest = async (request: SolicitudesMonetarias) => {
    try {
      await BaseCrudService.update<SolicitudesMonetarias>('solicitudesmonetarias', {
        _id: request._id,
        status: 'Aprobada',
        approverComments: 'Aprobada por el presidente'
      });

      await loadData();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (request: SolicitudesMonetarias) => {
    try {
      await BaseCrudService.update<SolicitudesMonetarias>('solicitudesmonetarias', {
        _id: request._id,
        status: 'Rechazada',
        approverComments: 'Rechazada por el presidente'
      });

      await loadData();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleExecuteEmission = async (request: SolicitudesMonetarias) => {
    try {
      // Create emission record
      await BaseCrudService.create('emisiones', {
        _id: crypto.randomUUID(),
        transactionId: `EMI-${Date.now()}`,
        amountEmitted: request.requestedAmount,
        executionDate: new Date().toISOString(),
        reason: request.reason,
        approvingAuthorities: 'Presidente',
        issuedBy: 'Sistema',
        status: 'Ejecutada'
      });

      // Update request status
      await BaseCrudService.update<SolicitudesMonetarias>('solicitudesmonetarias', {
        _id: request._id,
        status: 'Ejecutada'
      });

      await loadData();
    } catch (error) {
      console.error('Error executing emission:', error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Aprobada':
        return 'bg-green-100 text-green-700';
      case 'Rechazada':
        return 'bg-red-100 text-red-700';
      case 'Ejecutada':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Requests Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <DollarSign className="w-8 h-8 text-accent-gold" />
            <div>
              <h2 className="font-heading text-2xl text-foreground">Solicitudes de Emisión Monetaria</h2>
              <p className="font-paragraph text-foreground/60">
                Gestiona las solicitudes de creación de nuevos Puntos
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewRequestForm(!showNewRequestForm)}
            className="bg-accent-gold text-dark-night-blue hover:bg-accent-gold/90"
          >
            {showNewRequestForm ? 'Cancelar' : 'Nueva Solicitud'}
          </Button>
        </div>

        {showNewRequestForm && (
          <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-heading text-lg text-foreground mb-4">Nueva Solicitud de Emisión</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="font-paragraph">Cantidad Solicitada</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.requestedAmount}
                  onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="requester" className="font-paragraph">Solicitante</Label>
                <Input
                  id="requester"
                  value={formData.requester}
                  onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                  placeholder="Nombre del solicitante"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="reason" className="font-paragraph">Motivo</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe el motivo de la solicitud"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleCreateRequest}
                disabled={isSubmitting || !formData.requestedAmount || !formData.reason || !formData.requester}
                className="w-full bg-accent-gold text-dark-night-blue hover:bg-accent-gold/90"
              >
                {isSubmitting ? 'Creando...' : 'Crear Solicitud'}
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
                    <th className="font-heading text-left py-4 px-4">Solicitante</th>
                    <th className="font-heading text-right py-4 px-4">Cantidad</th>
                    <th className="font-heading text-left py-4 px-4">Motivo</th>
                    <th className="font-heading text-center py-4 px-4">Estado</th>
                    <th className="font-heading text-center py-4 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="font-paragraph py-4 px-4 text-sm">
                        {request.requestDate 
                          ? new Date(request.requestDate).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </td>
                      <td className="font-paragraph py-4 px-4">
                        {request.requester}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right font-bold text-accent-gold">
                        {(request.requestedAmount || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm">
                        {request.reason}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="font-paragraph py-4 px-4">
                        <div className="flex gap-2 justify-center">
                          {request.status === 'Pendiente' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveRequest(request)}
                                className="bg-green-500 text-white hover:bg-green-600"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRejectRequest(request)}
                                className="bg-red-500 text-white hover:bg-red-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {request.status === 'Aprobada' && (
                            <Button
                              size="sm"
                              onClick={() => handleExecuteEmission(request)}
                              className="bg-accent-gold text-dark-night-blue hover:bg-accent-gold/90"
                            >
                              Ejecutar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Emissions History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-8 border border-gray-200"
      >
        <h3 className="font-heading text-xl text-foreground mb-6">Historial de Emisiones Ejecutadas</h3>
        
        <div className="min-h-[200px]">
          {isLoading ? null : emissions.length === 0 ? (
            <p className="font-paragraph text-foreground/60 text-center py-8">
              No hay emisiones ejecutadas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="font-heading text-left py-4 px-4">ID Transacción</th>
                    <th className="font-heading text-left py-4 px-4">Fecha</th>
                    <th className="font-heading text-right py-4 px-4">Cantidad</th>
                    <th className="font-heading text-left py-4 px-4">Motivo</th>
                    <th className="font-heading text-left py-4 px-4">Autorizado Por</th>
                  </tr>
                </thead>
                <tbody>
                  {emissions.map((emission) => (
                    <tr key={emission._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="font-paragraph py-4 px-4 text-sm font-mono">
                        {emission.transactionId}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm">
                        {emission.executionDate 
                          ? new Date(emission.executionDate).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right font-bold text-accent-gold">
                        {(emission.amountEmitted || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm">
                        {emission.reason}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm">
                        {emission.approvingAuthorities}
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
