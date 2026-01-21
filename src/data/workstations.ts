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

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  client: string;
  product: string;
  quantity: number;
  currentWorkstation: string;
  currentOperation: string;
  status: OrderStatus;
  startDate: string;
  dueDate: string;
  progress: number;
}

export const sampleOrders: ProductionOrder[] = [
  {
    id: "1",
    orderNumber: "OP-2024-001",
    client: "Beretta",
    product: "Coronha Premium Nogueira",
    quantity: 25,
    currentWorkstation: "cnc",
    currentOperation: "Maquinação",
    status: "in-progress",
    startDate: "2024-01-15",
    dueDate: "2024-02-15",
    progress: 35,
  },
  {
    id: "2",
    orderNumber: "OP-2024-002",
    client: "Browning",
    product: "Fuste Clássico Carvalho",
    quantity: 50,
    currentWorkstation: "encaixe-manual",
    currentOperation: "Encaixe Platinas",
    status: "in-progress",
    startDate: "2024-01-10",
    dueDate: "2024-02-01",
    progress: 55,
  },
  {
    id: "3",
    orderNumber: "OP-2024-003",
    client: "Benelli",
    product: "Coronha Sport",
    quantity: 15,
    currentWorkstation: "acabamentos",
    currentOperation: "Envernizamento",
    status: "delayed",
    startDate: "2024-01-05",
    dueDate: "2024-01-25",
    progress: 78,
  },
  {
    id: "4",
    orderNumber: "OP-2024-004",
    client: "Fabarm",
    product: "Fuste Competição",
    quantity: 30,
    currentWorkstation: "polimento",
    currentOperation: "Polimento",
    status: "in-progress",
    startDate: "2024-01-18",
    dueDate: "2024-02-20",
    progress: 42,
  },
  {
    id: "5",
    orderNumber: "OP-2024-005",
    client: "Perazzi",
    product: "Coronha Luxo Raiz Nogueira",
    quantity: 5,
    currentWorkstation: "controlo-qualidade",
    currentOperation: "Verificação",
    status: "completed",
    startDate: "2024-01-01",
    dueDate: "2024-01-20",
    progress: 100,
  },
  {
    id: "6",
    orderNumber: "OP-2024-006",
    client: "Caesar Guerini",
    product: "Coronha Standard",
    quantity: 100,
    currentWorkstation: "preparacao",
    currentOperation: "Escolha da Madeira",
    status: "pending",
    startDate: "2024-01-22",
    dueDate: "2024-03-01",
    progress: 8,
  },
];
