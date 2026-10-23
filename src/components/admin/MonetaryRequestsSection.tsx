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
      // Reload immediately without setTimeout to prevent UI freeze
      loadData();
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

      // Reload immediately without setTimeout to prevent UI freeze
      loadData();
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

      // Reload immediately without setTimeout to prevent UI freeze
      loadData();
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

      // Reload immediately without setTimeout to prevent UI freeze
      loadData();
    } catch (error) {
      console.error('Error executing emission:', error);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Aprobada':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Rechazada':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Ejecutada':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-halloween-purple/20 rounded-xl p-8 border border-halloween-purple/40"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <DollarSign className="w-8 h-8 text-halloween-orange-light" />
            <div>
              <h2 className="font-heading text-2xl text-halloween-orange-light">Solicitudes Monetarias</h2>
              <p className="font-paragraph text-foreground/60">
                Gestiona solicitudes de emisión monetaria
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewRequestForm(!showNewRequestForm)}
            className="bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
          >
            {showNewRequestForm ? 'Cancelar' : 'Nueva Solicitud'}
          </Button>
        </div>

        {showNewRequestForm && (
          <div className="mb-6 bg-halloween-purple/10 rounded-xl p-6 border border-halloween-purple/40">
            <h3 className="font-heading text-lg text-halloween-orange-light mb-4">Nueva Solicitud de Emisión</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="font-paragraph text-foreground">Cantidad Solicitada</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.requestedAmount}
                  onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                  placeholder="0"
                  className="mt-2 bg-halloween-purple/20 border-halloween-purple/40 text-foreground placeholder:text-foreground/40"
                />
              </div>

              <div>
                <Label htmlFor="reason" className="font-paragraph text-foreground">Motivo de la Solicitud</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe el motivo de la solicitud"
                  className="mt-2 bg-halloween-purple/20 border-halloween-purple/40 text-foreground placeholder:text-foreground/40"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="requester" className="font-paragraph text-foreground">Solicitante</Label>
                <Input
                  id="requester"
                  value={formData.requester}
                  onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                  placeholder="Nombre del solicitante"
                  className="mt-2 bg-halloween-purple/20 border-halloween-purple/40 text-foreground placeholder:text-foreground/40"
                />
              </div>

              <Button
                onClick={handleCreateRequest}
                disabled={isSubmitting || !formData.requestedAmount || !formData.reason || !formData.requester}
                className="w-full bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
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
                  <tr className="border-b border-halloween-purple/40">
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Fecha</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Solicitante</th>
                    <th className="font-heading text-right py-4 px-4 text-halloween-purple-bright">Cantidad</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Motivo</th>
                    <th className="font-heading text-center py-4 px-4 text-halloween-purple-bright">Estado</th>
                    <th className="font-heading text-center py-4 px-4 text-halloween-purple-bright">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id} className="border-b border-halloween-purple/20 hover:bg-halloween-purple/10">
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {request.requestDate 
                          ? new Date(request.requestDate).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-foreground">
                        {request.requester}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right font-bold text-halloween-orange-light">
                        {(request.requestedAmount || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground/70">
                        {request.reason}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
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
                              className="bg-blue-500 text-white hover:bg-blue-600"
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
        className="bg-halloween-purple/20 rounded-xl p-8 border border-halloween-purple/40"
      >
        <h3 className="font-heading text-2xl text-halloween-orange-light mb-6">Historial de Emisiones</h3>
        <div className="min-h-[200px]">
          {isLoading ? null : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-halloween-purple/40">
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">ID Transacción</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Fecha</th>
                    <th className="font-heading text-right py-4 px-4 text-halloween-purple-bright">Cantidad</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Motivo</th>
                    <th className="font-heading text-center py-4 px-4 text-halloween-purple-bright">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {emissions.map((emission) => (
                    <tr key={emission._id} className="border-b border-halloween-purple/20 hover:bg-halloween-purple/10">
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {emission.transactionId}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {emission.executionDate 
                          ? new Date(emission.executionDate).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right font-bold text-halloween-orange-light">
                        {(emission.amountEmitted || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground/70">
                        {emission.reason}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {emission.status}
                        </span>
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
