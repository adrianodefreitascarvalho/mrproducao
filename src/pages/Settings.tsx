import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Definições"
        subtitle="Configurações do sistema"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-8">
          {/* Company Info */}
          <section className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Informação da Empresa
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Nome da Empresa</Label>
                <Input
                  id="company"
                  defaultValue="Coronhas & Fustes, Lda."
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email de Contacto</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="producao@coronhasfustes.pt"
                  className="max-w-md"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Notifications */}
          <section className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Notificações</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Alertas de Atrasos</p>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações quando ordens estão atrasadas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Relatórios Diários</p>
                  <p className="text-sm text-muted-foreground">
                    Receber resumo de produção por email
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Ordens Concluídas</p>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando ordens são finalizadas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </section>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button>Guardar Alterações</Button>
            <Button variant="outline">Cancelar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
