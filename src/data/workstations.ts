export interface Operation {
  id: string;
  name: string;
}

export interface Workstation {
  id: string;
  name: string;
  operations: Operation[];
  color: string;
  icon: string;
}

// Production Routing Types
export interface RoutingStep {
  id: string;
  workstationId: string;
  operationIds: string[];
  order: number;
  isRequired: boolean;
}

export interface ProductionRouting {
  id: string;
  name: string;
  steps: RoutingStep[];
  isDefault: boolean;
}

// Helper function to generate default routing (all workstations and all operations)
export function generateDefaultRouting(): ProductionRouting {
  const steps: RoutingStep[] = workstations.map((ws, index) => ({
    id: `step-${ws.id}`,
    workstationId: ws.id,
    operationIds: ws.operations.map(op => op.id),
    order: index,
    isRequired: true,
  }));

  return {
    id: `routing-${Date.now()}`,
    name: 'Roteiro Padrão',
    steps,
    isDefault: true,
  };
}

// Helper function to generate custom routing from selected workstations
export function generateRouting(workstationIds: string[]): ProductionRouting {
  const steps: RoutingStep[] = workstationIds
    .map((wsId, index) => {
      const ws = workstations.find(w => w.id === wsId);
      if (!ws) return null;
      return {
        id: `step-${ws.id}`,
        workstationId: ws.id,
        operationIds: ws.operations.map(op => op.id),
        order: index,
        isRequired: true,
      };
    })
    .filter((step): step is RoutingStep => step !== null);

  return {
    id: `routing-${Date.now()}`,
    name: 'Roteiro Personalizado',
    steps,
    isDefault: false,
  };
}

export const workstations: Workstation[] = [
  {
    id: "preparacao",
    name: "Preparação",
    operations: [
      { id: "fitting", name: "Fitting" },
      { id: "escolha-madeira", name: "Escolha da Madeira" },
      { id: "marcacao-cnc", name: "Marcação para CNC" },
    ],
    color: "hsl(210, 60%, 35%)",
    icon: "Package",
  },
  {
    id: "cnc",
    name: "CNC",
    operations: [
      { id: "cad", name: "CAD" },
      { id: "cam", name: "CAM" },
      { id: "maquinacao", name: "Maquinação" },
    ],
    color: "hsl(199, 89%, 48%)",
    icon: "Cpu",
  },
  {
    id: "encaixe-manual",
    name: "Encaixe Manual",
    operations: [
      { id: "encaixe-platinas", name: "Encaixe Platinas" },
      { id: "encaixe-fim-cnc", name: "Encaixe Fim CNC" },
      { id: "corte-cristas", name: "Corte Cristas" },
      { id: "ajuste-peso", name: "Ajuste de Peso da Coronha" },
      { id: "reparacoes", name: "Reparações" },
      { id: "cast", name: "Cast" },
      { id: "reforcos", name: "Reforços" },
      { id: "ajustes", name: "Ajustes" },
    ],
    color: "hsl(38, 92%, 50%)",
    icon: "Wrench",
  },
  {
    id: "desbaste",
    name: "Desbaste",
    operations: [
      { id: "pre-desbaste", name: "Pré-desbaste" },
      { id: "desbaste", name: "Desbaste" },
    ],
    color: "hsl(142, 71%, 45%)",
    icon: "Layers",
  },
  {
    id: "polimento",
    name: "Polimento",
    operations: [
      { id: "polimento", name: "Polimento" },
      { id: "marcacao-serrilhado", name: "Marcação serrilhado" },
    ],
    color: "hsl(280, 60%, 50%)",
    icon: "Sparkles",
  },
  {
    id: "serrilhados",
    name: "Serrilhados",
    operations: [{ id: "serrilhados", name: "Serrilhados" }],
    color: "hsl(330, 70%, 50%)",
    icon: "Grid3X3",
  },
  {
    id: "acabamentos",
    name: "Acabamentos",
    operations: [
      { id: "envernizamento", name: "Envernizamento" },
      { id: "gravacao-laser", name: "Gravação Laser" },
      { id: "montagem", name: "Montagem" },
    ],
    color: "hsl(25, 85%, 55%)",
    icon: "Paintbrush",
  },
  {
    id: "controlo-qualidade",
    name: "Controlo de Qualidade Final",
    operations: [
      { id: "verificacao", name: "Verificação" },
      { id: "fotografia", name: "Fotografia" },
      { id: "embalamento", name: "Embalamento" },
    ],
    color: "hsl(160, 70%, 40%)",
    icon: "CheckCircle",
  },
];

export type OrderStatus = "pending" | "in-progress" | "completed" | "delayed";

export interface ProductType {
  id: string;
  name: string;
}

export interface WoodGrade {
  id: string;
  name: string;
}

export interface WoodSpecies {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  frontPhoto: string;
  backPhoto: string;
  productTypeId: string;
  speciesId: string;
  woodGradeId: string;
  length: number; // mm
  width: number; // mm
  thickness: number; // mm
  weight: number; // g
  salePrice: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  nif: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  notes?: string;
  weaponIds: string[];
}

