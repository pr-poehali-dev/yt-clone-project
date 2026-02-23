const URLS = {
  auth: "https://functions.poehali.dev/275bbc42-c195-47f2-bd7d-b025a1146d01",
  dashboard: "https://functions.poehali.dev/e6263e39-d9eb-42b0-9a94-50431a60dafc",
  generateThumbnail: "https://functions.poehali.dev/a4900b83-22d1-4b6e-a752-16fb2fc84c46",
};

function getToken(): string | null {
  return localStorage.getItem("vw_token");
}

function setToken(t: string) {
  localStorage.setItem("vw_token", t);
}

function clearToken() {
  localStorage.removeItem("vw_token");
}

async function req(url: string, method: string, body?: object, useToken = false) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (useToken) {
    const t = getToken();
    if (t) headers["X-Auth-Token"] = t;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка запроса");
  return data;
}

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  is_author: boolean;
}

export interface AuthResult {
  token: string;
  user: User;
}

export const api = {
  getToken,
  setToken,
  clearToken,

  async register(email: string, password: string, username: string, display_name: string): Promise<AuthResult> {
    const data = await req(`${URLS.auth}/register`, "POST", { email, password, username, display_name });
    setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const data = await req(`${URLS.auth}/login`, "POST", { email, password });
    setToken(data.token);
    return data;
  },

  async logout() {
    await req(`${URLS.auth}/logout`, "POST", {}, true);
    clearToken();
  },

  async getMe(): Promise<User | null> {
    const t = getToken();
    if (!t) return null;
    try {
      const data = await req(`${URLS.auth}/me`, "GET", undefined, true);
      return data.user;
    } catch {
      clearToken();
      return null;
    }
  },

  async becomeAuthor(channel_name: string, description: string) {
    return req(`${URLS.auth}/become-author`, "POST", { channel_name, description }, true);
  },

  async getDashboardStats() {
    return req(`${URLS.dashboard}/stats`, "GET", undefined, true);
  },

  async uploadVideo(title: string, description: string, thumbnail_url: string, category: string) {
    return req(`${URLS.dashboard}/upload-video`, "POST", { title, description, thumbnail_url, category }, true);
  },

  async generateThumbnail(prompt: string): Promise<{ url: string }> {
    return req(URLS.generateThumbnail, "POST", { prompt });
  },
};
