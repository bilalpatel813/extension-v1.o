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
    body: JSON.stringify({
     full_name: input.fullName,
     email: input.email,
     password: input.password,
    })
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
export async function logoutUser():
      const refresh = localStorage.getItem("refresh");
      Promise<void> {
          await fetch(`${API_URL}/auth/logout/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
    body: JSON.stringify({
      refresh,
    }),
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
              method:GET,
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
export async function changePassword(
  userId: string,
  input: { currentPassword: string; newPassword: string }
): Promise<void> {
  await wait();
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found.");
  if (users[idx].password !== input.currentPassword) {
    throw new Error("Current password is incorrect.");
  }
  users[idx].password = input.newPassword;
  writeUsers(users);
}

/* ------------------------------------------------------------------
 * APPLICATIONS
 * Django target: GET /api/applications/
 * ------------------------------------------------------------------ */
export async function getApplications(userId: string): Promise<JobApplication[]> {
  await wait();
  const existing = readApplications(userId);
  if (existing.length) return existing;
  // seed with demo data on first visit so the dashboard isn't empty
  const { demoApplications } = await import("./mock-data");
  writeApplications(userId, demoApplications);
  return demoApplications;
}

/** Django target: PATCH /api/applications/:id/ */
export async function updateApplicationStatus(
  userId: string,
  id: string,
  status: JobStatus
): Promise<void> {
  await wait(150);
  const apps = readApplications(userId);
  const idx = apps.findIndex((a) => a.id === id);
  if (idx !== -1) {
    apps[idx].status = status;
    writeApplications(userId, apps);
  }
}

/** Django target: DELETE /api/applications/:id/ */
export async function deleteApplication(userId: string, id: string): Promise<void> {
  await wait(150);
  const apps = readApplications(userId).filter((a) => a.id !== id);
  writeApplications(userId, apps);
}
