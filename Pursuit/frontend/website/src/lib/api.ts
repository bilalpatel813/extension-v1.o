/**
 * api.ts
 * ------------------------------------------------------------------
 * Single point of contact between the frontend and the backend.
 *
 * Right now every function here is a MOCK — it reads/writes
 * localStorage so the UI is fully clickable before the Django backend
 * exists. When the backend is ready, replace the body of each
 * function with a real `fetch()` call to the endpoint noted in its
 * comment. Nothing outside this file should need to change — every
 * component calls these functions, never localStorage directly.
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

const DELAY = 350; // simulated network latency so loading states are visible

function wait(ms = DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readUsers(): Array<User & { password: string }> {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("pursuit_users") || "[]");
}

function writeUsers(users: Array<User & { password: string }>) {
  localStorage.setItem("pursuit_users", JSON.stringify(users));
}

function readApplications(userId: string): JobApplication[] {
  if (typeof window === "undefined") return [];
  const all = JSON.parse(localStorage.getItem("pursuit_applications") || "{}");
  return all[userId] || [];
}

function writeApplications(userId: string, apps: JobApplication[]) {
  const all = JSON.parse(localStorage.getItem("pursuit_applications") || "{}");
  all[userId] = apps;
  localStorage.setItem("pursuit_applications", JSON.stringify(all));
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
    body: JSON.stringify({input})
 });
 
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Registration failed");
  }

  const data = await res.json();

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("pursuit_session", JSON.stringify(data.user));

  return data.user;
}

/**
 * Django target: POST /api/auth/login/  ->  { access, refresh }
 * followed by  GET /api/auth/me/  ->  { user }
 */
export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<User> {
    const res = await fetch(`${API_URL}/auth/login/`,{
        method :"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(input)        
       });
      if (!res.ok){
           throw new Error("Invalid credential");
       }
      const data = await res.json();
      localStorage.setItem("refresh",data.access);
      localStorage.setItem("access",data.access);
      localStorage.setItem("pursuit_session", JSON.stringify(data.user));
      
      return data.user;
}
  
/** Django target: POST /api/auth/logout/ (blacklists refresh token) */
export async function logoutUser(): Promise<void> {
  const refresh = localStorage.getItem("refresh");

  await fetch(`${API_URL}/auth/logout/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
    body: JSON.stringify({ refresh }),
  });

  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("pursuit_session");
}



/** Django target: GET /api/auth/me/ */
export async function getCurrentUser():      
      Promise<User | null> {
          const token = localStorage.getItem("access");
          if (!token) return null;
          const res = await fetch(`${API_URL}/auth/me/`, {
              method:"GET",
              headers: {
                Authorization: `Bearer ${token}`,
  },
  
  });
  if (!res.ok) return null;
  const data = await res.json();

  return  data;

}

/** Django target: PATCH /api/profile/ */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, "fullName" | "email">>
): Promise<User> {
  await wait();
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found.");
  users[idx] = { ...users[idx], ...updates };
  writeUsers(users);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _unusedPassword, ...safeUser } = users[idx];
  localStorage.setItem("pursuit_session", JSON.stringify(safeUser));
  return safeUser;
}

/** Django target: POST /api/auth/change-password/ */
export async function changePassword(input:{
    currentPassword:string;
    newPassword:string;
    confirmNewPassword:string;
}):Promise<void>{

    const token = localStorage.getItem("access");

    const res = await fetch(`${API_URL}/auth/change-password/`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${token}`,
        },
        body:JSON.stringify({
            current_pass:input.currentPassword,
            new_pass:input.newPassword,
            re_enter_pass:input.confirmNewPassword,
        }),
    });

    if(!res.ok){
        const error=await res.json();
        throw new Error(error.detail || "Password change failed");
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
