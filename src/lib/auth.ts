import { cookies } from "next/headers";
import prisma from "./db";
import bcrypt from "bcryptjs";
import { SessionUser } from "@/types";

const SESSION_COOKIE_NAME = "mospi_session_token";

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function createSessionToken(user: SessionUser): string {
  const payload = {
    ...user,
    timestamp: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function parseSessionToken(token: string): SessionUser | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.id || !parsed.email) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      employeeId: parsed.employeeId,
      department: parsed.department,
      designation: parsed.designation,
      experienceLevel: parsed.experienceLevel,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const parsed = parseSessionToken(token);
  if (!parsed) return null;

  // Verify against real database
  const user = await prisma.user.findUnique({
    where: { id: parsed.id },
    select: {
      id: true,
      email: true,
      name: true,
      employeeId: true,
      department: true,
      designation: true,
      experienceLevel: true,
      role: true,
      dob: true,
      mobile: true,
      gender: true,
      branch: true,
      year: true,
      semester: true,
      college: true,
      graduationYear: true,
      skills: true,
      referralSource: true,
      onboardingCompleted: true,
      currentCourseId: true,
      targetSkill: true,
      learningGoals: true,
      primaryLearningGoal: true,
    },
  });

  if (!user) return null;
  return user as SessionUser;
}

export async function requireLearner(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden: Administrator access required");
  }
  return user;
}

export { SESSION_COOKIE_NAME };
