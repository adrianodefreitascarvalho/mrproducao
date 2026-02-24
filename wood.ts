export type WoodGrade = '2' | '3' | '4' | '5' | 'premium';
export type WoodSpecies = 'Nogueira Turca' | 'Nogueira Americana' | 'Carvalho' | 'Outra';
export type WoodCategory = 'coronha' | 'fuste' | 'semi-automática' | 'carabina';

export interface WoodStock {
  id: string;
  stockNumber: string;
  species: WoodSpecies;
  category: WoodCategory;
  grade: WoodGrade;
  length: number; // em mm
  width: number; // em mm
  thickness: number; // em mm
  salePrice: number; // em EUR
  createdAt: string;
}

export interface CreateWoodStockDTO {
  species: WoodSpecies;
  category: WoodCategory;
  grade: WoodGrade;
  length: number;
  width: number;
  thickness: number;
  salePrice: number;
}