import { BaseCrudService } from '@/integrations';
import { ConfiguracindelSistema, EconomaGeneral, MiembrosdelaGuaridaVirgilio } from '@/entities';

/**
 * Initialize system configuration if it doesn't exist
 */
export async function initializeSystemConfig(): Promise<ConfiguracindelSistema> {
  try {
    const result = await BaseCrudService.getAll<ConfiguracindelSistema>('configuracion', {}, { limit: 1 });
    
    if (result.items.length > 0) {
      return result.items[0];
    }

    // Create default config
    const newConfig: ConfiguracindelSistema = {
      _id: crypto.randomUUID(),
      configName: 'Sistema Principal',
      isPresidencyClaimed: false,
      currentPresidentMemberId: '',
      minimumEconomicPoints: 200000000,
      criticalEconomicLevel: 60000000,
      adminAccessCode: '0001',
      referenceConversionRate: 1200000
    };

    await BaseCrudService.create('configuracion', newConfig);
    return newConfig;
  } catch (error) {
    console.error('Error initializing system config:', error);
    throw error;
  }
}

/**
 * Initialize economy if it doesn't exist
 */
export async function initializeEconomy(): Promise<EconomaGeneral> {
  try {
    const result = await BaseCrudService.getAll<EconomaGeneral>('economia', {}, { limit: 1 });
    
    if (result.items.length > 0) {
      return result.items[0];
    }

    // Create initial economy record with 0
    const newEconomy: EconomaGeneral = {
      _id: crypto.randomUUID(),
      montoTotal: 0,
      fechaHora: new Date().toISOString(),
      tipoMovimiento: 'Inicialización',
      cantidadCambio: 0,
      descripcion: 'Sistema inicializado en cero'
    };

    await BaseCrudService.create('economia', newEconomy);
    return newEconomy;
  } catch (error) {
    console.error('Error initializing economy:', error);
    throw error;
  }
}

/**
 * Get or create member profile for authenticated user
 */
export async function getOrCreateMemberProfile(
  email: string,
  nickname?: string
): Promise<MiembrosdelaGuaridaVirgilio> {
  try {
    const result = await BaseCrudService.getAll<MiembrosdelaGuaridaVirgilio>('miembros', {}, { limit: 100 });
    let member = result.items.find(m => m.email === email);

    if (member) {
      return member;
    }

    // Create new member profile
    const newMember: MiembrosdelaGuaridaVirgilio = {
      _id: crypto.randomUUID(),
      memberName: nickname || email.split('@')[0] || 'Miembro',
      email: email,
      availablePoints: 0,
      ahorrosPersonales: 0,
      ahorroBloqueado: 0,
      registrationDate: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
      isOfficialMember: false
    };

    await BaseCrudService.create('miembros', newMember);
    return newMember;
  } catch (error) {
    console.error('Error getting or creating member profile:', error);
    throw error;
  }
}

/**
 * Ensure system is properly initialized on app load
 */
export async function ensureSystemInitialized(): Promise<void> {
  try {
    await Promise.all([
      initializeSystemConfig(),
      initializeEconomy()
    ]);
  } catch (error) {
    console.error('Error ensuring system initialization:', error);
    // Don't throw - allow app to continue even if initialization fails
  }
}
