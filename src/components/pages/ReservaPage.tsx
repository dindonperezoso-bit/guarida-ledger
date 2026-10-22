import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { ReservaBancaria, ConfiguracindelSistema } from '@/entities';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ReservaPage() {
  const [movements, setMovements] = useState<ReservaBancaria[]>([]);
  const [config, setConfig] = useState<ConfiguracindelSistema | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [movementsResult, configResult] = await Promise.all([
        BaseCrudService.getAll<ReservaBancaria>('reserva', {}, { limit: 50 }),
        BaseCrudService.getAll<ConfiguracindelSistema>('configuracion', {}, { limit: 1 })
      ]);

      setMovements(movementsResult.items);
      if (configResult.items.length > 0) {
        setConfig(configResult.items[0]);
      }
    } catch (error) {
      console.error('Error loading reserve data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentBalance = movements.length > 0 ? movements[0].currentReserveBalance || 0 : 0;
  const minimumReserve = config?.minimumEconomicPoints || 50000000;
  const percentage = (currentBalance / minimumReserve) * 100;
  const remaining = Math.max(0, minimumReserve - currentBalance);

  return (
    <div className="min-h-screen bg-halloween-black">
      <Header />
      
      <main className="w-full">
        {/* Hero Section */}
        <section className="w-full bg-halloween-purple text-foreground py-16 px-4">
          <div className="max-w-[100rem] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Wallet className="w-16 h-16 mx-auto mb-6 text-halloween-orange-light" />
              <h1 className="font-heading text-4xl md:text-6xl mb-4 text-halloween-orange-light">
                Reserva Bancaria
              </h1>
              <p className="font-paragraph text-xl text-foreground/70">
                Gestión y seguimiento de la reserva del banco
              </p>
            </motion.div>
          </div>
        </section>

        {/* Reserve Dashboard */}
        <section className="w-full py-16 px-4 bg-halloween-black border-t border-halloween-purple/30">
          <div className="max-w-[100rem] mx-auto">
            <div className="min-h-[400px]">
              {isLoading ? null : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-halloween-purple/20 rounded-xl p-6 border border-halloween-purple/40"
                    >
                      <h3 className="font-heading text-lg text-halloween-purple-bright mb-4">Saldo Actual</h3>
                      <p className="font-paragraph text-3xl font-bold text-halloween-orange-light">
                        {currentBalance.toLocaleString()} P
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-halloween-purple/20 rounded-xl p-6 border border-halloween-purple/40"
                    >
                      <h3 className="font-heading text-lg text-halloween-purple-bright mb-4">Porcentaje Alcanzado</h3>
                      <p className="font-paragraph text-3xl font-bold text-halloween-purple-bright">
                        {percentage.toFixed(2)}%
                      </p>
                      <div className="w-full bg-halloween-purple/30 rounded-full h-2 mt-4">
                        <div
                          className="bg-halloween-purple-bright h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-halloween-orange/10 rounded-xl p-6 border border-halloween-orange/30"
                    >
                      <h3 className="font-heading text-lg text-halloween-orange-light mb-4">Faltante</h3>
                      <p className="font-paragraph text-3xl font-bold text-halloween-orange-light">
                        {remaining.toLocaleString()} P
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-halloween-purple/20 rounded-xl p-6 border border-halloween-purple/40"
                    >
                      <h3 className="font-heading text-lg text-halloween-purple-bright mb-4">Objetivo</h3>
                      <p className="font-paragraph text-3xl font-bold text-halloween-orange-light">
                        {minimumReserve.toLocaleString()} P
                      </p>
                    </motion.div>
                  </div>

                  {/* Movements History */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-halloween-purple/20 rounded-xl p-8 border border-halloween-purple/40"
                  >
                    <h2 className="font-heading text-2xl text-halloween-orange-light mb-6">Historial de Movimientos</h2>
                    
                    {movements.length === 0 ? (
                      <p className="font-paragraph text-foreground/60 text-center py-8">
                        No hay movimientos registrados
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-halloween-purple/40">
                              <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Fecha</th>
                              <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Tipo</th>
                              <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Descripción</th>
                              <th className="font-heading text-right py-4 px-4 text-halloween-purple-bright">Monto</th>
                              <th className="font-heading text-right py-4 px-4 text-halloween-purple-bright">Saldo</th>
                              <th className="font-heading text-left py-4 px-4 text-halloween-purple-bright">Responsable</th>
                            </tr>
                          </thead>
                          <tbody>
                            {movements.map((movement) => (
                              <tr key={movement._id} className="border-b border-halloween-purple/20 hover:bg-halloween-purple/10">
                                <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                                  {movement.movementDateTime 
                                    ? new Date(movement.movementDateTime).toLocaleDateString('es-ES')
                                    : 'N/A'}
                                </td>
                                <td className="font-paragraph py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    {movement.movementType === 'Entrada' ? (
                                      <TrendingUp className="w-4 h-4 text-green-400" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4 text-red-400" />
                                    )}
                                    <span className="text-sm text-foreground">{movement.movementType}</span>
                                  </div>
                                </td>
                                <td className="font-paragraph py-4 px-4 text-sm text-foreground">
                                  {movement.description || 'Sin descripción'}
                                </td>
                                <td className={`font-paragraph py-4 px-4 text-right font-bold ${
                                  movement.movementType === 'Entrada' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {movement.movementType === 'Entrada' ? '+' : '-'}
                                  {Math.abs(movement.amount || 0).toLocaleString()} P
                                </td>
                                <td className="font-paragraph py-4 px-4 text-right font-bold text-halloween-orange-light">
                                  {(movement.currentReserveBalance || 0).toLocaleString()} P
                                </td>
                                <td className="font-paragraph py-4 px-4 text-sm text-foreground/70">
                                  {movement.responsibleUser || 'Sistema'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
