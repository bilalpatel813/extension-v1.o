/**
 * api.ts
 * ------------------------------------------------------------------
 * Single point of contact between the frontend and the backend.
 * Every function here does a real fetch() against the Django backend.
 * Nothing outside this file should need to change — every component
 * calls these functions, never localStorage directly.
 *
 * See BACKEND_INTEGRATION.md at the project root for the full
 * request/response contract these functions are written against.
 * ------------------------------------------------------------------
 */
const API_URL = "https://pursuit-dp8h.onrender.com/api";
export type JobStatus = "applied" | "interview" | "offer" | "rejected";
export type JobSource = "linkedin" | "indeed" | "naukri" | "manual";

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  location?: string;
  url?: string;
  source: JobSource;
  status: JobStatus;
  appliedAt: string; // ISO date string
  notes?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
}

/**
 * Pulls a human-readable message out of a DRF error response body, which
 * can come back in a few different shapes depending on how the view
 * raised it: {non_field_errors: [...]}, {detail: "..."}, or a plain
 * {field: ["..."]} validation-error dict. Explicitly typed as `unknown`
 * in and narrowed by hand, so this never trips the "implicitly any"
 * indexing error that the inline chain did.
 */
function extractErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;

    const nonFieldErrors = err.non_field_errors;
    if (Array.isArray(nonFieldErrors) && typeof nonFieldErrors[0] === "string") {
      return nonFieldErrors[0];
    }

    if (typeof err.detail === "string") {
      return err.detail;
    }

    if (typeof err.message === "string") {
      return err.message;
    }

    const firstValue = Object.values(err)[0];
    if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
      return firstValue[0];
    }
  }
  return fallback;
}

async function parseErrorResponse(res: Response, fallback?: string): Promise<string> {
  const error: unknown = await res.json().catch(() => ({}));
  return extractErrorMessage(error, fallback);
}

/* ------------------------------------------------------------------
 * AUTH
 * Django target: POST /api/auth/register/  ->  { user, access, refresh }
 * ------------------------------------------------------------------ */
export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<User> {
  const res = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res, "Registration failed"));
  }

  const data = await res.json();

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("pursuit_session", JSON.stringify(data.user));

  return data.user;
}

/**
 * Django target: POST /api/auth/login/  ->  { user, access, refresh }
 */
export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<User> {
  const res = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res, "Invalid credentials"));
  }

  const data = await res.json();
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("pursuit_session", JSON.stringify(data.user));

  return data.user;
}

/** Django target: POST /api/auth/logout/ (blacklists refresh token) */
export async function logoutUser(): Promise<void> {
  const refresh = localStorage.getItem("refresh");
  try {
    await fetch(`${API_URL}/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: JSON.stringify({ refresh }),
    });
  } catch (err) {
    console.error("Logout request failed, clearing local session anyway", err);
  } finally {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("pursuit_session");
  }
}

/** Django target: GET /api/auth/me/ */
export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem("access");
  if (!token) return null;

  const res = await fetch(`${API_URL}/auth/me/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;
  return await res.json();
}

/** Django target: PATCH /api/profile/ */
export async function updateProfile(
  updates: Partial<Pick<User, "fullName" | "email">>
): Promise<User> {
  const token = localStorage.getItem("access");
  const res = await fetch(`${API_URL}/profile/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res, "Failed to update profile"));
  }

  const data = await res.json();
  localStorage.setItem("pursuit_session", JSON.stringify(data));
  return data;
}

/** Django target: POST /api/auth/change-password/ */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): Promise<void> {
  const token = localStorage.getItem("access");

  const res = await fetch(`${API_URL}/auth/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_pass: input.currentPassword,
      new_pass: input.newPassword,
      re_enter_pass: input.confirmNewPassword,
    }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res, "Password change failed"));
  }
}

/* ------------------------------------------------------------------
 * APPLICATIONS
 * Django target: GET /api/applications/
 * ------------------------------------------------------------------ */
export async function getApplications(): Promise<JobApplication[]> {
  const token = localStorage.getItem("access");

  const res = await fetch(`${API_URL}/applications/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch applications");
  }

  return await res.json();
}

/** Django target: PATCH /api/applications/:id/ */
export async function updateApplicationStatus(
  id: string,
  status: JobStatus
): Promise<void> {
  const token = localStorage.getItem("access");

  const res = await fetch(`${API_URL}/applications/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to update application");
  }
}

/** Django target: DELETE /api/applications/:id/ */
export async function deleteApplication(id: string): Promise<void> {
  const token = localStorage.getItem("access");

  const res = await fetch(`${API_URL}/applications/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete application");
  }
}
