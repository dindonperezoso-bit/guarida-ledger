import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { MiembrosdelaGuaridaVirgilio, PagosyTransferencias } from '@/entities';
import { Users, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MiembrosPage() {
  const [members, setMembers] = useState<MiembrosdelaGuaridaVirgilio[]>([]);
  const [transfers, setTransfers] = useState<PagosyTransferencias[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersResult, transfersResult] = await Promise.all([
        BaseCrudService.getAll<MiembrosdelaGuaridaVirgilio>('miembros', {}, { limit: 100 }),
        BaseCrudService.getAll<PagosyTransferencias>('transferencias', {}, { limit: 200 })
      ]);

      setMembers(membersResult.items);
      setTransfers(transfersResult.items);
    } catch (error) {
      console.error('Error loading members data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterMember = async () => {
    if (!newMemberName.trim()) return;

    setIsRegistering(true);
    try {
      await BaseCrudService.create('miembros', {
        _id: crypto.randomUUID(),
        memberName: newMemberName.trim(),
        availablePoints: 0,
        registrationDate: new Date().toISOString(),
        lastActivityDate: new Date().toISOString(),
        isOfficialMember: false
      });

      setNewMemberName('');
      setShowRegisterForm(false);
      await loadData();
    } catch (error) {
      console.error('Error registering member:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const getMemberTransfers = (memberId: string) => {
    return transfers.filter(
      t => t.senderMemberId === memberId || t.receiverMemberId === memberId
    );
  };

  const getMemberMovementCount = (memberId: string) => {
    return getMemberTransfers(memberId).length;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full">
        {/* Hero Section */}
        <section className="w-full bg-secondary text-secondary-foreground py-16 px-4">
          <div className="max-w-[100rem] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Users className="w-16 h-16 mx-auto mb-6" />
              <h1 className="font-heading text-4xl md:text-6xl mb-4">
                Miembros de la Guarida
              </h1>
              <p className="font-paragraph text-xl text-secondary-foreground/80">
                Consulta saldos y registra nuevos miembros
              </p>
            </motion.div>
          </div>
        </section>

        {/* Register Section */}
        <section className="w-full py-12 px-4 bg-white border-b border-gray-200">
          <div className="max-w-[100rem] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {!showRegisterForm ? (
                <div className="text-center">
                  <Button
                    onClick={() => setShowRegisterForm(true)}
                    className="bg-accent-gold text-dark-night-blue hover:bg-accent-gold/90"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Registrar Nuevo Miembro
                  </Button>
                </div>
              ) : (
                <div className="max-w-md mx-auto bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-heading text-xl text-foreground mb-4">Registro de Miembro</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="memberName" className="font-paragraph">Nombre del Miembro</Label>
                      <Input
                        id="memberName"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Ingresa el nombre"
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleRegisterMember}
                        disabled={isRegistering || !newMemberName.trim()}
                        className="flex-1 bg-secondary text-secondary-foreground"
                      >
                        {isRegistering ? 'Registrando...' : 'Registrar'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowRegisterForm(false);
                          setNewMemberName('');
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Members Table */}
        <section className="w-full py-16 px-4">
          <div className="max-w-[100rem] mx-auto">
            <div className="min-h-[400px]">
              {isLoading ? null : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-8 border border-gray-200"
                >
                  <h2 className="font-heading text-2xl text-foreground mb-6">
                    Lista de Miembros ({members.length})
                  </h2>
                  
                  {members.length === 0 ? (
                    <p className="font-paragraph text-foreground/60 text-center py-8">
                      No hay miembros registrados
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="font-heading text-left py-4 px-4">Nombre</th>
                            <th className="font-heading text-right py-4 px-4">Puntos Disponibles</th>
                            <th className="font-heading text-center py-4 px-4">Movimientos</th>
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
                              <td className="font-paragraph py-4 px-4 text-right font-bold text-primary">
                                {(member.availablePoints || 0).toLocaleString()} P
                              </td>
                              <td className="font-paragraph py-4 px-4 text-center">
                                {getMemberMovementCount(member._id)}
                              </td>
                              <td className="font-paragraph py-4 px-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                                  member.isOfficialMember 
                                    ? 'bg-accent-gold/20 text-accent-gold' 
                                    : 'bg-gray-200 text-foreground'
                                }`}>
                                  {member.isOfficialMember ? 'Oficial' : 'Miembro'}
                                </span>
                              </td>
                              <td className="font-paragraph py-4 px-4 text-sm text-foreground/60">
                                {member.registrationDate 
                                  ? new Date(member.registrationDate).toLocaleDateString('es-ES')
                                  : 'N/A'}
                              </td>
                              <td className="font-paragraph py-4 px-4 text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedMember(
                                    selectedMember === member._id ? null : member._id
                                  )}
                                >
                                  {selectedMember === member._id ? 'Ocultar' : 'Ver Detalles'}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Member Details */}
            {selectedMember && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-white rounded-xl p-8 border border-gray-200"
              >
                <h3 className="font-heading text-xl text-foreground mb-6">
                  Transferencias de {members.find(m => m._id === selectedMember)?.memberName}
                </h3>
                
                {getMemberTransfers(selectedMember).length === 0 ? (
                  <p className="font-paragraph text-foreground/60 text-center py-8">
                    No hay transferencias registradas
                  </p>
                ) : (
                  <div className="space-y-4">
                    {getMemberTransfers(selectedMember).map((transfer) => (
                      <div key={transfer._id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-4">
                          {transfer.senderMemberId === selectedMember ? (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                          )}
                          <div>
                            <p className="font-paragraph font-medium text-foreground">
                              {transfer.transactionType || 'Transferencia'}
                            </p>
                            <p className="font-paragraph text-sm text-foreground/60">
                              {transfer.description || 'Sin descripción'}
                            </p>
                            <p className="font-paragraph text-xs text-foreground/40">
                              {transfer.transactionDate 
                                ? new Date(transfer.transactionDate).toLocaleDateString('es-ES')
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-paragraph font-bold ${
                            transfer.senderMemberId === selectedMember ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {transfer.senderMemberId === selectedMember ? '-' : '+'}
                            {(transfer.amount || 0).toLocaleString()} P
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
