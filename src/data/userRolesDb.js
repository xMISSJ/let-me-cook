import { getSupabaseClient } from "./supabaseClient";

function normalizeEmail(email) {
  return String(email ?? "")
    .trim()
    .toLowerCase();
}

function toReadableError(error) {
  if (!error) return new Error("Unknown Supabase error");
  if (error instanceof Error) return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    const status = "status" in error ? ` (status ${String(error.status)})` : "";
    return new Error(`${error.message}${status}`);
  }
  return new Error(String(error));
}

export async function listAdminEmails() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("email, role")
    .eq("role", "admin")
    .order("email", { ascending: true });

  if (error) throw toReadableError(error);

  return (data ?? []).map((row) => normalizeEmail(row.email)).filter(Boolean);
}

export async function setUserRole({ email, role, assignedBy }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) throw new Error("Please enter an email.");
  const normalizedRole = role === "admin" ? "admin" : "member";

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("user_roles").upsert(
    {
      email: normalizedEmail,
      role: normalizedRole,
      assigned_by: normalizeEmail(assignedBy) || null,
    },
    { onConflict: "email" },
  );

  if (error) throw toReadableError(error);
}

