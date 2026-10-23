import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { MiembrosdelaGuaridaVirgilio, CargosyPermisos, HistorialdeAuditora } from '@/entities';
import { Users, Shield, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function MembersSection() {
  const [members, setMembers] = useState<MiembrosdelaGuaridaVirgilio[]>([]);
  const [roles, setRoles] = useState<CargosyPermisos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState('');
  const [showPointsForm, setShowPointsForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [pointsChange, setPointsChange] = useState('');
  const [pointsReason, setPointsReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersResult, rolesResult] = await Promise.all([
        BaseCrudService.getAll<MiembrosdelaGuaridaVirgilio>('miembros', {}, { limit: 100 }),
        BaseCrudService.getAll<CargosyPermisos>('cargos', {}, { limit: 50 })
      ]);

      setMembers(membersResult.items);
      setRoles(rolesResult.items);
    } catch (error) {
      console.error('Error loading members data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePoints = async (memberId: string) => {
    const points = parseFloat(editPoints);
    if (isNaN(points)) return;

    try {
      await BaseCrudService.update<MiembrosdelaGuaridaVirgilio>('miembros', {
        _id: memberId,
        availablePoints: points,
        lastActivityDate: new Date().toISOString()
      });

      setEditingMember(null);
      setEditPoints('');
      await loadData();
    } catch (error) {
      console.error('Error updating member points:', error);
    }
  };

  const handleAddOrSubtractPoints = async () => {
    if (!selectedMemberId || !pointsChange || !pointsReason.trim()) return;

    const member = members.find(m => m._id === selectedMemberId);
    if (!member) return;

    const change = parseFloat(pointsChange);
    if (isNaN(change)) return;

    try {
      const newPoints = Math.max(0, (member.availablePoints || 0) + change);
      
      // Update member points
      await BaseCrudService.update<MiembrosdelaGuaridaVirgilio>('miembros', {
        _id: selectedMemberId,
        availablePoints: newPoints,
        lastActivityDate: new Date().toISOString()
      });

      // Create audit log
      await BaseCrudService.create('auditoria', {
        _id: crypto.randomUUID(),
        actionType: 'Ajuste de Puntos',
        responsibleUser: 'Admin',
        timestamp: new Date().toISOString(),
        description: `${change > 0 ? 'Suma' : 'Resta'} de ${Math.abs(change)} puntos a ${member.memberName}: ${pointsReason}`,
        result: 'Exitoso'
      });

      setShowPointsForm(false);
      setSelectedMemberId('');
      setPointsChange('');
      setPointsReason('');
      await loadData();
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

  const handleToggleOfficialStatus = async (member: MiembrosdelaGuaridaVirgilio) => {
    try {
      await BaseCrudService.update<MiembrosdelaGuaridaVirgilio>('miembros', {
        _id: member._id,
        isOfficialMember: !member.isOfficialMember,
        lastActivityDate: new Date().toISOString()
      });

      await loadData();
    } catch (error) {
      console.error('Error updating member status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Subtract Points Form */}
      {showPointsForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-halloween-orange/10 rounded-2xl p-8 border border-halloween-orange/30"
        >
          <h3 className="font-heading text-2xl text-halloween-orange-light mb-6">Ajustar Puntos de Miembro</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="font-paragraph text-foreground">Seleccionar Miembro</Label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full mt-2 bg-halloween-purple/20 border border-halloween-purple/40 text-foreground rounded-lg p-2"
              >
                <option value="">-- Selecciona un miembro --</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.memberName} ({m.availablePoints || 0}P)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="font-paragraph text-foreground">Cantidad (+ suma, - resta)</Label>
              <Input
                type="number"
                value={pointsChange}
                onChange={(e) => setPointsChange(e.target.value)}
                placeholder="Ej: 1000 o -500"
                className="mt-2 bg-halloween-purple/20 border-halloween-purple/40 text-foreground placeholder:text-foreground/40"
              />
            </div>

            <div>
              <Label className="font-paragraph text-foreground">Motivo del Ajuste</Label>
              <Textarea
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="Describe el motivo de este ajuste..."
                className="mt-2 bg-halloween-purple/20 border-halloween-purple/40 text-foreground placeholder:text-foreground/40"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddOrSubtractPoints}
                disabled={!selectedMemberId || !pointsChange || !pointsReason.trim()}
                className="flex-1 bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold"
              >
                Aplicar Ajuste
              </Button>
              <Button
                onClick={() => {
                  setShowPointsForm(false);
                  setSelectedMemberId('');
                  setPointsChange('');
                  setPointsReason('');
                }}
                variant="outline"
                className="flex-1 border-halloween-purple/40 text-foreground hover:bg-halloween-purple/20"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-halloween-purple/20 rounded-2xl p-8 border border-halloween-purple/40"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-halloween-purple-bright" />
            <div>
              <h2 className="font-heading text-2xl text-halloween-orange-light">Gestión de Miembros</h2>
              <p className="font-paragraph text-foreground/60">
                Total de miembros: {members.length}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowPointsForm(!showPointsForm)}
            className="bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajustar Puntos
          </Button>
        </div>

        <div className="min-h-[300px]">
          {isLoading ? null : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-halloween-purple/40">
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Nombre</th>
                    <th className="font-heading text-right py-4 px-4 text-halloween-purple-bright">Puntos</th>
                    <th className="font-heading text-center py-4 px-4 text-halloween-purple-bright">Estado</th>
                    <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Registro</th>
                    <th className="font-heading text-center py-4 px-4 text-halloween-purple-bright">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member._id} className="border-b border-halloween-purple/20 hover:bg-halloween-purple/10">
                      <td className="font-paragraph py-4 px-4 font-medium text-foreground">
                        {member.memberName}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right">
                        {editingMember === member._id ? (
                          <Input
                            type="number"
                            value={editPoints}
                            onChange={(e) => setEditPoints(e.target.value)}
                            className="w-32 ml-auto bg-halloween-purple/20 border-halloween-purple/40 text-foreground"
                            placeholder="Puntos"
                          />
                        ) : (
                          <span className="font-bold text-halloween-orange-light">
                            {(member.availablePoints || 0).toLocaleString()} P
                          </span>
                        )}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleOfficialStatus(member)}
                          className={`inline-block px-3 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                            member.isOfficialMember 
                              ? 'bg-halloween-orange/20 text-halloween-orange-light hover:bg-halloween-orange/30' 
                              : 'bg-halloween-purple/30 text-halloween-purple-bright hover:bg-halloween-purple/40'
                          }`}
                        >
                          {member.isOfficialMember ? 'Oficial' : 'Miembro'}
                        </button>
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm text-foreground/60">
                        {member.registrationDate 
                          ? new Date(member.registrationDate).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-center">
                        {editingMember === member._id ? (
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePoints(member._id)}
                              className="bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light"
                            >
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-halloween-purple/40 text-foreground hover:bg-halloween-purple/20"
                              onClick={() => {
                                setEditingMember(null);
                                setEditPoints('');
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-halloween-purple/40 text-foreground hover:bg-halloween-purple/20"
                            onClick={() => {
                              setEditingMember(member._id);
                              setEditPoints(String(member.availablePoints || 0));
                            }}
                          >
                            Editar Puntos
                          </Button>
                        )}
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
