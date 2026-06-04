import { timingSafeEqual } from "crypto";
import { getSuperAdminEnv } from "@/lib/env";

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function validateSuperAdminCredentials(
  email: string,
  password: string,
): boolean {
  const { email: adminEmail, password: adminPassword } = getSuperAdminEnv();
  const normalizedEmail = email.trim().toLowerCase();

  return (
    secureCompare(normalizedEmail, adminEmail.toLowerCase()) &&
    secureCompare(password, adminPassword)
  );
}
