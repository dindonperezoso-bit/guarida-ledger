import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { ProyectosyCompras } from '@/entities';
import { FileText, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProjectsSection() {
  const [projects, setProjects] = useState<ProyectosyCompras[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    requestedBudget: '',
    justification: '',
    requester: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState<{ projectId: string; amount: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await BaseCrudService.getAll<ProyectosyCompras>('proyectos', {}, { limit: 50 });
      setProjects(result.items);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!formData.projectName || !formData.requestedBudget || !formData.requester) return;

    setIsSubmitting(true);
    try {
      await BaseCrudService.create('proyectos', {
        _id: crypto.randomUUID(),
        projectName: formData.projectName,
        description: formData.description,
        requestedBudget: parseFloat(formData.requestedBudget),
        justification: formData.justification,
        requester: formData.requester,
        approvalStatus: 'Pendiente',
        approvedBudget: 0,
        spentBudget: 0
      });

      setFormData({ projectName: '', description: '', requestedBudget: '', justification: '', requester: '' });
      setShowNewProjectForm(false);
      // Reload immediately without setTimeout to prevent UI freeze
      loadData();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveProject = async (project: ProyectosyCompras) => {
    try {
      await BaseCrudService.update<ProyectosyCompras>('proyectos', {
        _id: project._id,
        approvalStatus: 'Aprobado',
        approvedBudget: project.requestedBudget,
        approvalDate: new Date().toISOString()
      });

      // Reload immediately without setTimeout to prevent UI freeze
      loadData();
    } catch (error) {
      console.error('Error approving project:', error);
    }
  };

  const handleRejectProject = async (project: ProyectosyCompras) => {
    try {
      await BaseCrudService.update<ProyectosyCompras>('proyectos', {
        _id: project._id,
        approvalStatus: 'Rechazado'
      });

      // Reload immediately without setTimeout to prevent UI freeze
      loadData();
    } catch (error) {
      console.error('Error rejecting project:', error);
    }
  };

  const handleRegisterPayment = async () => {
    if (!paymentForm) return;

    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount)) return;

    try {
      const project = projects.find(p => p._id === paymentForm.projectId);
      if (!project) return;

      const newSpent = (project.spentBudget || 0) + amount;

      await BaseCrudService.update<ProyectosyCompras>('proyectos', {
        _id: project._id,
        spentBudget: newSpent
      });

      setPaymentForm(null);
      // Reload immediately without setTimeout to prevent UI freeze
      loadData();
    } catch (error) {
      console.error('Error registering payment:', error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Aprobado':
        return 'bg-green-100 text-green-700';
      case 'Rechazado':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h2 className="font-heading text-2xl text-foreground">Proyectos y Compras</h2>
              <p className="font-paragraph text-foreground/60">
                Gestiona solicitudes de proyectos y presupuestos
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewProjectForm(!showNewProjectForm)}
            className="bg-primary text-primary-foreground"
          >
            {showNewProjectForm ? 'Cancelar' : 'Nuevo Proyecto'}
          </Button>
        </div>

        {showNewProjectForm && (
          <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-heading text-lg text-foreground mb-4">Nueva Solicitud de Proyecto</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectName" className="font-paragraph">Nombre del Proyecto</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Nombre del proyecto"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-paragraph">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el proyecto"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="budget" className="font-paragraph">Presupuesto Solicitado</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.requestedBudget}
                  onChange={(e) => setFormData({ ...formData, requestedBudget: e.target.value })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="justification" className="font-paragraph">Justificación</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder="Justifica la necesidad del proyecto"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="requester" className="font-paragraph">Solicitante</Label>
                <Input
                  id="requester"
                  value={formData.requester}
                  onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                  placeholder="Nombre del solicitante"
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleCreateProject}
                disabled={isSubmitting || !formData.projectName || !formData.requestedBudget || !formData.requester}
                className="w-full bg-primary text-primary-foreground"
              >
                {isSubmitting ? 'Creando...' : 'Crear Solicitud'}
              </Button>
            </div>
          </div>
        )}

        <div className="min-h-[300px]">
          {isLoading ? null : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="font-heading text-left py-4 px-4">Proyecto</th>
                    <th className="font-heading text-left py-4 px-4">Solicitante</th>
                    <th className="font-heading text-right py-4 px-4">Presupuesto</th>
                    <th className="font-heading text-right py-4 px-4">Gastado</th>
                    <th className="font-heading text-center py-4 px-4">Estado</th>
                    <th className="font-heading text-center py-4 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="font-paragraph py-4 px-4">
                        <div>
                          <p className="font-medium">{project.projectName}</p>
                          <p className="text-sm text-foreground/60">{project.description}</p>
                        </div>
                      </td>
                      <td className="font-paragraph py-4 px-4 text-sm">
                        {project.requester}
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right font-bold text-primary">
                        {project.approvalStatus === 'Aprobado' 
                          ? (project.approvedBudget || 0).toLocaleString()
                          : (project.requestedBudget || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-right font-bold text-accent-gold">
                        {(project.spentBudget || 0).toLocaleString()} P
                      </td>
                      <td className="font-paragraph py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(project.approvalStatus)}`}>
                          {project.approvalStatus}
                        </span>
                      </td>
                      <td className="font-paragraph py-4 px-4">
                        <div className="flex gap-2 justify-center">
                          {project.approvalStatus === 'Pendiente' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveProject(project)}
                                className="bg-green-500 text-white hover:bg-green-600"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRejectProject(project)}
                                className="bg-red-500 text-white hover:bg-red-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {project.approvalStatus === 'Aprobado' && (
                            <Button
                              size="sm"
                              onClick={() => setPaymentForm({ projectId: project._id, amount: '' })}
                              className="bg-accent-gold text-dark-night-blue hover:bg-accent-gold/90"
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Payment Form Modal */}
      {paymentForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPaymentForm(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-xl text-foreground mb-4">Registrar Pago</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentAmount" className="font-paragraph">Cantidad del Pago</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleRegisterPayment}
                  disabled={!paymentForm.amount}
                  className="flex-1 bg-accent-gold text-dark-night-blue hover:bg-accent-gold/90"
                >
                  Registrar
                </Button>
                <Button
                  onClick={() => setPaymentForm(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
