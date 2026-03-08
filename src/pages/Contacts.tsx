import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  hearaboutus: string;
}

const getContactDisplayName = (contact: Contact) => {
  return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Sem nome';
};

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created', { ascending: false });
      
      if (error) {
        toast.error("Erro ao carregar contactos");
        console.error(error);
      } else {
        setContacts(data || []);
      }
      setLoading(false);
    };
    fetchContacts();
  }, []);

  const handleNewContact = () => navigate("/contacts/new");
  const handleEditContact = (id: string) => navigate(`/contacts/edit/${id}`);

  const handleDeleteContact = async (id: string, name: string) => {
    if (confirm(`Tem a certeza que pretende eliminar o contacto "${name}"?`)) {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) {
        toast.error("Erro ao eliminar contacto");
      } else {
        toast.success("Contacto eliminado");
        setContacts(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Contactos" subtitle="Gestão de contactos (Leads)" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleNewContact}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Contacto
          </Button>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Como conheceu</TableHead>
                <TableHead className="text-right w-25">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    A carregar contactos...
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum contacto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => {
                  const displayName = getContactDisplayName(contact);
                  return (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{displayName}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.hearaboutus}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditContact(contact.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteContact(contact.id, displayName)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Contacts;