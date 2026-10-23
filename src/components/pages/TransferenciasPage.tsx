import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { MiembrosdelaGuaridaVirgilio, PagosyTransferencias } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';

export default function TransferenciasPage() {
  const { member } = useMember();
  const [miembros, setMiembros] = useState<MiembrosdelaGuaridaVirgilio[]>([]);
  const [currentMember, setCurrentMember] = useState<MiembrosdelaGuaridaVirgilio | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    receiverId: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar todos los miembros
        const { items } = await BaseCrudService.getAll<MiembrosdelaGuaridaVirgilio>('miembros');
        setMiembros(items);

        // Encontrar el miembro actual
        if (member?.loginEmail) {
          let current = items.find(m => m.email === member.loginEmail);
          
          // Si no existe, crear automáticamente
          if (!current) {
            const newMember: MiembrosdelaGuaridaVirgilio = {
              _id: crypto.randomUUID(),
              memberName: member.profile?.nickname || member.loginEmail?.split('@')[0] || 'Miembro',
              email: member.loginEmail,
              availablePoints: 0,
              ahorrosPersonales: 0,
              ahorroBloqueado: 0,
              registrationDate: new Date().toISOString(),
              lastActivityDate: new Date().toISOString(),
              isOfficialMember: false
            };
            await BaseCrudService.create('miembros', newMember);
            current = newMember;
          }
          
          setCurrentMember(current || null);
        }
      } catch (err) {
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!formData.receiverId) {
      setError('Por favor selecciona un destinatario');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    if (!currentMember) {
      setError('No se pudo identificar tu perfil');
      return;
    }

    const amount = parseFloat(formData.amount);
    const currentPoints = currentMember.availablePoints || 0;

    if (amount > currentPoints) {
      setError(`No tienes suficientes puntos. Disponibles: ${currentPoints}`);
      return;
    }

    const receiver = miembros.find(m => m._id === formData.receiverId);
    if (!receiver) {
      setError('Destinatario no válido');
      return;
    }

    if (receiver._id === currentMember._id) {
      setError('No puedes transferir puntos a ti mismo');
      return;
    }

    try {
      setSubmitting(true);

      // Crear registro de transferencia
      const transactionId = crypto.randomUUID();
      const transferData: PagosyTransferencias = {
        _id: transactionId,
        transactionType: 'Transferencia de Puntos',
        senderMemberId: currentMember._id,
        receiverMemberId: receiver._id,
        amount: amount,
        transactionDate: new Date(),
        description: formData.description || 'Transferencia de puntos',
        projectId: '',
      };

      await BaseCrudService.create('transferencias', transferData);

      // Actualizar saldo del emisor
      await BaseCrudService.update('miembros', {
        _id: currentMember._id,
        availablePoints: currentPoints - amount,
      });

      // Actualizar saldo del receptor
      const receiverPoints = receiver.availablePoints || 0;
      await BaseCrudService.update('miembros', {
        _id: receiver._id,
        availablePoints: receiverPoints + amount,
      });

      // Actualizar estado local
      setCurrentMember({
        ...currentMember,
        availablePoints: currentPoints - amount,
      });

      setSuccess(`¡Transferencia exitosa! Se enviaron ${amount} puntos a ${receiver.memberName}`);
      setFormData({ receiverId: '', amount: '', description: '' });

      // Recargar datos después de 2 segundos
      setTimeout(() => {
        const loadData = async () => {
          const { items } = await BaseCrudService.getAll<MiembrosdelaGuaridaVirgilio>('miembros');
          setMiembros(items);
          const updated = items.find(m => m._id === currentMember._id);
          if (updated) setCurrentMember(updated);
        };
        loadData();
      }, 2000);
    } catch (err) {
      setError('Error al procesar la transferencia. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-halloween-black flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentMember) {
    return (
      <div className="min-h-screen bg-halloween-black flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <Alert className="bg-destructive/10 border-destructive">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              No se encontró tu perfil. Por favor, asegúrate de estar registrado.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  const availableReceivers = miembros.filter(m => m._id !== currentMember._id && m.isOfficialMember);

  return (
    <div className="min-h-screen bg-halloween-black flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-[100rem] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de transferencia */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-halloween-purple/20 to-halloween-orange/10 border-halloween-purple-bright/30 p-8">
              <div className="mb-8">
                <h1 className="font-heading text-4xl text-halloween-orange-light mb-2">
                  Transferencias
                </h1>
                <p className="font-paragraph text-foreground/70">
                  Envía puntos a otros miembros de la Guarida Virgilio
                </p>
              </div>

              {error && (
                <Alert className="mb-6 bg-destructive/10 border-destructive">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-green-500/10 border-green-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Destinatario */}
                <div className="space-y-2">
                  <Label className="font-paragraph text-foreground">Destinatario</Label>
                  <Select value={formData.receiverId} onValueChange={(value) => setFormData({ ...formData, receiverId: value })}>
                    <SelectTrigger className="bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground">
                      <SelectValue placeholder="Selecciona un miembro" />
                    </SelectTrigger>
                    <SelectContent className="bg-halloween-black border-halloween-purple-bright/30">
                      {availableReceivers.length > 0 ? (
                        availableReceivers.map(m => (
                          <SelectItem key={m._id} value={m._id} className="text-foreground">
                            {m.memberName} ({m.availablePoints || 0} puntos)
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

                {/* Monto */}
                <div className="space-y-2">
                  <Label className="font-paragraph text-foreground">Monto (Puntos)</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ingresa la cantidad de puntos"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground placeholder:text-foreground/40"
                  />
                  <p className="text-sm text-foreground/60">
                    Disponibles: {currentMember.availablePoints || 0} puntos
                  </p>
                </div>

                {/* Descripción/Motivo */}
                <div className="space-y-2">
                  <Label className="font-paragraph text-foreground">Motivo (Opcional)</Label>
                  <Textarea
                    placeholder="Describe el motivo de la transferencia"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground placeholder:text-foreground/40 resize-none"
                    rows={3}
                  />
                </div>

                {/* Botón de envío */}
                <Button
                  type="submit"
                  disabled={submitting || !formData.receiverId || !formData.amount}
                  className="w-full bg-gradient-to-r from-halloween-orange to-halloween-orange-light hover:from-halloween-orange-light hover:to-halloween-orange text-halloween-black font-heading text-lg py-6 rounded-lg transition-all duration-300"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner />
                      Procesando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Enviar Transferencia
                    </span>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Panel de información */}
          <div className="space-y-6">
            {/* Saldo actual */}
            <Card className="bg-gradient-to-br from-halloween-purple/20 to-halloween-purple-bright/10 border-halloween-purple-bright/30 p-6">
              <h3 className="font-heading text-xl text-halloween-orange-light mb-4">Tu Saldo</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Puntos Disponibles</p>
                  <p className="font-heading text-4xl text-electric-blue">
                    {currentMember.availablePoints || 0}
                  </p>
                </div>
                <div className="pt-4 border-t border-halloween-purple-bright/20">
                  <p className="text-foreground/60 text-sm mb-1">Ahorros Personales</p>
                  <p className="font-heading text-2xl text-halloween-orange-light">
                    {currentMember.ahorrosPersonales || 0}
                  </p>
                </div>
              </div>
            </Card>

            {/* Miembros activos */}
            <Card className="bg-gradient-to-br from-halloween-orange/10 to-halloween-orange-light/5 border-halloween-orange-light/30 p-6">
              <h3 className="font-heading text-xl text-halloween-orange-light mb-4">Miembros Activos</h3>
              <div className="space-y-2">
                <p className="text-foreground/60 text-sm">
                  Total: {availableReceivers.length} miembros
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {availableReceivers.slice(0, 5).map(m => (
                    <div key={m._id} className="flex justify-between items-center text-sm p-2 bg-halloween-black/30 rounded border border-halloween-orange-light/20">
                      <span className="text-foreground">{m.memberName}</span>
                      <span className="text-electric-blue font-heading">{m.availablePoints || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
