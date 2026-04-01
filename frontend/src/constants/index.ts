export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export const SHOE_SIZES = ['6', '7', '8', '9', '10', '11', '12'] as const;

export const BRANDS = [
  'Nike',
  'Adidas',
  'Puma',
  'Jordan',
  'New Balance',
  'Reebok',
  'Converse',
  'Vans',
] as const;

export const COLORS = [
  'Black',
  'White',
  'Red',
  'Blue',
  'Green',
  'Brown',
  'Gray',
  'Navy',
  'Orange',
  'Pink',
] as const;

export const DEFAULT_PLACEHOLDER =
  'https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154';
