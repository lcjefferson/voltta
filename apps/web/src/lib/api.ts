const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";

function readToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("voltta_access_token");
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("voltta_access_token");
  localStorage.removeItem("voltta_refresh_token");
  localStorage.removeItem("voltta_user");
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("voltta_refresh_token");
  if (!refreshToken) return null;
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    clearSession();
    return null;
  }
  const data = await response.json();
  localStorage.setItem("voltta_access_token", data.accessToken);
  if (data.refreshToken) {
    localStorage.setItem("voltta_refresh_token", data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem("voltta_user", JSON.stringify(data.user));
  }
  return data.accessToken as string;
}

function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as { message?: string | string[] }).message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  return fallback;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const request = async (token?: string | null) => {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_URL}${path}`, { ...options, headers });
  };

  let response = await request(readToken());

  if (response.status === 401 && typeof window !== "undefined") {
    const token = await refreshAccessToken();
    if (token) {
      response = await request(token);
    } else if (!path.startsWith("/auth/")) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?next=${next}`;
      throw new Error("Sessão expirada. Faça login novamente.");
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = errorMessage(
      payload,
      "Não foi possível concluir a solicitação.",
    );
    if (
      typeof window !== "undefined" &&
      response.status === 403 &&
      message.includes("Trial encerrado") &&
      !window.location.pathname.startsWith("/assinatura")
    ) {
      window.location.replace("/assinatura");
    }
    throw new Error(message);
  }

  return response.status === 204 ? (undefined as T) : response.json();
}
