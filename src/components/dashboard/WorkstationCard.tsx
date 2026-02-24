import {
  Package,
  Cpu,
  Wrench,
  Layers,
  Sparkles,
  Grid3X3,
  Paintbrush,
  CheckCircle,
} from "lucide-react";
import { Workstation } from "@/data/workstations";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Package,
  Cpu,
  Wrench,
  Layers,
  Sparkles,
  Grid3X3,
  Paintbrush,
  CheckCircle,
};

interface WorkstationCardProps {
  workstation: Workstation;
  activeOrders: number;
  onClick?: () => void;
}

export function WorkstationCard({
  workstation,
  activeOrders,
  onClick,
}: WorkstationCardProps) {
  const Icon = iconMap[workstation.icon] || Package;

  return (
    <div
      className="workstation-card cursor-pointer group"
      onClick={onClick}
    >
      <div
        className="h-1.5"
        style={{ backgroundColor: workstation.color }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${workstation.color}20` }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: workstation.color }}
            />
          </div>
          {activeOrders > 0 && (
            <Badge
              variant="secondary"
              className="bg-info/10 text-info border-0"
            >
              {activeOrders} ativas
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {workstation.name}
        </h3>

        <div className="flex flex-wrap gap-1">
          {workstation.operations.slice(0, 3).map((op) => (
            <span
              key={op.id}
              className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {op.name}
            </span>
          ))}
          {workstation.operations.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              +{workstation.operations.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
