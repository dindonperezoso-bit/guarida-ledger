import { BaseCrudService } from '@/integrations';
import { hashPassword } from './auth-service';

/**
 * Initialize default user credentials and roles
 */
export async function initializeCredentials(): Promise<void> {
  try {
    // Check if credentials already exist
    const credentialsResult = await BaseCrudService.getAll<any>('credenciales', {}, { limit: 100 });
    if (credentialsResult.items.length > 0) {
      console.log('Credentials already initialized');
      return;
    }

    // Check if roles exist
    const rolesResult = await BaseCrudService.getAll<any>('cargos', {}, { limit: 100 });
    
    // Define roles if they don't exist
    const roles: { [key: string]: any } = {};
    
    const roleNames = ['PRESIDENTE DEL BANCO', 'SUPERVISOR FINANCIERO', 'ADMINISTRADOR DEL DINERO', 'MIEMBRO'];
    
    for (const roleName of roleNames) {
      let role = rolesResult.items.find((r: any) => r.roleName === roleName);
      
      if (!role) {
        // Create role
        const roleData: any = {
          _id: crypto.randomUUID(),
          roleName: roleName,
          description: `Rol de ${roleName}`,
          canManagePresidency: roleName === 'PRESIDENTE DEL BANCO',
          canApproveMonetaryIssuance: ['PRESIDENTE DEL BANCO', 'SUPERVISOR FINANCIERO'].includes(roleName),
          canExecuteMonetaryIssuance: ['PRESIDENTE DEL BANCO', 'ADMINISTRADOR DEL DINERO'].includes(roleName),
          canApproveProjects: ['PRESIDENTE DEL BANCO', 'SUPERVISOR FINANCIERO'].includes(roleName),
          canRegisterProjectPayments: ['PRESIDENTE DEL BANCO', 'ADMINISTRADOR DEL DINERO'].includes(roleName),
          canPerformTransfers: true,
          canViewAuditLog: ['PRESIDENTE DEL BANCO', 'SUPERVISOR FINANCIERO'].includes(roleName),
          canManageRoles: roleName === 'PRESIDENTE DEL BANCO',
          canConfigureEconomy: ['PRESIDENTE DEL BANCO', 'SUPERVISOR FINANCIERO'].includes(roleName)
        };
        
        await BaseCrudService.create('cargos', roleData);
        role = roleData;
      }
      
      roles[roleName] = role;
    }

    // Create member profiles for each user
    const membersResult = await BaseCrudService.getAll<any>('miembros', {}, { limit: 100 });
    
    const users = [
      { username: 'IKER', role: 'PRESIDENTE DEL BANCO', memberName: 'Iker' },
      { username: 'CRISTIAN', role: 'SUPERVISOR FINANCIERO', memberName: 'Cristian' },
      { username: 'JORDAN', role: 'ADMINISTRADOR DEL DINERO', memberName: 'Jordan' },
      { username: 'IAN', role: 'MIEMBRO', memberName: 'Ian' }
    ];

    const passwords: { [key: string]: string } = {
      'IKER': 'Iker_Virgilio#82',
      'CRISTIAN': 'Cristian_Super#47',
      'JORDAN': 'Jordan_Banco#63',
      'IAN': 'Ian_Guarida#29'
    };

    // Create credentials for each user
    for (const user of users) {
      // Check if member exists
      let member = membersResult.items.find((m: any) => m.memberName === user.memberName);
      
      if (!member) {
        // Create member profile
        const memberData: any = {
          _id: crypto.randomUUID(),
          memberName: user.memberName,
          email: `${user.username.toLowerCase()}@guarida.local`,
          availablePoints: 0,
          ahorrosPersonales: 0,
          ahorroBloqueado: 0,
          registrationDate: new Date().toISOString(),
          lastActivityDate: new Date().toISOString(),
          isOfficialMember: true
        };
        
        await BaseCrudService.create('miembros', memberData);
        member = memberData;
      }

      // Create credential
      const passwordHash = await hashPassword(passwords[user.username]);
      
      const credentialData: any = {
        _id: crypto.randomUUID(),
        username: user.username,
        passwordHash: passwordHash,
        userRole: user.role,
        memberProfileId: member._id,
        isActive: true,
        lastLoginDate: null
      };
      
      await BaseCrudService.create('credenciales', credentialData);
    }

    console.log('Credentials initialized successfully');
  } catch (error) {
    console.error('Error initializing credentials:', error);
  }
}
