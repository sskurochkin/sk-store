export type ContactRequestResponse = {
  id: string;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
};
