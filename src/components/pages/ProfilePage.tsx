import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { MiembrosdelaGuaridaVirgilio } from '@/entities';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Wallet, Lock, Calendar, TrendingUp, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  const { member, actions } = useMember();
  const [memberData, setMemberData] = useState<MiembrosdelaGuaridaVirgilio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMemberData();
  }, [member]);

  const loadMemberData = async () => {
    if (!member?.loginEmail) return;
    
    try {
      setIsLoading(true);
      // Try to find member by email in the miembros collection
      const result = await BaseCrudService.getAll<MiembrosdelaGuaridaVirgilio>('miembros', {}, { limit: 100 });
      const found = result.items.find(m => m.email === member.loginEmail);
      if (found) {
        setMemberData(found);
      }
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-halloween-black">
      <Header />
      
      <main className="w-full py-16 px-6 md:px-12">
        <div className="max-w-[100rem] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12 pb-8 border-b border-halloween-purple/30">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-heading text-4xl md:text-5xl text-halloween-orange-light mb-2">
                Mi Perfil
              </h1>
              <p className="text-foreground/60">Información personal y saldos</p>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              onClick={actions.logout}
              className="flex items-center gap-2 bg-halloween-purple text-foreground hover:bg-halloween-purple-bright px-6 py-3 rounded-lg font-bold transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </motion.button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-halloween-purple/30 border-t-halloween-orange rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Profile Card */}
              <motion.div variants={itemVariants} className="lg:col-span-1">
                <Card className="bg-halloween-purple/20 border-halloween-purple/40 p-8 rounded-2xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-halloween-orange/20 flex items-center justify-center mb-6">
                      <User className="w-10 h-10 text-halloween-orange-light" />
                    </div>
                    <h2 className="font-heading text-2xl text-halloween-orange-light mb-2">
                      {member?.profile?.nickname || member?.loginEmail?.split('@')[0] || 'Usuario'}
                    </h2>
                    <p className="text-sm text-foreground/60 mb-6 break-all">
                      {member?.loginEmail}
                    </p>
                    <div className="w-full space-y-3">
                      <div className="text-left">
                        <p className="text-xs text-halloween-purple-bright font-bold uppercase tracking-wider mb-1">
                          Estado
                        </p>
                        <p className="text-sm text-foreground">
                          {member?.status === 'APPROVED' ? '✓ Verificado' : 'Pendiente'}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-halloween-purple-bright font-bold uppercase tracking-wider mb-1">
                          Miembro Oficial
                        </p>
                        <p className="text-sm text-foreground">
                          {memberData?.isOfficialMember ? 'Sí' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Financial Info */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                {/* Saldo Disponible */}
                <Card className="bg-halloween-purple/20 border-halloween-purple/40 p-8 rounded-2xl">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-xs text-halloween-purple-bright font-bold uppercase tracking-wider mb-2">
                        Saldo Disponible
                      </p>
                      <h3 className="font-heading text-4xl text-halloween-orange-light">
                        {memberData?.availablePoints?.toLocaleString() || 0}
                        <span className="text-2xl text-halloween-purple-bright ml-2">P</span>
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-halloween-orange/20 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-halloween-orange-light" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground/60">Puntos disponibles para transacciones</p>
                </Card>

                {/* Ahorros Personales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-halloween-purple/20 border-halloween-purple/40 p-8 rounded-2xl">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-xs text-halloween-purple-bright font-bold uppercase tracking-wider mb-2">
                          Ahorros Personales
                        </p>
                        <h3 className="font-heading text-3xl text-halloween-purple-bright">
                          {memberData?.ahorrosPersonales?.toLocaleString() || 0}
                          <span className="text-xl text-halloween-purple-bright/60 ml-2">P</span>
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-halloween-purple-bright/20 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-halloween-purple-bright" />
                      </div>
                    </div>
                    <p className="text-sm text-foreground/60">Fondos de ahorro personal</p>
                  </Card>

                  {/* Ahorro Bloqueado */}
                  <Card className="bg-halloween-orange/10 border-halloween-orange/30 p-8 rounded-2xl">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-xs text-halloween-orange font-bold uppercase tracking-wider mb-2">
                          Ahorro Bloqueado (15 días)
                        </p>
                        <h3 className="font-heading text-3xl text-halloween-orange-light">
                          {memberData?.ahorroBloqueado?.toLocaleString() || 0}
                          <span className="text-xl text-halloween-orange/60 ml-2">P</span>
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-halloween-orange/20 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-halloween-orange-light" />
                      </div>
                    </div>
                    <p className="text-sm text-foreground/60">Fondos bloqueados hasta desbloqueo</p>
                  </Card>
                </div>

                {/* Fecha de Desbloqueo */}
                {memberData?.fechaDesbloqueoAhorro && (
                  <Card className="bg-halloween-purple/20 border-halloween-purple/40 p-8 rounded-2xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-halloween-purple-bright font-bold uppercase tracking-wider mb-2">
                          Fecha de Desbloqueo
                        </p>
                        <h3 className="font-heading text-2xl text-halloween-orange-light">
                          {new Date(memberData.fechaDesbloqueoAhorro).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-halloween-purple-bright/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-halloween-purple-bright" />
                      </div>
                    </div>
                    <p className="text-sm text-foreground/60 mt-4">
                      Tus fondos bloqueados estarán disponibles en esta fecha
                    </p>
                  </Card>
                )}

                {/* Información de Registro */}
                <Card className="bg-halloween-purple/20 border-halloween-purple/40 p-8 rounded-2xl">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-halloween-purple-bright font-bold uppercase tracking-wider mb-2">
                        Fecha de Registro
                      </p>
                      <p className="text-sm text-foreground">
                        {memberData?.registrationDate 
                          ? new Date(memberData.registrationDate).toLocaleDateString('es-ES')
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-halloween-purple-bright font-bold uppercase tracking-wider mb-2">
                        Última Actividad
                      </p>
                      <p className="text-sm text-foreground">
                        {memberData?.lastActivityDate 
                          ? new Date(memberData.lastActivityDate).toLocaleDateString('es-ES')
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
