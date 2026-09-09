export type CreateContactRequestPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  consent: true;
};

export type ContactRequestResponse = {
  id: string;
  status: "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};
