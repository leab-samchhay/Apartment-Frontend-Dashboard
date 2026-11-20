export interface OrtherExpens {
  id: number;
  date?: string;
  expenseTypeId?: number;
  amount?: number;
  note?: string;
  createBy?: string;
  createdDate?: string;
  image?: File | string | null;
}