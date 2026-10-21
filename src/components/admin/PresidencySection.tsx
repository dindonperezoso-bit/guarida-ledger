import { useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { ConfiguracindelSistema, HistorialdeAuditora } from '@/entities';
import { Crown, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PresidencySectionProps {
  config: ConfiguracindelSistema | null;
  onConfigUpdate: () => void;
}

export default function PresidencySection({ config, onConfigUpdate }: PresidencySectionProps) {
  const [presidentName, setPresidentName] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClaimPresidency = async () => {
    if (!presidentName.trim() || !config) return;

    setIsClaiming(true);
    try {
      // Update config to mark presidency as claimed
      await BaseCrudService.update<ConfiguracindelSistema>('configuracion', {
        _id: config._id,
        isPresidencyClaimed: true,
        currentPresidentMemberId: presidentName.trim(),
        presidencyClaimedAt: new Date().toISOString()
      });

      // Create audit log
      await BaseCrudService.create('auditoria', {
        _id: crypto.randomUUID(),
        actionType: 'Reclamación de Presidencia',
        responsibleUser: presidentName.trim(),
        timestamp: new Date().toISOString(),
        description: `${presidentName.trim()} ha reclamado la presidencia del sistema`,
        result: 'Exitoso'
      });

      setShowConfirmation(false);
      setPresidentName('');
      onConfigUpdate();
    } catch (error) {
      console.error('Error claiming presidency:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!config) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <p className="font-paragraph text-foreground/60">Cargando configuración...</p>
      </div>
    );
  }

  if (config.isPresidencyClaimed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 border border-gray-200"
      >
        <div className="flex items-center gap-4 mb-6">
          <Crown className="w-8 h-8 text-accent-gold" />
          <div>
            <h2 className="font-heading text-2xl text-foreground">Presidencia Reclamada</h2>
            <p className="font-paragraph text-foreground/60">
              La presidencia ya ha sido establecida
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent-gold/10 rounded-xl p-6">
          <div>
            <p className="font-paragraph text-sm text-foreground/60 mb-1">Presidente Actual</p>
            <p className="font-paragraph text-xl font-bold text-foreground">
              {config.currentPresidentMemberId || 'No especificado'}
            </p>
          </div>
          <div>
            <p className="font-paragraph text-sm text-foreground/60 mb-1">Fecha de Reclamación</p>
            <p className="font-paragraph text-xl font-bold text-foreground">
              {config.presidencyClaimedAt 
                ? new Date(config.presidencyClaimedAt).toLocaleDateString('es-ES')
                : 'No disponible'}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-paragraph text-sm text-foreground">
            <strong>Nota:</strong> La presidencia solo puede cambiar mediante un procedimiento administrativo autorizado.
            No es posible reclamarla nuevamente desde esta interfaz.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-8 border border-gray-200"
    >
      <div className="flex items-center gap-4 mb-6">
        <Crown className="w-8 h-8 text-accent-gold" />
        <div>
          <h2 className="font-heading text-2xl text-foreground">Reclamar Presidencia</h2>
          <p className="font-paragraph text-foreground/60">
            La presidencia aún no ha sido reclamada
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-paragraph text-sm text-foreground font-medium mb-2">
            Importante: Esta acción es permanente
          </p>
          <ul className="font-paragraph text-sm text-foreground/80 space-y-1 list-disc list-inside">
            <li>Solo se puede reclamar una vez</li>
            <li>El presidente tendrá permisos especiales</li>
            <li>Esta acción quedará registrada en el historial</li>
            <li>No se puede deshacer desde esta interfaz</li>
          </ul>
        </div>
      </div>

      {!showConfirmation ? (
        <Button
          onClick={() => setShowConfirmation(true)}
          className="bg-accent-gold text-dark-night-blue hover:bg-accent-gold/90"
        >
          <Crown className="w-4 h-4 mr-2" />
          Reclamar Presidencia
        </Button>
      ) : (
        <div className="space-y-4 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-heading text-lg text-foreground">Confirmar Reclamación</h3>
          
          <div>
            <Label htmlFor="presidentName" className="font-paragraph">
              Nombre del Presidente
            </Label>
            <Input
              id="presidentName"
              value={presidentName}
              onChange={(e) => setPresidentName(e.target.value)}
              placeholder="Ingresa tu nombre"
              className="mt-2"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleClaimPresidency}
              disabled={isClaiming || !presidentName.trim()}
              className="flex-1 bg-accent-gold text-dark-night-blue hover:bg-accent-gold/90"
            >
              {isClaiming ? 'Procesando...' : 'Confirmar Reclamación'}
            </Button>
            <Button
              onClick={() => {
                setShowConfirmation(false);
                setPresidentName('');
              }}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
