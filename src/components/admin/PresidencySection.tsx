import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { ConfiguracindelSistema, HistorialdeAuditora, MiembrosdelaGuaridaVirgilio } from '@/entities';
import { Crown, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PresidencySectionProps {
  config: ConfiguracindelSistema | null;
  onConfigUpdate: () => void;
}

export default function PresidencySection({ config, onConfigUpdate }: PresidencySectionProps) {
  const [members, setMembers] = useState<MiembrosdelaGuaridaVirgilio[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const result = await BaseCrudService.getAll<MiembrosdelaGuaridaVirgilio>('miembros', {}, { limit: 100 });
      setMembers(result.items);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimPresidency = async () => {
    if (!selectedMemberId || !config) return;

    const selectedMember = members.find(m => m._id === selectedMemberId);
    if (!selectedMember) return;

    setIsClaiming(true);
    try {
      // Update config to mark presidency as claimed
      await BaseCrudService.update<ConfiguracindelSistema>('configuracion', {
        _id: config._id,
        isPresidencyClaimed: true,
        currentPresidentMemberId: selectedMemberId,
        presidencyClaimedAt: new Date().toISOString()
      });

      // Create audit log
      await BaseCrudService.create('auditoria', {
        _id: crypto.randomUUID(),
        actionType: 'Reclamación de Presidencia',
        responsibleUser: selectedMember.memberName || 'Sistema',
        timestamp: new Date().toISOString(),
        description: `${selectedMember.memberName} ha reclamado la presidencia del sistema`,
        result: 'Exitoso'
      });

      setMessage({ type: 'success', text: `¡${selectedMember.memberName} es ahora el presidente!` });
      setShowConfirmation(false);
      setSelectedMemberId('');
      // Call immediately without setTimeout to prevent UI freeze
      onConfigUpdate();
    } catch (error) {
      console.error('Error claiming presidency:', error);
      setMessage({ type: 'error', text: 'Error al reclamar la presidencia' });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleReleasePresidency = async () => {
    if (!config) return;

    setIsClaiming(true);
    try {
      await BaseCrudService.update<ConfiguracindelSistema>('configuracion', {
        _id: config._id,
        isPresidencyClaimed: false,
        currentPresidentMemberId: '',
        presidencyClaimedAt: undefined
      });

      // Create audit log
      await BaseCrudService.create('auditoria', {
        _id: crypto.randomUUID(),
        actionType: 'Liberación de Presidencia',
        responsibleUser: 'Sistema',
        timestamp: new Date().toISOString(),
        description: 'La presidencia ha sido liberada',
        result: 'Exitoso'
      });

      setMessage({ type: 'success', text: 'Presidencia liberada exitosamente' });
      // Call immediately without setTimeout to prevent UI freeze
      onConfigUpdate();
    } catch (error) {
      console.error('Error releasing presidency:', error);
      setMessage({ type: 'error', text: 'Error al liberar la presidencia' });
    } finally {
      setIsClaiming(false);
    }
  };

  const currentPresident = config?.currentPresidentMemberId 
    ? members.find(m => m._id === config.currentPresidentMemberId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-halloween-purple/20 rounded-xl p-8 border border-halloween-purple/40">
        <div className="flex items-center gap-4 mb-6">
          <Crown className="w-8 h-8 text-halloween-orange-light" />
          <h2 className="font-heading text-2xl text-halloween-orange-light">Gestión de Presidencia</h2>
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

        {/* Current President Status */}
        {config?.isPresidencyClaimed && currentPresident ? (
          <div className="mb-8 p-6 bg-halloween-orange/10 rounded-lg border border-halloween-orange/30">
            <p className="text-sm text-halloween-purple-bright font-bold uppercase tracking-wider mb-2">Presidente Actual</p>
            <p className="font-heading text-3xl text-halloween-orange-light mb-4">{currentPresident.memberName}</p>
            <p className="text-sm text-foreground/70 mb-4">
              Reclamado el {new Date(config.presidencyClaimedAt || '').toLocaleDateString('es-ES')}
            </p>
            <Button
              onClick={handleReleasePresidency}
              disabled={isClaiming}
              variant="outline"
              className="border-halloween-orange text-halloween-orange hover:bg-halloween-orange/10"
            >
              Liberar Presidencia
            </Button>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-halloween-purple/10 rounded-lg border border-halloween-purple/30">
            <p className="text-sm text-halloween-purple-bright font-bold uppercase tracking-wider mb-2">Estado</p>
            <p className="text-foreground/70">No hay presidente reclamado actualmente</p>
          </div>
        )}

        {/* Claim Presidency Form */}
        {!config?.isPresidencyClaimed && (
          <div className="space-y-4">
            <div>
              <Label className="font-paragraph text-foreground">Seleccionar Miembro</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground mt-2">
                  <SelectValue placeholder="Elige un miembro" />
                </SelectTrigger>
                <SelectContent className="bg-halloween-black border-halloween-purple-bright/30">
                  {isLoading ? (
                    <SelectItem value="loading" disabled className="text-foreground/50">
                      Cargando miembros...
                    </SelectItem>
                  ) : members.length > 0 ? (
                    members.map(m => (
                      <SelectItem key={m._id} value={m._id} className="text-foreground">
                        {m.memberName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled className="text-foreground/50">
                      No hay miembros disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {!showConfirmation ? (
              <Button
                onClick={() => setShowConfirmation(true)}
                disabled={!selectedMemberId}
                className="w-full bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
              >
                <Crown className="w-4 h-4 mr-2" />
                Reclamar Presidencia
              </Button>
            ) : (
              <div className="p-4 bg-halloween-orange/10 rounded-lg border border-halloween-orange/30">
                <p className="text-sm text-foreground mb-4">
                  ¿Confirmas que {members.find(m => m._id === selectedMemberId)?.memberName} será el nuevo presidente?
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleClaimPresidency}
                    disabled={isClaiming}
                    className="flex-1 bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
                  >
                    {isClaiming ? 'Procesando...' : 'Confirmar'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowConfirmation(false);
                      setSelectedMemberId('');
                    }}
                    variant="outline"
                    className="flex-1 border-halloween-purple/40 text-foreground hover:bg-halloween-purple/20"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
