import type { ContactRequestResponse } from './contact-request-response.type';

export type AdminContactRequestResponse = {
  id: string;
  status: ContactRequestResponse['status'];
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
  createdAt: Date;
  updatedAt: Date;
};
