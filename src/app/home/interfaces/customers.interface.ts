export interface Customer{
  activity: string;
  address: string;
  city: string;
  cuit: string;
  email: string;
  fec_alta: string;
  fec_baja: string | null;
  id: number;
  name: string;
  phone: string;
  surname: string;
  tax_code: string;
  id_tax_condition: number;
  tax_condition: string;
}
