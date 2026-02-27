import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, KeyRound } from "lucide-react";
import { getSafeAuthErrorMessage } from "@/lib/authErrors";

type AuthView = "login" | "signup" | "forgot-password";

export default function Login() {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao entrar", description: getSafeAuthErrorMessage(error), variant: "destructive" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Erro", description: "A palavra-passe deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao registar", description: getSafeAuthErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Registo efetuado", description: "Verifique o seu email para confirmar a conta." });
      setView("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Erro", description: "Insira o seu email.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: getSafeAuthErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Email enviado", description: "Verifique o seu email para redefinir a palavra-passe." });
      setView("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {view === "login" && "Entrar"}
            {view === "signup" && "Criar Conta"}
            {view === "forgot-password" && "Recuperar Palavra-passe"}
          </CardTitle>
          <CardDescription>
            {view === "login" && "Aceda ao sistema de produção"}
            {view === "signup" && "Crie a sua conta para aceder ao sistema"}
            {view === "forgot-password" && "Insira o email para recuperar o acesso"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={view === "login" ? handleLogin : view === "signup" ? handleSignup : handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@exemplo.com" />
            </div>
            {view !== "forgot-password" && (
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {view === "login" && <><LogIn className="w-4 h-4 mr-2" /> Entrar</>}
              {view === "signup" && <><UserPlus className="w-4 h-4 mr-2" /> Registar</>}
              {view === "forgot-password" && <><KeyRound className="w-4 h-4 mr-2" /> Enviar Email</>}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-1">
            {view === "login" && (
              <>
                <button type="button" onClick={() => setView("forgot-password")} className="text-muted-foreground hover:text-foreground underline block w-full">Esqueceu a palavra-passe?</button>
                <button type="button" onClick={() => setView("signup")} className="text-primary hover:underline block w-full">Criar nova conta</button>
              </>
            )}
            {(view === "signup" || view === "forgot-password") && (
              <button type="button" onClick={() => setView("login")} className="text-primary hover:underline">Voltar ao login</button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
