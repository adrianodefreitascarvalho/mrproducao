import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Factory,
  ClipboardList,
  BarChart3,
  Settings,
  Target,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Unlock,
  Package,
  Tags,
  Crosshair,
  TreePine,
  Users,
  Phone,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Dashboard Integrado", href: "/dashboard", icon: BarChart3 },
  { name: "Contactos", href: "/contacts", icon: Phone },
  { name: "Armas", href: "/weapons", icon: Crosshair }, 
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Madeiras", href: "/woodstock", icon: TreePine },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Tabelas de Preços", href: "/price-tables", icon: Tags },
  { name: "Encomendas", href: "/sales-orders", icon: ShoppingCart },
  { name: "Libertar Encomendas", href: "/release-orders", icon: Unlock },  
  { name: "Ordens de Produção", href: "/orders", icon: ClipboardList },
  { name: "Postos de Trabalho", href: "/workstations", icon: Factory },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "Gestão de Utilizadores", href: "/users", icon: UserCog },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex flex-col h-screen transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">MR-Gestão</span>
              <span className="text-[10px] text-sidebar-foreground/60">
                Gestão de Produção
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "sidebar-item",
                isActive && "sidebar-item-active"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings & Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <NavLink
          to="/settings"
          className={cn(
            "sidebar-item",
            location.pathname === "/settings" && "sidebar-item-active"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Definições</span>}
        </NavLink>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-item w-full"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
