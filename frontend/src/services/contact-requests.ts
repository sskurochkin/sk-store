import { ApiError, apiPost } from "@/services/api";
import type {
  ContactRequestResponse,
  CreateContactRequestPayload,
} from "@/types/contact-request";

function isContactRequestResponse(
  value: unknown,
): value is ContactRequestResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.status === "string" &&
    typeof item.createdAt === "string"
  );
}

/**
 * Submits a public contact request. Does not send status or system fields.
 */
export async function createContactRequest(
  payload: CreateContactRequestPayload,
): Promise<ContactRequestResponse> {
  const data = await apiPost<unknown>("/api/contact-requests", payload);

  if (!isContactRequestResponse(data)) {
    throw new ApiError("Contact request API returned an invalid payload", 500);
  }

  return data;
}
