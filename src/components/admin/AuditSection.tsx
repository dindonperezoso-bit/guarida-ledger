import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { HistorialdeAuditora } from '@/entities';
import { History, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuditSection() {
  const [auditLogs, setAuditLogs] = useState<HistorialdeAuditora[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await BaseCrudService.getAll<HistorialdeAuditora>('auditoria', {}, { limit: 100 });
      setAuditLogs(result.items);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (result?: string) => {
    switch (result?.toLowerCase()) {
      case 'exitoso':
      case 'aprobado':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rechazado':
      case 'fallido':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getResultColor = (result?: string) => {
    switch (result?.toLowerCase()) {
      case 'exitoso':
      case 'aprobado':
        return 'bg-green-500/20 text-green-400';
      case 'rechazado':
      case 'fallido':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-halloween-purple/20 rounded-xl p-8 border border-halloween-purple/40"
      >
        <div className="flex items-center gap-4 mb-6">
          <History className="w-8 h-8 text-halloween-orange-light" />
          <div>
            <h2 className="font-heading text-2xl text-halloween-orange-light">Historial de Auditoría</h2>
            <p className="font-paragraph text-foreground/60">
              Registro completo de todas las operaciones del sistema
            </p>
          </div>
        </div>

        <div className="min-h-[400px]">
          {isLoading ? null : auditLogs.length === 0 ? (
            <p className="font-paragraph text-foreground/60 text-center py-8">
              No hay registros de auditoría
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-halloween-purple/40">
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Fecha y Hora</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Tipo de Acción</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Usuario Responsable</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Descripción</th>
                    <th className="font-heading text-center py-4 px-4 text-halloween-purple-bright">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="border-b border-halloween-purple/20 hover:bg-halloween-purple/10">
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {log.timestamp 
                          ? new Date(log.timestamp).toLocaleString('es-ES', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-foreground">
                        <span className="font-medium">{log.actionType}</span>
                      </td>
                      <td className="font-paragraph py-4 px-4 text-foreground">
                        {log.responsibleUser || 'Sistema'}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                        {log.description}
                      </td>
                      <td className="font-paragraph py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {getResultIcon(log.result)}
                          <span className={`inline-block px-3 py-1 rounded-full text-xs ${getResultColor(log.result)}`}>
                            {log.result}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        {!isLoading && auditLogs.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <p className="font-paragraph text-sm text-foreground/60 mb-1">Operaciones Exitosas</p>
              <p className="font-heading text-3xl font-bold text-green-600">
                {auditLogs.filter(log => log.result?.toLowerCase() === 'exitoso').length}
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <p className="font-paragraph text-sm text-foreground/60 mb-1">Operaciones Rechazadas</p>
              <p className="font-heading text-3xl font-bold text-red-600">
                {auditLogs.filter(log => log.result?.toLowerCase() === 'rechazado').length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <p className="font-paragraph text-sm text-foreground/60 mb-1">Total de Registros</p>
              <p className="font-heading text-3xl font-bold text-primary">
                {auditLogs.length}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
