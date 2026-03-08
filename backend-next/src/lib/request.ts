import { getToken } from "./clientAuth";

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(input, { ...init, headers });
  if (!res.ok) {
    let msg = "请求失败";
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

