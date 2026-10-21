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
      <div className="bg-halloween-purple/20 rounded-xl p-8 border border-halloween-purple/40">
        <p className="font-paragraph text-foreground/60">Cargando configuración...</p>
      </div>
    );
  }

  if (config.isPresidencyClaimed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-halloween-purple/20 rounded-2xl p-8 border border-halloween-purple/40"
      >
        <div className="flex items-center gap-4 mb-6">
          <Crown className="w-8 h-8 text-halloween-orange-light" />
          <div>
            <h2 className="font-heading text-2xl text-halloween-orange-light">Presidencia Reclamada</h2>
            <p className="font-paragraph text-foreground/60">
              La presidencia ya ha sido establecida
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-halloween-orange/10 rounded-xl p-6 border border-halloween-orange/30">
          <div>
            <p className="font-paragraph text-sm text-halloween-purple-bright font-bold uppercase tracking-wider mb-1">Presidente Actual</p>
            <p className="font-heading text-xl text-halloween-orange-light">
              {config.currentPresidentMemberId || 'No especificado'}
            </p>
          </div>
          <div>
            <p className="font-paragraph text-sm text-halloween-purple-bright font-bold uppercase tracking-wider mb-1">Fecha de Reclamación</p>
            <p className="font-heading text-xl text-halloween-orange-light">
              {config.presidencyClaimedAt 
                ? new Date(config.presidencyClaimedAt).toLocaleDateString('es-ES')
                : 'No disponible'}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-halloween-purple/30 rounded-lg border border-halloween-purple/50">
          <p className="font-paragraph text-sm text-foreground/80">
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
      className="bg-halloween-purple/20 rounded-2xl p-8 border border-halloween-purple/40"
    >
      <div className="flex items-center gap-4 mb-6">
        <Crown className="w-8 h-8 text-halloween-orange-light" />
        <div>
          <h2 className="font-heading text-2xl text-halloween-orange-light">Reclamar Presidencia</h2>
          <p className="font-paragraph text-foreground/60">
            La presidencia aún no ha sido reclamada
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-halloween-orange/10 rounded-lg border border-halloween-orange/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-halloween-orange-light flex-shrink-0 mt-0.5" />
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
          className="bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
        >
          <Crown className="w-4 h-4 mr-2" />
          Reclamar Presidencia
        </Button>
      ) : (
        <div className="space-y-4 bg-halloween-purple/30 rounded-xl p-6 border border-halloween-purple/50">
          <h3 className="font-heading text-lg text-halloween-orange-light">Confirmar Reclamación</h3>
          
          <div>
            <Label htmlFor="presidentName" className="font-paragraph text-foreground">
              Nombre del Presidente
            </Label>
            <Input
              id="presidentName"
              value={presidentName}
              onChange={(e) => setPresidentName(e.target.value)}
              placeholder="Ingresa tu nombre"
              className="mt-2 bg-halloween-purple/20 border-halloween-purple/40 text-foreground placeholder:text-foreground/40"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleClaimPresidency}
              disabled={isClaiming || !presidentName.trim()}
              className="flex-1 bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
            >
              {isClaiming ? 'Procesando...' : 'Confirmar Reclamación'}
            </Button>
            <Button
              onClick={() => {
                setShowConfirmation(false);
                setPresidentName('');
              }}
              variant="outline"
              className="flex-1 border-halloween-purple/40 text-foreground hover:bg-halloween-purple/20"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
