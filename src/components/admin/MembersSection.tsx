import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { MiembrosdelaGuaridaVirgilio, CargosyPermisos } from '@/entities';
import { Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MembersSection() {
  const [members, setMembers] = useState<MiembrosdelaGuaridaVirgilio[]>([]);
  const [roles, setRoles] = useState<CargosyPermisos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState('');

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 border border-gray-200"
      >
        <div className="flex items-center gap-4 mb-6">
          <Users className="w-8 h-8 text-secondary" />
          <div>
            <h2 className="font-heading text-2xl text-foreground">Gestión de Miembros</h2>
            <p className="font-paragraph text-foreground/60">
              Total de miembros: {members.length}
            </p>
          </div>
        </div>

        <div className="min-h-[300px]">
          {isLoading ? null : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="font-heading text-left py-4 px-4">Nombre</th>
                    <th className="font-heading text-right py-4 px-4">Puntos</th>
                    <th className="font-heading text-center py-4 px-4">Estado</th>
                    <th className="font-heading text-left py-4 px-4">Registro</th>
                    <th className="font-heading text-center py-4 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="font-paragraph py-4 px-4 font-medium">
                        {member.memberName}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right">
                        {editingMember === member._id ? (
                          <Input
                            type="number"
                            value={editPoints}
                            onChange={(e) => setEditPoints(e.target.value)}
                            className="w-32 ml-auto"
                            placeholder="Puntos"
                          />
                        ) : (
                          <span className="font-bold text-primary">
                            {(member.availablePoints || 0).toLocaleString()} P
                          </span>
                        )}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleOfficialStatus(member)}
                          className={`inline-block px-3 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                            member.isOfficialMember 
                              ? 'bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30' 
                              : 'bg-gray-200 text-foreground hover:bg-gray-300'
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
                              className="bg-secondary text-secondary-foreground"
                            >
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
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