export type Caliber = '12' | '16' | '20' | '28' | '410';
export type DominantHand = 'Direita' | 'Esquerda';
export type SidePlates = 'Inteiras' | 'Inteiras falsas' | 'Meias';
export type Rib = 'Alta' | 'Media' | 'Baixa' | 'Rasa' | 'Ajustável';
export type CompetitionFrequency = 'Não Frequente' | 'Frequente' | 'Intensiva' | 'Profissional';

export interface Weapon {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  caliber: Caliber;
  dominantHand: DominantHand;
  sidePlates: SidePlates;
  barrelLength: number; // cm
  barrelWeight: number; // kg
  forendWeight: number; // gr
  rib: Rib;
  totalWeight: number; // kg
  discipline: string;
  competitionFrequency: CompetitionFrequency;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  client: Client;
  weapon?: Weapon;
  products: OrderProduct[];
  currentWorkstation: string;
  currentOperation: string;
  operationProgress?: number;
  status: OrderStatus;
  startDate: string;
  dueDate: string;
  progress: number;
  routing: ProductionRouting;
}

const productTypes: ProductType[] = [
  { id: 'coronha', name: 'Coronha' },
  { id: 'fuste', name: 'Fuste' },
];

const woodGrades: WoodGrade[] = [
  { id: 'grade1', name: 'Grau 1' },
  { id: 'grade2', name: 'Grau 2' },
  { id: 'grade3', name: 'Grau 3' },
  { id: 'grade4', name: 'Grau 4' },
  { id: 'grade5', name: 'Grau 5' },
  { id: 'exhibition', name: 'Exhibition' },
];

export const woodSpecies: WoodSpecies[] = [
  { id: 'nogueira-turca', name: 'Nogueira Turca' },
  { id: 'nogueira-americana', name: 'Nogueira Americana' },
  { id: 'carvalho', name: 'Carvalho' },
];

export const sampleProducts: Product[] = [];
let i = 1;
for (const pt of productTypes) {
  for (const wg of woodGrades) {
    for (const ws of woodSpecies) {
      sampleProducts.push({
        id: `prod-${i++}`,
        name: `${pt.name} ${ws.name} ${wg.name}`,
        description: `Um produto de alta qualidade: ${pt.name} feito de ${ws.name} com acabamento de ${wg.name}.`,
        sku: `${pt.id.toUpperCase()}-${ws.id.toUpperCase()}-${wg.id.toUpperCase()}-${String(i).padStart(4, '0')}`,
        frontPhoto: `https://picsum.photos/seed/${i}-front/400/300`,
        backPhoto: `https://picsum.photos/seed/${i}-back/400/300`,
        productTypeId: pt.id,
        speciesId: ws.id,
        woodGradeId: wg.id,
        length: 400 + (i * 5),
        width: 150 + (i * 2),
        thickness: 50 + (i * 1),
        weight: 800 + (i * 10),
        salePrice: 100 + (i * 15),
      });
    }
  }
}

export const clients: Client[] = [
  { id: 'cli-1', name: 'João Silva', email: 'joao.silva@email.com', phone: '912345678', nif: '123456789', address: 'Rua das Flores, 123', postalCode: '1000-001', city: 'Lisboa', country: 'Portugal', weaponIds: [] },
  { id: 'cli-2', name: 'Pedro Costa', email: 'pedro.costa@email.com', phone: '918765432', nif: '987654321', address: 'Av. da Liberdade, 456', postalCode: '4000-001', city: 'Porto', country: 'Portugal', weaponIds: [] },
  { id: 'cli-3', name: 'Vitor Meneres', email: 'vitor.meneres@email.com', phone: '933333333', nif: '111222333', address: 'Praceta Central, 7', postalCode: '3000-001', city: 'Coimbra', country: 'Portugal', weaponIds: [] },
  { id: 'cli-4', name: 'Sofia Pereira', email: 'sofia.pereira@email.com', phone: '966666666', nif: '444555666', address: 'Largo do Rossio, 12', postalCode: '8000-001', city: 'Faro', country: 'Portugal', weaponIds: [] },
  { id: 'cli-5', name: 'Marta Gomes', email: 'marta.gomes@email.com', phone: '922222222', nif: '777888999', address: 'Estrada Nacional, 10', postalCode: '4700-001', city: 'Braga', country: 'Portugal', weaponIds: [] },
  { id: 'cli-6', name: 'César Castro', email: 'cesar.castro@email.com', phone: '911111111', nif: '000111222', address: 'Bairro Alto, 5', postalCode: '1200-001', city: 'Lisboa', country: 'Portugal', weaponIds: [] },
];

