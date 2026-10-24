/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: auditoria
 * Interface for HistorialdeAuditora
 */
export interface HistorialdeAuditora {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  actionType?: string;
  /** @wixFieldType text */
  responsibleUser?: string;
  /** @wixFieldType datetime */
  timestamp?: Date | string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  result?: string;
}


/**
 * Collection ID: cargos
 * Interface for CargosyPermisos
 */
export interface CargosyPermisos {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  roleName?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType boolean */
  canManagePresidency?: boolean;
  /** @wixFieldType boolean */
  canApproveMonetaryIssuance?: boolean;
  /** @wixFieldType boolean */
  canExecuteMonetaryIssuance?: boolean;
  /** @wixFieldType boolean */
  canApproveProjects?: boolean;
  /** @wixFieldType boolean */
  canRegisterProjectPayments?: boolean;
  /** @wixFieldType boolean */
  canPerformTransfers?: boolean;
  /** @wixFieldType boolean */
  canViewAuditLog?: boolean;
  /** @wixFieldType boolean */
  canManageRoles?: boolean;
  /** @wixFieldType boolean */
  canConfigureEconomy?: boolean;
}


/**
 * Collection ID: configuracion
 * Interface for ConfiguracindelSistema
 */
export interface ConfiguracindelSistema {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  configName?: string;
  /** @wixFieldType boolean */
  isPresidencyClaimed?: boolean;
  /** @wixFieldType text */
  currentPresidentMemberId?: string;
  /** @wixFieldType datetime */
  presidencyClaimedAt?: Date | string;
  /** @wixFieldType number */
  minimumEconomicPoints?: number;
  /** @wixFieldType number */
  criticalEconomicLevel?: number;
  /** @wixFieldType text */
  adminAccessCode?: string;
  /** @wixFieldType number */
  referenceConversionRate?: number;
}


/**
 * Collection ID: credenciales
 * Interface for UserCredentials
 */
export interface UserCredentials {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  username?: string;
  /** @wixFieldType text */
  passwordHash?: string;
  /** @wixFieldType text */
  userRole?: string;
  /** @wixFieldType text */
  memberProfileId?: string;
  /** @wixFieldType boolean */
  isActive?: boolean;
  /** @wixFieldType datetime */
  lastLoginDate?: Date | string;
}


/**
 * Collection ID: economia
 * Interface for EconomaGeneral
 */
export interface EconomaGeneral {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  montoTotal?: number;
  /** @wixFieldType datetime */
  fechaHora?: Date | string;
  /** @wixFieldType text */
  tipoMovimiento?: string;
  /** @wixFieldType number */
  cantidadCambio?: number;
  /** @wixFieldType text */
  descripcion?: string;
}


/**
 * Collection ID: emisiones
 * Interface for EmisionesMonetarias
 */
export interface EmisionesMonetarias {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  transactionId?: string;
  /** @wixFieldType number */
  amountEmitted?: number;
  /** @wixFieldType datetime */
  executionDate?: Date | string;
  /** @wixFieldType text */
  reason?: string;
  /** @wixFieldType text */
  approvingAuthorities?: string;
  /** @wixFieldType text */
  issuedBy?: string;
  /** @wixFieldType text */
  status?: string;
}


/**
 * Collection ID: miembros
 * Interface for MiembrosdelaGuaridaVirgilio
 */
export interface MiembrosdelaGuaridaVirgilio {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  ahorroBloqueado?: number;
  /** @wixFieldType date */
  fechaDesbloqueoAhorro?: Date | string;
  /** @wixFieldType text */
  memberName?: string;
  /** @wixFieldType number */
  ahorrosPersonales?: number;
  /** @wixFieldType text */
  email?: string;
  /** @wixFieldType number */
  availablePoints?: number;
  /** @wixFieldType datetime */
  registrationDate?: Date | string;
  /** @wixFieldType datetime */
  lastActivityDate?: Date | string;
  /** @wixFieldType boolean */
  isOfficialMember?: boolean;
}


/**
 * Collection ID: proyectos
 * Interface for ProyectosyCompras
 */
export interface ProyectosyCompras {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  projectName?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType number */
  requestedBudget?: number;
  /** @wixFieldType text */
  justification?: string;
  /** @wixFieldType text */
  requester?: string;
  /** @wixFieldType text */
  approvalStatus?: string;
  /** @wixFieldType number */
  approvedBudget?: number;
  /** @wixFieldType number */
  spentBudget?: number;
  /** @wixFieldType datetime */
  approvalDate?: Date | string;
}


/**
 * Collection ID: reserva
 * Interface for ReservaBancaria
 */
export interface ReservaBancaria {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  movementType?: string;
  /** @wixFieldType number */
  amount?: number;
  /** @wixFieldType datetime */
  movementDateTime?: Date | string;
  /** @wixFieldType number */
  currentReserveBalance?: number;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  responsibleUser?: string;
}


/**
 * Collection ID: solicitudesmonetarias
 * Interface for SolicitudesMonetarias
 */
export interface SolicitudesMonetarias {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  requestedAmount?: number;
  /** @wixFieldType text */
  reason?: string;
  /** @wixFieldType text */
  requester?: string;
  /** @wixFieldType datetime */
  requestDate?: Date | string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  approverComments?: string;
}


/**
 * Collection ID: transferencias
 * Interface for PagosyTransferencias
 */
export interface PagosyTransferencias {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  transactionType?: string;
  /** @wixFieldType text */
  senderMemberId?: string;
  /** @wixFieldType text */
  receiverMemberId?: string;
  /** @wixFieldType number */
  amount?: number;
  /** @wixFieldType datetime */
  transactionDate?: Date | string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  projectId?: string;
}
