export async function loginApi(payload) {
  return {
    user: { id: "u1", name: "Demo User", email: payload.email, role: "USER" },
    accessToken: "demo-token",
  };
}

export async function meApi() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  return { id: "u1", name: "Demo User", email: "demo@x.com", role: "USER" };
}

export async function logoutApi() {
  return true;
}
