export interface Customer {
  active: boolean;
  activity: string;
  address: string;
  bank: string;
  city: string;
  created_at: string;
  cuit: string;
  deactivated_at: string | null;
  email: string;
  hasDREI: boolean;
  highlight?: boolean;
  id_bank: number;
  id_province: number;
  id_sex: number;
  id_user: number;
  id_tax_condition: number;
  id_type: number;
  id: number;
  name: string;
  nro_cuenta_DREI: number;
  nro_reg_DREI: number;
  phone: string;
  province: string;
  surname: string;
  tax_condition: string;
  tax_key: string;
  type_person: string;
}
