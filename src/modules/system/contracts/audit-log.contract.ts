export type AuditLogEntityType =
  | "USER"
  | "PRODUCT"
  | "SUPPLIER"
  | "CUSTOMER_ACCOUNT"
  | "CATEGORY"
  | "ORDER"
  | "WAREHOUSE"
  | "STOREFRONT_ITEM"
  | "AUTH";

export type AuditLogAction = "CREATE" | "UPDATE" | "DELETE" | "STATUS_UPDATE" | "LOGIN" | "LOGOUT";

export type AuditLogItem = {
  id: string;
  entityType: AuditLogEntityType;
  entityId: string | null;
  entityLabel: string;
  action: AuditLogAction;
  actorUserId: string | null;
  actorLabel: string | null;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type AuditLogListQuery = {
  search?: string;
  entityType?: AuditLogEntityType;
  action?: AuditLogAction;
  actorUserId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export type AuditLogListResult = {
  items: AuditLogItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CreateAuditLogInput = {
  entityType: AuditLogEntityType;
  entityId?: string | null;
  action: AuditLogAction;
  actorUserId?: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
};
