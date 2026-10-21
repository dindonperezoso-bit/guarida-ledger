import { Building2, Shield, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-dark-night-blue text-primary-foreground py-12 px-4">
      <div className="max-w-[100rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6" />
              <h3 className="font-heading text-xl">Banco de la Guarida Virgilio</h3>
            </div>
            <p className="font-paragraph text-primary-foreground/80 text-sm">
              Sistema de gestión económica transparente y seguro para la comunidad.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 font-paragraph text-sm">
              <li>
                <a href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Economía General
                </a>
              </li>
              <li>
                <a href="/reserva" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Reserva Bancaria
                </a>
              </li>
              <li>
                <a href="/miembros" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Miembros
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-lg mb-4">Información</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="font-paragraph text-sm text-primary-foreground/80">
                  Sistema Seguro
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-paragraph text-sm text-primary-foreground/80">
                  Auditoría Completa
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <p className="font-paragraph text-sm text-primary-foreground/60 text-center">
            © {new Date().getFullYear()} Banco de la Guarida Virgilio. Sistema de Gestión Económica.
          </p>
        </div>
      </div>
    </footer>
  );
}
