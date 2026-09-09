import { ApiError, apiDelete, apiGet, apiPatch } from "@/services/api";
import {
  CONTACT_REQUEST_STATUSES,
} from "@/constants/contact-request-status";
import type {
  AdminContactRequest,
  ContactRequestStatus,
} from "@/types/contact-request";

function isContactRequestStatus(
  value: unknown,
): value is ContactRequestStatus {
  return (
    typeof value === "string" &&
    (CONTACT_REQUEST_STATUSES as readonly string[]).includes(value)
  );
}

function isAdminContactRequest(value: unknown): value is AdminContactRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    isContactRequestStatus(item.status) &&
    typeof item.firstName === "string" &&
    typeof item.lastName === "string" &&
    typeof item.phone === "string" &&
    typeof item.email === "string" &&
    typeof item.message === "string" &&
    typeof item.consent === "boolean" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

export async function listContactRequestsAdmin(
  cookie?: string,
): Promise<AdminContactRequest[]> {
  const data = await apiGet<unknown>("/api/contact-requests", {
    cache: "no-store",
    cookie,
    credentials: cookie ? undefined : "same-origin",
  });

  if (!Array.isArray(data)) {
    throw new ApiError("Contact requests API returned a non-array payload", 500);
  }

  return data.filter(isAdminContactRequest);
}

export async function getContactRequestAdmin(
  id: string,
  cookie?: string,
): Promise<AdminContactRequest> {
  const data = await apiGet<unknown>(
    `/api/contact-requests/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
      cookie,
      credentials: cookie ? undefined : "same-origin",
    },
  );

  if (!isAdminContactRequest(data)) {
    throw new ApiError("Contact request API returned an invalid payload", 500);
  }

  return data;
}

export async function updateContactRequestStatus(
  id: string,
  status: ContactRequestStatus,
): Promise<AdminContactRequest> {
  const data = await apiPatch<unknown>(
    `/api/contact-requests/${encodeURIComponent(id)}/status`,
    { status },
  );

  if (!isAdminContactRequest(data)) {
    throw new ApiError(
      "Update contact request status returned an invalid payload",
      500,
    );
  }

  return data;
}

export async function deleteContactRequest(id: string): Promise<void> {
  await apiDelete(`/api/contact-requests/${encodeURIComponent(id)}`);
}
