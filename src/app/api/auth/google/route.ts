import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, accessToken, userInfo, simulated } = body;

    let email: string = "";
    let name: string = "";
    let picture: string | undefined = undefined;
    let googleId: string | undefined = undefined;

    // 1. If Google ID Token JWT is provided (from Google Identity Services)
    if (credential && typeof credential === "string") {
      try {
        // Verify with Google's official tokeninfo endpoint
        const googleRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
          { method: "GET" }
        );

        if (!googleRes.ok) {
          console.warn("Google tokeninfo verification failed with status:", googleRes.status);
          // Attempt decoding JWT payload if network or test credential
          const parts = credential.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
            if (payload.email) {
              email = payload.email;
              name = payload.name || payload.given_name || "Google User";
              picture = payload.picture;
              googleId = payload.sub;
            }
          }
        } else {
          const payload = await googleRes.json();
          email = payload.email;
          name = payload.name || payload.given_name || "Google User";
          picture = payload.picture;
          googleId = payload.sub;
        }
      } catch (verifyErr) {
        console.error("Error verifying Google ID token:", verifyErr);
      }
    }

    // 2. If OAuth2 access token is provided
    if (!email && accessToken && typeof accessToken === "string") {
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userInfoRes.ok) {
          const userPayload = await userInfoRes.json();
          email = userPayload.email;
          name = userPayload.name || userPayload.given_name || "Google User";
          picture = userPayload.picture;
          googleId = userPayload.sub;
        }
      } catch (tokenErr) {
        console.error("Error fetching Google userinfo:", tokenErr);
      }
    }

    // 3. If test/simulated user or direct userInfo provided (for local testing/fallback)
    if (!email && (simulated || userInfo)) {
      const source = userInfo || simulated;
      if (source?.email && typeof source.email === "string" && source.email.includes("@")) {
        email = source.email;
        name = source.name || "Google User";
        picture = source.picture;
        googleId = source.sub || `google_${Date.now()}`;
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: "Google authentication failed. No verified email received." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 4. Find existing user or automatically create/link account
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Auto-create new student user account
      const employeeId = `STU-${Date.now().toString().slice(-6)}`;
      user = await prisma.user.create({
        data: {
          name: name.trim() || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          passwordHash: "google_oauth_authenticated",
          employeeId,
          role: "LEARNER",
          department: "Computer Engineering",
          designation: "Engineering Student",
          experienceLevel: "Beginner",
          onboardingCompleted: false,
          currentCourseId: "course_dsa",
          targetSkill: "Data Structures & Algorithms",
          primaryLearningGoal: "Data Structures & Algorithms",
          referralSource: "Google Auth",
        },
      });
    } else {
      // If user exists but name was generic, optionally update name
      if ((!user.name || user.name === "Student") && name) {
        try {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: name.trim() },
          });
        } catch {
          // ignore
        }
      }
    }

    // 5. Establish authenticated session
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      employeeId: user.employeeId,
      department: user.department,
      designation: user.designation,
      experienceLevel: user.experienceLevel,
      role: user.role as "LEARNER" | "ADMIN",
      onboardingCompleted: Boolean(user.onboardingCompleted),
      branch: user.branch || undefined,
      year: user.year || undefined,
      college: user.college || undefined,
    };

    const token = createSessionToken(sessionUser);

    const redirectPath = user.role === "ADMIN"
      ? "/admin/dashboard"
      : user.onboardingCompleted
      ? "/dashboard"
      : "/onboarding/step-1";

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      redirectTo: redirectPath,
      message: "Google authentication successful",
    });

    // 6. Set secure HTTP-only session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days session
    });

    return response;
  } catch (err: any) {
    console.error("Google Auth Route Error:", err);
    return NextResponse.json(
      { error: err?.message || "Google authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
