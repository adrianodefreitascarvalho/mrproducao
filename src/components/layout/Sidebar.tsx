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
  Ruler,
  ChevronDown,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

type NavigationItem = {
  name: string;
  href?: string;
  icon: LucideIcon;
  children?: { name: string; href: string }[];
};

const navigation: NavigationItem[] = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Dashboard Integrado", href: "/dashboard", icon: BarChart3 },
  { name: "Contactos", href: "/contacts", icon: Phone },
  { name: "Armas", href: "/weapons", icon: Crosshair }, 
  { name: "Clientes", href: "/clients", icon: Users },
  {
    name: "Fittings",
    icon: Ruler,
    children: [
      { name: "Gunstock Dimensions", href: "/fittings/gunstock" },
      { name: "Body Measurements", href: "/fittings/body" },
      { name: "Forehand Dimensions", href: "/fittings/forehand" },
    ],
  },
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    const activeParent = navigation.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.href))
    );
    if (activeParent) {
      // Adiciona o menu pai à lista de menus expandidos se ainda não estiver lá.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedMenus((prev) => {
        if (prev.includes(activeParent.name)) {
          return prev;
        }
        return [...prev, activeParent.name];
      });
    }
  }, [location.pathname]);

  const toggleMenu = (name: string) => {
    if (collapsed) setCollapsed(false);
    setExpandedMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

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
          if (item.children) {
            const isExpanded = expandedMenus.includes(item.name);
            const isChildActive = item.children.some(
              (child) => location.pathname.startsWith(child.href)
            );

            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    "sidebar-item w-full justify-between",
                    isChildActive && "text-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  )}
                </button>
                {!collapsed && isExpanded && (
                  <div className="mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.href}
                        className={cn(
                          "sidebar-item pl-11 h-9",
                          location.pathname.startsWith(child.href) &&
                            "sidebar-item-active"
                        )}
                      >
                        <span>{child.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href!}
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
