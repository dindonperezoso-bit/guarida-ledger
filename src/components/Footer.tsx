import { Shield, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-halloween-black text-foreground py-12 px-4 border-t border-halloween-purple/30">
      <div className="max-w-[100rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎃</span>
              <h3 className="font-heading text-xl text-halloween-orange-light">Banco Guarida Virgilio</h3>
            </div>
            <p className="font-paragraph text-foreground/70 text-sm">
              Sistema de gestión económica transparente y seguro para la comunidad.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg text-halloween-orange-light mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 font-paragraph text-sm">
              <li>
                <a href="/" className="text-foreground/70 hover:text-halloween-orange-light transition-colors">
                  Economía General
                </a>
              </li>
              <li>
                <a href="/reserva" className="text-foreground/70 hover:text-halloween-orange-light transition-colors">
                  Reserva Bancaria
                </a>
              </li>
              <li>
                <a href="/miembros" className="text-foreground/70 hover:text-halloween-orange-light transition-colors">
                  Miembros
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-lg text-halloween-orange-light mb-4">Información</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-halloween-orange" />
                <span className="font-paragraph text-sm text-foreground/70">
                  Sistema Seguro
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-halloween-orange" />
                <span className="font-paragraph text-sm text-foreground/70">
                  Auditoría Completa
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-halloween-purple/30 pt-8">
          <p className="font-paragraph text-sm text-foreground/50 text-center">
            © {new Date().getFullYear()} Banco de la Guarida Virgilio. Sistema de Gestión Económica.
          </p>
        </div>
      </div>
    </footer>
  );
}
