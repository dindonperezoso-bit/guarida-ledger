import { useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { ConfiguracindelSistema } from '@/entities';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfigSectionProps {
  config: ConfiguracindelSistema | null;
  onConfigUpdate: () => void;
}

export default function ConfigSection({ config, onConfigUpdate }: ConfigSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    minimumEconomicPoints: config?.minimumEconomicPoints || 200000000,
    criticalEconomicLevel: config?.criticalEconomicLevel || 60000000,
    referenceConversionRate: config?.referenceConversionRate || 1200000
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!config) return;

    setIsSubmitting(true);
    try {
      await BaseCrudService.update<ConfiguracindelSistema>('configuracion', {
        _id: config._id,
        minimumEconomicPoints: formData.minimumEconomicPoints,
        criticalEconomicLevel: formData.criticalEconomicLevel,
        referenceConversionRate: formData.referenceConversionRate
      });

      setIsEditing(false);
      onConfigUpdate();
    } catch (error) {
      console.error('Error updating config:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!config) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <p className="font-paragraph text-foreground/60">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Settings className="w-8 h-8 text-primary" />
            <div>
              <h2 className="font-heading text-2xl text-foreground">Configuración del Sistema</h2>
              <p className="font-paragraph text-foreground/60">
                Parámetros económicos y configuraciones generales
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primary text-primary-foreground"
            >
              Editar Configuración
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div>
              <Label htmlFor="minimumEconomic" className="font-paragraph">
                Mínimo Económico (Puntos)
              </Label>
              <Input
                id="minimumEconomic"
                type="number"
                value={formData.minimumEconomicPoints}
                onChange={(e) => setFormData({ ...formData, minimumEconomicPoints: parseFloat(e.target.value) })}
                className="mt-2"
              />
              <p className="font-paragraph text-sm text-foreground/60 mt-1">
                Objetivo económico mínimo que debe alcanzar el sistema
              </p>
            </div>

            <div>
              <Label htmlFor="criticalLevel" className="font-paragraph">
                Nivel Crítico (Puntos)
              </Label>
              <Input
                id="criticalLevel"
                type="number"
                value={formData.criticalEconomicLevel}
                onChange={(e) => setFormData({ ...formData, criticalEconomicLevel: parseFloat(e.target.value) })}
                className="mt-2"
              />
              <p className="font-paragraph text-sm text-foreground/60 mt-1">
                Nivel por debajo del cual se considera crítico
              </p>
            </div>

            <div>
              <Label htmlFor="conversionRate" className="font-paragraph">
                Tasa de Conversión de Referencia
              </Label>
              <Input
                id="conversionRate"
                type="number"
                value={formData.referenceConversionRate}
                onChange={(e) => setFormData({ ...formData, referenceConversionRate: parseFloat(e.target.value) })}
                className="mt-2"
              />
              <p className="font-paragraph text-sm text-foreground/60 mt-1">
                Puntos equivalentes a L 1 (actualmente: {formData.referenceConversionRate.toLocaleString()} P = L 1)
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 bg-primary text-primary-foreground"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    minimumEconomicPoints: config.minimumEconomicPoints || 200000000,
                    criticalEconomicLevel: config.criticalEconomicLevel || 60000000,
                    referenceConversionRate: config.referenceConversionRate || 1200000
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <p className="font-paragraph text-sm text-foreground/60 mb-2">Mínimo Económico</p>
              <p className="font-heading text-3xl font-bold text-primary mb-1">
                {(config.minimumEconomicPoints || 0).toLocaleString()} P
              </p>
              <p className="font-paragraph text-xs text-foreground/60">
                Objetivo económico del sistema
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <p className="font-paragraph text-sm text-foreground/60 mb-2">Nivel Crítico</p>
              <p className="font-heading text-3xl font-bold text-destructive mb-1">
                {(config.criticalEconomicLevel || 0).toLocaleString()} P
              </p>
              <p className="font-paragraph text-xs text-foreground/60">
                Umbral de alerta económica
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <p className="font-paragraph text-sm text-foreground/60 mb-2">Tasa de Conversión</p>
              <p className="font-heading text-3xl font-bold text-green-600 mb-1">
                {(config.referenceConversionRate || 0).toLocaleString()} P
              </p>
              <p className="font-paragraph text-xs text-foreground/60">
                Equivalente a L 1
              </p>
            </div>

            <div className="bg-accent-gold/10 rounded-xl p-6 border border-accent-gold/30">
              <p className="font-paragraph text-sm text-foreground/60 mb-2">Estado de Presidencia</p>
              <p className="font-heading text-2xl font-bold text-accent-gold mb-1">
                {config.isPresidencyClaimed ? 'Reclamada' : 'Disponible'}
              </p>
              {config.isPresidencyClaimed && config.currentPresidentMemberId && (
                <p className="font-paragraph text-xs text-foreground/60">
                  Presidente: {config.currentPresidentMemberId}
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Information Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className="font-heading text-lg text-foreground mb-4">Información del Sistema</h3>
        <div className="space-y-2 font-paragraph text-sm text-foreground/80">
          <p>• El mínimo económico es el objetivo que debe alcanzar la economía total del sistema.</p>
          <p>• El nivel crítico indica cuándo la economía está en una situación de alerta.</p>
          <p>• La tasa de conversión es solo referencial y no afecta las operaciones internas.</p>
          <p>• Los cambios en la configuración afectan inmediatamente los cálculos del sistema.</p>
        </div>
      </motion.div>
    </div>
  );
}
