import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { runAuthDiagnostics, testAuthentication } from '@/lib/auth-diagnostics';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [testUsername, setTestUsername] = useState('IKER');
  const [testPassword, setTestPassword] = useState('Iker_Virgilio#82');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const result = await runAuthDiagnostics();
      setDiagnostics(result);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAuth = async () => {
    setIsTestLoading(true);
    try {
      const result = await testAuthentication(testUsername, testPassword);
      setTestResult(result);
    } catch (error) {
      console.error('Error testing authentication:', error);
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-halloween-black flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-[100rem] mx-auto w-full px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-heading text-4xl text-halloween-orange-light mb-8">
            Diagnóstico del Sistema de Autenticación
          </h1>

          {/* Diagnostics Section */}
          <div className="bg-halloween-purple/20 rounded-2xl p-8 border border-halloween-purple/40 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-halloween-orange-light">
                Estado del Sistema
              </h2>
              <Button
                onClick={runDiagnostics}
                disabled={isLoading}
                className="bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isLoading ? 'Analizando...' : 'Actualizar'}
              </Button>
            </div>

            {diagnostics && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-halloween-black/50 rounded-lg p-4 border border-halloween-purple/30">
                    <p className="text-foreground/60 text-sm mb-2">Credenciales</p>
                    <p className="text-2xl font-bold text-halloween-orange-light">
                      {diagnostics.credentialsCount}
                    </p>
                  </div>
                  <div className="bg-halloween-black/50 rounded-lg p-4 border border-halloween-purple/30">
                    <p className="text-foreground/60 text-sm mb-2">Miembros</p>
                    <p className="text-2xl font-bold text-halloween-orange-light">
                      {diagnostics.membersCount}
                    </p>
                  </div>
                  <div className="bg-halloween-black/50 rounded-lg p-4 border border-halloween-purple/30">
                    <p className="text-foreground/60 text-sm mb-2">Roles</p>
                    <p className="text-2xl font-bold text-halloween-orange-light">
                      {diagnostics.rolesCount}
                    </p>
                  </div>
                </div>

                {/* Credentials List */}
                {diagnostics.credentials.length > 0 && (
                  <div>
                    <h3 className="font-heading text-lg text-halloween-orange-light mb-4">
                      Credenciales Encontradas
                    </h3>
                    <div className="space-y-2">
                      {diagnostics.credentials.map((cred: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-halloween-black/50 rounded-lg p-4 border border-halloween-purple/30 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-foreground">{cred.username}</p>
                            <p className="text-sm text-foreground/60">{cred.userRole}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {cred.isActive ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                            )}
                            <span className="text-sm text-foreground/60">
                              {cred.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {diagnostics.errors.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                    <h3 className="font-heading text-lg text-destructive mb-2">Problemas Detectados</h3>
                    <ul className="space-y-1">
                      {diagnostics.errors.map((error: string, idx: number) => (
                        <li key={idx} className="text-sm text-destructive flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Authentication Section */}
          <div className="bg-halloween-purple/20 rounded-2xl p-8 border border-halloween-purple/40">
            <h2 className="font-heading text-2xl text-halloween-orange-light mb-6">
              Prueba de Autenticación
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="test-username" className="text-foreground mb-2 block">
                  Nombre de Usuario
                </Label>
                <Input
                  id="test-username"
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                  className="bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground"
                  placeholder="Ingresa nombre de usuario"
                />
              </div>

              <div>
                <Label htmlFor="test-password" className="text-foreground mb-2 block">
                  Contraseña
                </Label>
                <Input
                  id="test-password"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground"
                  placeholder="Ingresa contraseña"
                />
              </div>

              <Button
                onClick={handleTestAuth}
                disabled={isTestLoading || !testUsername || !testPassword}
                className="w-full bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light"
              >
                {isTestLoading ? 'Probando...' : 'Probar Autenticación'}
              </Button>
            </div>

            {testResult && (
              <div
                className={`rounded-lg p-4 border ${
                  testResult.success
                    ? 'bg-green-500/10 border-green-500'
                    : 'bg-destructive/10 border-destructive'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  )}
                  <p
                    className={`font-bold ${
                      testResult.success ? 'text-green-500' : 'text-destructive'
                    }`}
                  >
                    {testResult.message}
                  </p>
                </div>
                {testResult.details && (
                  <pre className="text-xs text-foreground/60 bg-halloween-black/50 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-halloween-purple/30">
              <p className="font-paragraph text-xs text-halloween-purple-bright uppercase tracking-wider mb-3 font-bold">
                Cuentas de Demostración
              </p>
              <div className="space-y-2 text-xs text-foreground/70 font-paragraph">
                <p>
                  <span className="text-halloween-orange-light font-bold">IKER</span> - Iker_Virgilio#82
                </p>
                <p>
                  <span className="text-halloween-orange-light font-bold">CRISTIAN</span> - Cristian_Super#47
                </p>
                <p>
                  <span className="text-halloween-orange-light font-bold">JORDAN</span> - Jordan_Banco#63
                </p>
                <p>
                  <span className="text-halloween-orange-light font-bold">IAN</span> - Ian_Guarida#29
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
