import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { ConfiguracindelSistema, CargosyPermisos, MiembrosdelaGuaridaVirgilio } from '@/entities';
import { Shield, Lock, Crown, Users, DollarSign, FileText, History, Settings, TrendingUp, Wallet, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PresidencySection from '@/components/admin/PresidencySection';
import EconomySection from '@/components/admin/EconomySection';
import ReserveSection from '@/components/admin/ReserveSection';
import MembersSection from '@/components/admin/MembersSection';
import MonetaryRequestsSection from '@/components/admin/MonetaryRequestsSection';
import ProjectsSection from '@/components/admin/ProjectsSection';
import TransfersSection from '@/components/admin/TransfersSection';
import AuditSection from '@/components/admin/AuditSection';
import ConfigSection from '@/components/admin/ConfigSection';

const ADMIN_CODE = '0001';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [config, setConfig] = useState<ConfiguracindelSistema | null>(null);
  const [currentUser, setCurrentUser] = useState<MiembrosdelaGuaridaVirgilio | null>(null);
  const [userRole, setUserRole] = useState<CargosyPermisos | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configResult = await BaseCrudService.getAll<ConfiguracindelSistema>('configuracion', {}, { limit: 1 });
      if (configResult.items.length > 0) {
        setConfig(configResult.items[0]);
      } else {
        // Create default config if none exists
        const newConfig: ConfiguracindelSistema = {
          _id: crypto.randomUUID(),
          configName: 'Sistema Principal',
          isPresidencyClaimed: false,
          minimumEconomicPoints: 200000000,
          criticalEconomicLevel: 60000000,
          adminAccessCode: ADMIN_CODE,
          referenceConversionRate: 1200000
        };
        await BaseCrudService.create('configuracion', newConfig);
        setConfig(newConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleLogin = async () => {
    if (code !== ADMIN_CODE) {
      setError('Código incorrecto');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // In a real system, we would validate the user's identity here
      // For now, we'll just authenticate with the code
      setIsAuthenticated(true);
      
      // Load user data if needed
      const membersResult = await BaseCrudService.getAll<MiembrosdelaGuaridaVirgilio>('miembros', {}, { limit: 1 });
      if (membersResult.items.length > 0) {
        setCurrentUser(membersResult.items[0]);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error al autenticar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="w-full py-16 px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-8 border border-gray-200"
            >
              <div className="text-center mb-8">
                <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h1 className="font-heading text-3xl text-foreground mb-2">
                  Panel Administrativo
                </h1>
                <p className="font-paragraph text-foreground/60">
                  Acceso restringido para usuarios autorizados
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="code" className="font-paragraph">Código de Acceso</Label>
                  <Input
                    id="code"
                    type="password"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError('');
                    }}
                    placeholder="Ingresa el código"
                    className="mt-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                {error && (
                  <p className="font-paragraph text-sm text-destructive">{error}</p>
                )}

                <Button
                  onClick={handleLogin}
                  disabled={isLoading || !code}
                  className="w-full bg-primary text-primary-foreground"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isLoading ? 'Verificando...' : 'Acceder'}
                </Button>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full">
        {/* Admin Header */}
        <section className="w-full bg-primary text-primary-foreground py-12 px-4">
          <div className="max-w-[100rem] mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-3xl md:text-4xl mb-2">
                  Panel Administrativo
                </h1>
                <p className="font-paragraph text-primary-foreground/80">
                  Gestión completa del sistema bancario
                </p>
              </div>
              <Button
                onClick={() => setIsAuthenticated(false)}
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </section>

        {/* Admin Tabs */}
        <section className="w-full py-8 px-4">
          <div className="max-w-[100rem] mx-auto">
            <Tabs defaultValue="presidency" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-2 h-auto bg-white p-2 rounded-xl border border-gray-200 mb-8">
                <TabsTrigger value="presidency" className="flex items-center gap-2 data-[state=active]:bg-accent-gold data-[state=active]:text-dark-night-blue">
                  <Crown className="w-4 h-4" />
                  <span className="hidden md:inline">Presidencia</span>
                </TabsTrigger>
                <TabsTrigger value="economy" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden md:inline">Economía</span>
                </TabsTrigger>
                <TabsTrigger value="reserve" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden md:inline">Reserva</span>
                </TabsTrigger>
                <TabsTrigger value="members" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">Miembros</span>
                </TabsTrigger>
                <TabsTrigger value="monetary" className="flex items-center gap-2 data-[state=active]:bg-accent-gold data-[state=active]:text-dark-night-blue">
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden md:inline">Emisiones</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="hidden md:inline">Proyectos</span>
                </TabsTrigger>
                <TabsTrigger value="transfers" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  <Send className="w-4 h-4" />
                  <span className="hidden md:inline">Transferencias</span>
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center gap-2 data-[state=active]:bg-accent-gold data-[state=active]:text-dark-night-blue">
                  <History className="w-4 h-4" />
                  <span className="hidden md:inline">Auditoría</span>
                </TabsTrigger>
                <TabsTrigger value="config" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Settings className="w-4 h-4" />
                  <span className="hidden md:inline">Config</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="presidency">
                <PresidencySection config={config} onConfigUpdate={loadConfig} />
              </TabsContent>

              <TabsContent value="economy">
                <EconomySection />
              </TabsContent>

              <TabsContent value="reserve">
                <ReserveSection />
              </TabsContent>

              <TabsContent value="members">
                <MembersSection />
              </TabsContent>

              <TabsContent value="monetary">
                <MonetaryRequestsSection />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectsSection />
              </TabsContent>

              <TabsContent value="transfers">
                <TransfersSection />
              </TabsContent>

              <TabsContent value="audit">
                <AuditSection />
              </TabsContent>

              <TabsContent value="config">
                <ConfigSection config={config} onConfigUpdate={loadConfig} />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