export const weapons: Weapon[] = [
  {
    id: 'wep-1', brand: 'Beretta', model: '686', serialNumber: 'BER-123456', caliber: '12', dominantHand: 'Direita',
    sidePlates: 'Inteiras', barrelLength: 76, barrelWeight: 1.520, forendWeight: 450,
    rib: 'Media', totalWeight: 3.550, discipline: 'Fosso Olímpico', competitionFrequency: 'Frequente'
  },
  {
    id: 'wep-2', brand: 'Browning', model: 'Citori', serialNumber: 'BRO-789012', caliber: '12', dominantHand: 'Direita',
    sidePlates: 'Meias', barrelLength: 81, barrelWeight: 1.580, forendWeight: 470,
    rib: 'Alta', totalWeight: 3.750, discipline: 'Compak Sporting', competitionFrequency: 'Intensiva'
  },
  {
    id: 'wep-3', brand: 'Benelli', model: '828U', serialNumber: 'BEN-345678', caliber: '20', dominantHand: 'Esquerda',
    sidePlates: 'Inteiras falsas', barrelLength: 71, barrelWeight: 1.350, forendWeight: 400,
    rib: 'Rasa', totalWeight: 3.100, discipline: 'Caça', competitionFrequency: 'Não Frequente'
  },
  {
    id: 'wep-4', brand: 'Fabarm', model: 'Elos', serialNumber: 'FAB-901234', caliber: '28', dominantHand: 'Direita',
    sidePlates: 'Meias', barrelLength: 71, barrelWeight: 1.300, forendWeight: 380,
    rib: 'Baixa', totalWeight: 2.900, discipline: 'Percursos de Caça', competitionFrequency: 'Frequente'
  },
  {
    id: 'wep-5', brand: 'Perazzi', model: 'MX8', serialNumber: 'PER-567890', caliber: '12', dominantHand: 'Direita',
    sidePlates: 'Inteiras', barrelLength: 78, barrelWeight: 1.550, forendWeight: 460,
    rib: 'Ajustável', totalWeight: 3.800, discipline: 'Fosso Universal', competitionFrequency: 'Profissional'
  },
  {
    id: 'wep-6', brand: 'Caesar Guerini', model: 'Summit', serialNumber: 'CAE-112233', caliber: '12', dominantHand: 'Esquerda',
    sidePlates: 'Meias', barrelLength: 81, barrelWeight: 1.600, forendWeight: 480,
    rib: 'Alta', totalWeight: 3.850, discipline: 'Trap Americano', competitionFrequency: 'Intensiva'
  },
];

export const sampleOrders: ProductionOrder[] = [
  {
    id: "1",
    orderNumber: "OP-2024-001",
    client: clients[0],
    weapon: weapons[0],
    products: [{ productId: "prod-5", quantity: 1 }],
    currentWorkstation: "cnc",
    currentOperation: "Maquinação",
    operationProgress: 0,
    status: "in-progress",
    startDate: "2024-01-15",
    dueDate: "2024-02-15",
    progress: 35,
    routing: generateDefaultRouting(),
  },
  {
    id: "2",
    orderNumber: "OP-2024-002",
    client: clients[1],
    weapon: weapons[1],
    products: [{ productId: "prod-9", quantity: 1}],
    currentWorkstation: "encaixe-manual",
    currentOperation: "Encaixe Platinas",
    operationProgress: 0,
    status: "in-progress",
    startDate: "2024-01-10",
    dueDate: "2024-02-01",
    progress: 55,
    routing: generateDefaultRouting(),
  },
  {
    id: "3",
    orderNumber: "OP-2024-003",
    client: clients[2],
    weapon: weapons[2],
    products: [{ productId: "prod-4", quantity: 1 }],
    currentWorkstation: "acabamentos",
    currentOperation: "Envernizamento",
    operationProgress: 0,
    status: "delayed",
    startDate: "2024-01-05",
    dueDate: "2024-01-25",
    progress: 78,
    routing: generateDefaultRouting(),
  },
  {
    id: "4",
    orderNumber: "OP-2024-004",
    client: clients[3],
    weapon: weapons[3],
    products: [{ productId: "prod-12", quantity: 1 }],
    currentWorkstation: "polimento",
    currentOperation: "Polimento",
    operationProgress: 0,
    status: "in-progress",
    startDate: "2024-01-18",
    dueDate: "2024-02-20",
    progress: 42,
    routing: generateDefaultRouting(),
  },
  {
    id: "5",
    orderNumber: "OP-2024-005",
    client: clients[4],
    weapon: weapons[4],
    products: [{ productId: "prod-6", quantity:1 }],
    currentWorkstation: "controlo-qualidade",
    currentOperation: "Verificação",
    operationProgress: 0,
    status: "completed",
    startDate: "2024-01-01",
    dueDate: "2024-01-20",
    progress: 100,
    routing: generateDefaultRouting(),
  },
  {
    id: "6",
    orderNumber: "OP-2024-006",
    client: clients[5],
    weapon: weapons[5],
    products: [{ productId: "prod-2", quantity: 1 }],
    currentWorkstation: "preparacao",
    currentOperation: "Escolha da Madeira",
    operationProgress: 0,
    status: "pending",
    startDate: "2024-01-22",
    dueDate: "2024-03-01",
    progress: 8,
    routing: generateDefaultRouting(),
  },
];
