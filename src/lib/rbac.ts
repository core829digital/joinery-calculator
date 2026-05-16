import type { UserRole } from "@/types";

export type Permission =
  | "view_configurator"
  | "edit_pricing"
  | "manage_dealers"
  | "manage_clients"
  | "manage_orders"
  | "view_all_orders"
  | "manage_commissions"
  | "view_reports"
  | "manage_settings"
  | "export_pdf"
  | "send_emails"
  | "view_supplier_prices"
  | "view_dealer_prices"
  | "manage_own_clients"
  | "view_own_orders"
  | "view_own_commissions";

export type RolePermissions = Record<Permission, boolean>;

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  guest: {
    view_configurator: true,
    edit_pricing: false,
    manage_dealers: false,
    manage_clients: false,
    manage_orders: false,
    view_all_orders: false,
    manage_commissions: false,
    view_reports: false,
    manage_settings: false,
    export_pdf: true,
    send_emails: true,
    view_supplier_prices: false,
    view_dealer_prices: false,
    manage_own_clients: false,
    view_own_orders: false,
    view_own_commissions: false,
  },
  client: {
    view_configurator: true,
    edit_pricing: false,
    manage_dealers: false,
    manage_clients: false,
    manage_orders: false,
    view_all_orders: false,
    manage_commissions: false,
    view_reports: false,
    manage_settings: false,
    export_pdf: true,
    send_emails: true,
    view_supplier_prices: false,
    view_dealer_prices: false,
    manage_own_clients: false,
    view_own_orders: true,
    view_own_commissions: false,
  },
  dealer: {
    view_configurator: true,
    edit_pricing: true,
    manage_dealers: false,
    manage_clients: true,
    manage_orders: false,
    view_all_orders: false,
    manage_commissions: false,
    view_reports: true,
    manage_settings: false,
    export_pdf: true,
    send_emails: true,
    view_supplier_prices: false,
    view_dealer_prices: true,
    manage_own_clients: true,
    view_own_orders: true,
    view_own_commissions: true,
  },
  supplier: {
    view_configurator: true,
    edit_pricing: true,
    manage_dealers: true,
    manage_clients: true,
    manage_orders: true,
    view_all_orders: true,
    manage_commissions: true,
    view_reports: true,
    manage_settings: true,
    export_pdf: true,
    send_emails: true,
    view_supplier_prices: true,
    view_dealer_prices: true,
    manage_own_clients: false,
    view_own_orders: false,
    view_own_commissions: true,
  },
  admin: {
    view_configurator: true,
    edit_pricing: true,
    manage_dealers: true,
    manage_clients: true,
    manage_orders: true,
    view_all_orders: true,
    manage_commissions: true,
    view_reports: true,
    manage_settings: true,
    export_pdf: true,
    send_emails: true,
    view_supplier_prices: true,
    view_dealer_prices: true,
    manage_own_clients: true,
    view_own_orders: true,
    view_own_commissions: true,
  },
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

export function getPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.guest;
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    "/configurator": ["view_configurator"],
    "/dashboard/dealer": ["view_configurator", "edit_pricing"],
    "/dashboard/supplier": ["manage_dealers", "manage_clients", "manage_orders"],
    "/dashboard": ["view_configurator"],
  };

  const requiredPermissions = routePermissions[route];
  if (!requiredPermissions) return true;

  return requiredPermissions.some((p) => hasPermission(role, p));
}

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Vizitator",
  client: "Client",
  dealer: "Dealer Partener",
  supplier: "Furnizor / Administrator",
  admin: "Administrator Sistem",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  guest: "slate",
  client: "emerald",
  dealer: "blue",
  supplier: "purple",
  admin: "red",
};