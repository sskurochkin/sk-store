export type CreateContactRequestPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  consent: true;
};

export type ContactRequestStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type ContactRequestResponse = {
  id: string;
  status: ContactRequestStatus;
  createdAt: string;
};

/** Admin list/detail — includes customer PII and message. */
export type AdminContactRequest = {
  id: string;
  status: ContactRequestStatus;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
  createdAt: string;
  updatedAt: string;
};
