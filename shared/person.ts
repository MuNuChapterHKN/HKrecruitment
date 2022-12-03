export interface Person {
  firstName: string;
  lastName: string;
  email: string;
  telegramId?: string;
  sex: string;
  role: 'applicant' | 'none' | 'clerk' | 'supervisor' | 'admin';
}