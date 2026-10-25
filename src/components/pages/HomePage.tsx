import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { EconomaGeneral, ConfiguracindelSistema } from '@/entities';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight, Shield, Activity, Database, Lock } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';
import { useAuthStore } from '@/lib/auth-store';

const MINIMUM_ECONOMY = 200000000;
const CRITICAL_LEVEL = 60000000;

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated: isAuthStoreAuthenticated, authUser, isLoading: authLoading } = useAuthStore();
  const [economyData, setEconomyData] = useState<EconomaGeneral | null>(null);
  const [config, setConfig] = useState<ConfiguracindelSistema | null>(null);
  const [history, setHistory] = useState<EconomaGeneral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    // Load data regardless of authentication - HomePage is public
    loadData();
  }, [authLoading]);

  const loadData = async () => {
    try {
      const [economyResult, configResult, historyResult] = await Promise.all([
        BaseCrudService.getAll<EconomaGeneral>('economia', {}, { limit: 1 }),
        BaseCrudService.getAll<ConfiguracindelSistema>('configuracion', {}, { limit: 1 }),
        BaseCrudService.getAll<EconomaGeneral>('economia', {}, { limit: 10 })
      ]);

      // Get the latest economy record (first in the list)
      if (economyResult.items.length > 0) {
        setEconomyData(economyResult.items[0]);
      }
      if (configResult.items.length > 0) {
        setConfig(configResult.items[0]);
      }
      // History should be sorted by date descending
      const sortedHistory = historyResult.items.sort((a, b) => {
        const dateA = new Date(a.fechaHora || 0).getTime();
        const dateB = new Date(b.fechaHora || 0).getTime();
        return dateB - dateA;
      });
      setHistory(sortedHistory);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTotal = economyData?.montoTotal || 0;
  const percentage = (currentTotal / MINIMUM_ECONOMY) * 100;
  const remaining = Math.max(0, MINIMUM_ECONOMY - currentTotal);
  
  const getEconomicStatus = () => {
    if (currentTotal >= MINIMUM_ECONOMY) {
      return { text: 'Economía Saludable', color: 'text-green-500', icon: CheckCircle, bg: 'bg-green-50/50', border: 'border-green-200' };
    } else if (currentTotal >= CRITICAL_LEVEL) {
      return { text: 'Por Debajo del Mínimo', color: 'text-yellow-600', icon: AlertTriangle, bg: 'bg-yellow-50/50', border: 'border-yellow-200' };
    } else {
      return { text: 'Nivel Crítico', color: 'text-destructive', icon: AlertTriangle, bg: 'bg-red-50/50', border: 'border-red-200' };
    }
  };

  const status = getEconomicStatus();
  const StatusIcon = status.icon;
  // ------------------------------------------

  // --- SCROLL & MOTION LOGIC ---
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(heroScroll, [0, 1], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-halloween-black selection:bg-halloween-orange selection:text-halloween-black font-paragraph">
      <Header />
      
      <main className="w-full overflow-clip">
        
        {/* --- HERO SECTION: Halloween Themed --- */}
        <section ref={heroRef} className="relative w-full min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-halloween-black via-halloween-purple/20 to-halloween-black overflow-hidden">
          {/* Parallax Background Image */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-halloween-black/80 mix-blend-multiply z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-halloween-purple/30 to-halloween-black z-10" />
            <Image 
              src="https://static.wixstatic.com/media/fa865f_19ed2af3a93342b0a32ea507070e6550~mv2.png?originWidth=1920&originHeight=832" 
              alt="Halloween Background" 
              className="w-full h-full object-cover opacity-20 grayscale mix-blend-luminosity"
            />
          </motion.div>

          {/* Decorative Halloween Elements */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            {/* Pumpkins */}
            <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">🎃</div>
            <div className="absolute top-20 right-20 text-5xl opacity-15 animate-pulse">🎃</div>
            <div className="absolute bottom-20 left-1/4 text-4xl opacity-10">🎃</div>
            
            {/* Bats */}
            <div className="absolute top-1/4 right-10 text-4xl opacity-20 animate-pulse">🦇</div>
            <div className="absolute bottom-1/3 left-5 text-3xl opacity-15">🦇</div>
            
            {/* Geometric Accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-halloween-orange/0 via-halloween-orange/50 to-halloween-orange/0" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-halloween-orange/0 via-halloween-orange/50 to-halloween-orange/0" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-[1px] bg-gradient-to-r from-halloween-purple/0 via-halloween-purple/50 to-halloween-purple/0" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-[1px] bg-gradient-to-r from-halloween-purple/0 via-halloween-purple/50 to-halloween-purple/0" />
          </div>

          <div className="relative z-20 max-w-[120rem] mx-auto px-6 md:px-12 w-full flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-halloween-orange/30 bg-halloween-orange/5 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-halloween-orange" />
                <span className="text-xs font-medium tracking-[0.2em] text-halloween-orange uppercase">Sistema Central de Reservas</span>
              </div>
              
              <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl text-foreground mb-6 leading-[0.9] tracking-tight">
                Banco de la <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-halloween-orange via-halloween-orange-light to-halloween-orange">
                  Guarida Virgilio
                </span>
              </h1>
              
              <p className="font-paragraph text-lg md:text-2xl text-foreground/70 max-w-3xl mx-auto font-light tracking-wide">
                Gestión económica transparente, segura y auditable. El pilar financiero de nuestra comunidad.
              </p>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary-foreground/50">Descubrir</span>
            <div className="w-[1px] h-12 bg-primary-foreground/20 overflow-hidden">
              <motion.div 
                animate={{ y: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-full h-full bg-halloween-orange"
              />
            </div>
          </motion.div>
        </section>

        {/* --- MAIN ECONOMIC DASHBOARD: The Ledger --- */}
        <section className="w-full py-32 px-6 md:px-12 bg-halloween-black relative z-30 border-t border-halloween-purple/30">
          <div className="max-w-[100rem] mx-auto">
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-halloween-purple/30 pb-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading text-4xl md:text-6xl text-halloween-orange-light leading-none">
                  Estado <br/><span className="text-halloween-purple-bright">Económico</span>
                </h2>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-4 text-sm text-halloween-purple-bright font-medium uppercase tracking-widest"
              >
                <Activity className="w-4 h-4" />
                <span>Datos en Tiempo Real</span>
              </motion.div>
            </div>

            {/* Data Grid - ALWAYS RENDERED for crash prevention, content fades in */}
            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-12 h-12 border-4 border-halloween-purple/30 border-t-halloween-orange rounded-full animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    {/* Card 1: Total Economy */}
                    <motion.div variants={itemVariants} className="group relative bg-halloween-purple/20 rounded-2xl p-8 border border-halloween-purple/40 shadow-sm hover:shadow-xl hover:shadow-halloween-orange/20 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-halloween-orange/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="font-heading text-lg text-halloween-purple-bright">Economía Total</h3>
                          <div className="w-10 h-10 rounded-full bg-halloween-orange/20 flex items-center justify-center">
                            <Database className="w-5 h-5 text-halloween-orange" />
                          </div>
                        </div>
                        <p className="font-heading text-4xl lg:text-5xl font-bold text-halloween-orange-light mb-2 tracking-tight">
                          {currentTotal.toLocaleString()} <span className="text-2xl text-halloween-purple-bright">P</span>
                        </p>
                        <p className="text-sm text-foreground/60 font-medium">Puntos en circulación oficial</p>
                      </div>
                    </motion.div>

                    {/* Card 2: Percentage */}
                    <motion.div variants={itemVariants} className="group relative bg-halloween-purple/20 rounded-2xl p-8 border border-halloween-purple/40 shadow-sm hover:shadow-xl hover:shadow-halloween-orange/20 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-halloween-purple-bright/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="font-heading text-lg text-halloween-purple-bright">Progreso Objetivo</h3>
                          <div className="w-10 h-10 rounded-full bg-halloween-purple-bright/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-halloween-purple-bright" />
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-4">
                          <p className="font-heading text-4xl lg:text-5xl font-bold text-halloween-purple-bright tracking-tight">
                            {percentage.toFixed(1)}
                          </p>
                          <span className="text-2xl text-halloween-purple-bright/60 font-heading">%</span>
                        </div>
                        <div className="w-full bg-halloween-purple/30 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                            className="bg-halloween-purple-bright h-full rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Card 3: Remaining */}
                    <motion.div variants={itemVariants} className="group relative bg-halloween-purple/20 rounded-2xl p-8 border border-halloween-purple/40 shadow-sm hover:shadow-xl hover:shadow-halloween-orange/20 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-halloween-orange/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="font-heading text-lg text-halloween-purple-bright">Brecha Mínima</h3>
                          <div className="w-10 h-10 rounded-full bg-halloween-orange/20 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-halloween-orange-light" />
                          </div>
                        </div>
                        <p className="font-heading text-4xl lg:text-5xl font-bold text-halloween-orange-light mb-2 tracking-tight">
                          {remaining.toLocaleString()} <span className="text-2xl text-halloween-purple-bright">P</span>
                        </p>
                        <p className="text-sm text-foreground/60 font-medium">Para alcanzar el umbral seguro</p>
                      </div>
                    </motion.div>

                    {/* Card 4: Status */}
                    <motion.div variants={itemVariants} className={`group relative bg-halloween-purple/20 rounded-2xl p-8 border border-halloween-purple/40 shadow-sm hover:shadow-xl hover:shadow-halloween-orange/20 transition-all duration-500 overflow-hidden`}>
                      <div className={`absolute inset-0 ${status.bg} opacity-30`} />
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="font-heading text-lg text-halloween-purple-bright">Diagnóstico</h3>
                          <div className={`w-10 h-10 rounded-full bg-halloween-purple/40 flex items-center justify-center shadow-sm`}>
                            <StatusIcon className={`w-5 h-5 ${status.color}`} />
                          </div>
                        </div>
                        <div>
                          <p className={`font-heading text-3xl lg:text-4xl font-bold ${status.color} leading-tight`}>
                            {status.text}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* --- SPLIT CONTENT: Rules & History --- */}
        <section className="w-full bg-halloween-black border-t border-halloween-purple/30">
          <div className="max-w-[120rem] mx-auto flex flex-col lg:flex-row">
            
            {/* Left Column: Sticky Rules */}
            <div className="w-full lg:w-1/3 p-6 md:p-12 lg:p-24 lg:border-r border-halloween-purple/30 bg-halloween-purple/10">
              <div className="sticky top-32">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-halloween-purple/40 bg-halloween-purple/20">
                    <Lock className="w-3 h-3 text-halloween-orange" />
                    <span className="text-[10px] font-bold tracking-widest text-halloween-orange uppercase">Parámetros del Sistema</span>
                  </div>
                  <h3 className="font-heading text-3xl md:text-4xl text-halloween-orange-light mb-8">
                    Regulaciones <br/>Económicas
                  </h3>
                  
                  <div className="space-y-8">
                    <div className="relative pl-6 border-l-2 border-halloween-purple-bright">
                      <div className="absolute w-3 h-3 bg-halloween-purple-bright rounded-full -left-[7px] top-1.5 ring-4 ring-halloween-black" />
                      <p className="text-sm text-halloween-purple-bright font-bold uppercase tracking-wider mb-1">Mínimo Establecido</p>
                      <p className="font-heading text-3xl text-halloween-orange-light">{MINIMUM_ECONOMY.toLocaleString()} P</p>
                      <p className="text-sm text-foreground/60 mt-2">Umbral requerido para operaciones estándar.</p>
                    </div>
                    
                    <div className="relative pl-6 border-l-2 border-destructive">
                      <div className="absolute w-3 h-3 bg-destructive rounded-full -left-[7px] top-1.5 ring-4 ring-halloween-black" />
                      <p className="text-sm text-destructive font-bold uppercase tracking-wider mb-1">Nivel Crítico</p>
                      <p className="font-heading text-3xl text-destructive">{CRITICAL_LEVEL.toLocaleString()} P</p>
                      <p className="text-sm text-foreground/60 mt-2">Punto de alerta máxima. Requiere intervención.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Column: Scrolling History */}
            <div className="w-full lg:w-2/3 p-6 md:p-12 lg:p-24 bg-halloween-black">
              <div className="max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-12 flex items-center justify-between"
                >
                  <h3 className="font-heading text-3xl md:text-4xl text-halloween-orange-light">Registro de Auditoría</h3>
                  <span className="text-sm text-halloween-purple-bright font-medium">Últimos movimientos</span>
                </motion.div>

                <div className="space-y-6">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      // Skeleton loaders for history
                      [...Array(5)].map((_, i) => (
                        <div key={i} className="w-full h-24 bg-halloween-purple/20 rounded-xl animate-pulse" />
                      ))
                    ) : history.length > 0 ? (
                      history.slice(0, 8).map((item, index) => (
                        <motion.div 
                          key={item._id}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-halloween-purple/40 bg-halloween-purple/10 hover:border-halloween-orange/40 hover:shadow-md hover:shadow-halloween-orange/10 transition-all duration-300"
                        >
                          <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.tipoMovimiento === 'Aumento' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {item.tipoMovimiento === 'Aumento' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-heading text-lg text-halloween-orange-light group-hover:text-halloween-orange transition-colors">
                                {item.descripcion || item.tipoMovimiento}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-bold text-halloween-purple-bright uppercase tracking-wider">
                                  {item.fechaHora ? new Date(item.fechaHora).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Fecha N/A'}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-halloween-purple/60" />
                                <span className="text-xs text-foreground/60">{item.tipoMovimiento}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left sm:text-right pl-16 sm:pl-0">
                            <p className={`font-heading text-2xl ${item.tipoMovimiento === 'Aumento' ? 'text-green-400' : 'text-red-400'}`}>
                              {item.tipoMovimiento === 'Aumento' ? '+' : '-'}{Math.abs(item.cantidadCambio || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-halloween-purple-bright font-medium uppercase tracking-wider mt-1">Puntos</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-12 text-center border border-dashed border-halloween-purple/40 rounded-xl">
                        <p className="text-foreground/60">No hay registros de movimientos recientes.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- VISUAL BREATHER --- */}
        <section className="w-full h-[60vh] relative overflow-hidden bg-halloween-black">
          <div className="absolute inset-0 bg-halloween-purple/40 mix-blend-multiply z-10" />
          <Image 
            src="https://static.wixstatic.com/media/fa865f_db83296ca5cb413f8eaf29eafd0ca625~mv2.png?originWidth=1920&originHeight=960" 
            alt="Vault Architecture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center px-6"
            >
              <Shield className="w-12 h-12 text-halloween-orange mx-auto mb-6 opacity-80" />
              <h2 className="font-heading text-3xl md:text-5xl text-foreground max-w-2xl mx-auto leading-tight">
                La confianza se construye con <span className="text-halloween-orange-light italic">transparencia absoluta</span>.
              </h2>
            </motion.div>
          </div>
        </section>

        {/* --- NAVIGATION HUB: Quick Links --- */}
        <section className="w-full py-32 px-6 md:px-12 bg-halloween-black relative z-30 border-t border-halloween-purple/30">
          <div className="max-w-[100rem] mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-heading text-4xl md:text-5xl text-halloween-orange-light mb-4">Portales de Acceso</h2>
              <p className="text-foreground/60 max-w-2xl mx-auto">Navegue por las diferentes áreas del sistema bancario según sus credenciales y necesidades operativas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
              {/* Link 1: Reserva */}
              <Link to="/reserva" className="group block h-full">
                <motion.div
                  whileHover={{ y: -10 }}
                  className="h-full bg-halloween-purple/20 border border-halloween-purple/40 rounded-2xl p-8 lg:p-12 backdrop-blur-sm hover:bg-halloween-purple/30 hover:shadow-lg hover:shadow-halloween-orange/20 transition-all duration-300 flex flex-col"
                >
                  <div className="w-14 h-14 rounded-full bg-halloween-orange/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Database className="w-6 h-6 text-halloween-orange-light" />
                  </div>
                  <h3 className="font-heading text-2xl text-halloween-orange-light mb-4 group-hover:text-halloween-orange transition-colors">Reserva Bancaria</h3>
                  <p className="text-foreground/60 mb-8 flex-grow">
                    Consulte el saldo consolidado, objetivos de reserva y el historial detallado de entradas y salidas.
                  </p>
                  <div className="flex items-center gap-2 text-halloween-orange-light font-bold text-sm uppercase tracking-wider">
                    <span>Acceder</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.div>
              </Link>

              {/* Link 2: Miembros */}
              <Link to="/miembros" className="group block h-full">
                <motion.div
                  whileHover={{ y: -10 }}
                  className="h-full bg-halloween-purple/20 border border-halloween-purple/40 rounded-2xl p-8 lg:p-12 backdrop-blur-sm hover:bg-halloween-purple/30 hover:shadow-lg hover:shadow-halloween-orange/20 transition-all duration-300 flex flex-col"
                >
                  <div className="w-14 h-14 rounded-full bg-halloween-purple-bright/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Activity className="w-6 h-6 text-halloween-purple-bright" />
                  </div>
                  <h3 className="font-heading text-2xl text-halloween-purple-bright mb-4 group-hover:text-halloween-orange-light transition-colors">Directorio de Miembros</h3>
                  <p className="text-foreground/60 mb-8 flex-grow">
                    Verifique saldos individuales, registre nuevos integrantes y audite transferencias entre cuentas.
                  </p>
                  <div className="flex items-center gap-2 text-halloween-purple-bright font-bold text-sm uppercase tracking-wider">
                    <span>Acceder</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.div>
              </Link>

              {/* Link 3: Admin */}
              <Link to="/admin" className="group block h-full">
                <motion.div
                  whileHover={{ y: -10 }}
                  className="h-full bg-halloween-orange/10 border border-halloween-orange/30 rounded-2xl p-8 lg:p-12 backdrop-blur-sm hover:bg-halloween-orange/20 hover:shadow-lg hover:shadow-halloween-orange/30 transition-all duration-300 flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-halloween-orange/10 rounded-bl-full -mr-16 -mt-16" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-full bg-halloween-orange/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                      <Shield className="w-6 h-6 text-halloween-orange-light" />
                    </div>
                    <h3 className="font-heading text-2xl text-halloween-orange-light mb-4">Panel Administrativo</h3>
                    <p className="text-foreground/70 mb-8 flex-grow">
                      Acceso restringido. Gestión de emisiones, aprobación de proyectos y configuración del sistema.
                    </p>
                    <div className="flex items-center gap-2 text-halloween-orange-light font-bold text-sm uppercase tracking-wider">
                      <span>Requiere Autorización</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}