export interface Customer{
  active: boolean;
  activity: string;
  address: string;
  bank: string;
  city: string;
  created_at: string;
  cuit: string;
  deactivated_at: string | null;
  email: string;
  fec_alta: string;
  fec_baja: string | null;
  id_province: number;
  id_tax_condition: number;
  id_bank: number;
  id: number;
  name: string;
  phone: string;
  province: string;
  surname: string;
  tax_condition: string;
  tax_key: string;
}

