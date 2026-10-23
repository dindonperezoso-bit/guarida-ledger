import { useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResetSection() {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetAllData = async () => {
    setIsResetting(true);
    setMessage(null);

    try {
      // Colecciones a resetear
      const collections = [
        'auditoria',
        'economia',
        'emisiones',
        'miembros',
        'proyectos',
        'reserva',
        'solicitudesmonetarias',
        'transferencias'
      ];

      // Obtener todos los items de cada colección y eliminarlos
      for (const collectionId of collections) {
        try {
          const result = await BaseCrudService.getAll(collectionId, {}, { limit: 1000 });
          for (const item of result.items) {
            await BaseCrudService.delete(collectionId, item._id);
          }
        } catch (error) {
          console.error(`Error resetting ${collectionId}:`, error);
        }
      }

      // Crear configuración inicial limpia
      const configResult = await BaseCrudService.getAll('configuracion', {}, { limit: 1 });
      if (configResult.items.length > 0) {
        // Update existing config
        await BaseCrudService.update('configuracion', {
          _id: configResult.items[0]._id,
          isPresidencyClaimed: false,
          currentPresidentMemberId: '',
          presidencyClaimedAt: undefined,
          minimumEconomicPoints: 200000000,
          criticalEconomicLevel: 60000000,
          adminAccessCode: '0001',
          referenceConversionRate: 1200000
        });
      } else {
        // Create new config
        await BaseCrudService.create('configuracion', {
          _id: crypto.randomUUID(),
          configName: 'Sistema Principal',
          isPresidencyClaimed: false,
          currentPresidentMemberId: '',
          minimumEconomicPoints: 200000000,
          criticalEconomicLevel: 60000000,
          adminAccessCode: '0001',
          referenceConversionRate: 1200000
        });
      }

      // Create initial economy record with 0
      await BaseCrudService.create('economia', {
        _id: crypto.randomUUID(),
        montoTotal: 0,
        fechaHora: new Date().toISOString(),
        tipoMovimiento: 'Inicialización',
        cantidadCambio: 0,
        descripcion: 'Sistema reseteado a cero'
      });

      setMessage({ 
        type: 'success', 
        text: '✅ Sistema completamente reseteado. Economía en cero, presidencia liberada, todas las colecciones limpias.' 
      });
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error during reset:', error);
      setMessage({ 
        type: 'error', 
        text: '❌ Error al resetear el sistema. Por favor intenta de nuevo.' 
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-destructive/10 rounded-xl p-8 border border-destructive/30">
        <div className="flex items-center gap-4 mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <h2 className="font-heading text-2xl text-destructive">Zona de Peligro: Resetear Sistema</h2>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-500/10 border-green-500' : 'bg-destructive/10 border-destructive'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-500' : 'text-destructive'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6 p-4 bg-halloween-black/50 rounded-lg border border-destructive/20">
          <p className="font-paragraph text-foreground mb-3">
            ⚠️ <strong>ADVERTENCIA:</strong> Esta acción eliminará TODOS los datos de:
          </p>
          <ul className="font-paragraph text-foreground/80 text-sm space-y-1 ml-4">
            <li>• Historial de Auditoría</li>
            <li>• Economía General</li>
            <li>• Emisiones Monetarias</li>
            <li>• Miembros</li>
            <li>• Proyectos</li>
            <li>• Reserva Bancaria</li>
            <li>• Solicitudes Monetarias</li>
            <li>• Transferencias</li>
          </ul>
          <p className="font-paragraph text-foreground/60 text-sm mt-3">
            ✅ Se mantendrá la configuración del sistema (presidencia, parámetros económicos, código de acceso)
          </p>
        </div>

        {!showConfirmation ? (
          <Button
            onClick={() => setShowConfirmation(true)}
            disabled={isResetting}
            className="w-full bg-destructive text-white hover:bg-destructive/90 font-bold py-6 text-lg"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Resetear Todo el Sistema
          </Button>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-destructive/20 border-destructive">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                ¿Estás completamente seguro? Esta acción NO se puede deshacer.
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button
                onClick={handleResetAllData}
                disabled={isResetting}
                className="flex-1 bg-destructive text-white hover:bg-destructive/90 font-bold py-6"
              >
                {isResetting ? 'Reseteando...' : 'SÍ, RESETEAR TODO'}
              </Button>
              <Button
                onClick={() => setShowConfirmation(false)}
                disabled={isResetting}
                variant="outline"
                className="flex-1 border-halloween-purple/40 text-foreground hover:bg-halloween-purple/20 font-bold py-6"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
