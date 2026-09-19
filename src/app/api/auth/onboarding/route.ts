import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { initializeStudentRoadmap } from "@/lib/roadmap";
import { goalNameToCourseSlug } from "@/lib/courses";
import { SessionUser } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
    }

    const body = await req.json();
    const {
      step,
      name,
      dob,
      mobile,
      gender,
      branch,
      year,
      semester,
      college,
      graduationYear,
      skills,
      learningGoals,
      primaryLearningGoal,
      referralSource,
      finishSetup,
    } = body;

    const updateData: any = {};

    if (name) updateData.name = name.trim();
    if (dob) updateData.dob = dob;
    if (mobile) updateData.mobile = mobile;
    if (gender) updateData.gender = gender;
    if (branch) {
      updateData.branch = branch;
      updateData.department = branch;
    }
    if (year) updateData.year = year;
    if (semester) updateData.semester = semester;
    if (college) updateData.college = college;
    if (graduationYear) updateData.graduationYear = graduationYear;
    if (skills) {
      updateData.skills = typeof skills === "string" ? skills : JSON.stringify(skills);
    }
    if (learningGoals) {
      updateData.learningGoals =
        typeof learningGoals === "string" ? learningGoals : JSON.stringify(learningGoals);
    }
    if (primaryLearningGoal) {
      updateData.primaryLearningGoal = primaryLearningGoal;
      updateData.targetSkill = primaryLearningGoal;
      const slug = goalNameToCourseSlug(primaryLearningGoal);
      updateData.currentCourseId = slug;
    }
    if (referralSource) updateData.referralSource = referralSource;

    if (finishSetup) {
      updateData.onboardingCompleted = true;
    }

    const updatedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: updateData,
      create: {
        id: user.id,
        email: user.email,
        name: updateData.name || user.name || "Student",
        employeeId: user.employeeId || `STU-${Date.now().toString().slice(-6)}`,
        passwordHash: "session_authenticated",
        role: user.role || "LEARNER",
        department: updateData.branch || user.department || "Computer Engineering",
        designation: user.designation || "Engineering Student",
        experienceLevel: user.experienceLevel || "Beginner",
        ...updateData,
      },
    });

    // Initialize roadmap for active learning path & all chosen goals
    if (finishSetup || skills || learningGoals || primaryLearningGoal) {
      try {
        let parsedSkills: any[] = [];
        if (skills) {
          parsedSkills = Array.isArray(skills) ? skills : typeof skills === "string" ? JSON.parse(skills) : [];
        } else if (updatedUser.skills) {
          try {
            parsedSkills = JSON.parse(updatedUser.skills);
          } catch {}
        }

        const activeSlug =
          updatedUser.currentCourseId ||
          goalNameToCourseSlug(updatedUser.primaryLearningGoal || "dsa");

        await initializeStudentRoadmap(user.id, parsedSkills, activeSlug);

        // Initialize any other selected learning goals so their roadmaps and progress exist
        if (updatedUser.learningGoals) {
          try {
            const goals: string[] = JSON.parse(updatedUser.learningGoals);
            for (const g of goals) {
              const s = goalNameToCourseSlug(g);
              if (s !== activeSlug) {
                await initializeStudentRoadmap(user.id, parsedSkills, s);
              }
            }
          } catch {}
        }
      } catch (roadmapErr) {
        console.warn("[Onboarding] Non-critical roadmap initialization warning:", roadmapErr);
      }
    }

    const sessionPayload: SessionUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      employeeId: updatedUser.employeeId,
      department: updatedUser.department,
      designation: updatedUser.designation,
      experienceLevel: updatedUser.experienceLevel,
      role: updatedUser.role as "LEARNER" | "ADMIN",
      onboardingCompleted: updatedUser.onboardingCompleted,
      primaryLearningGoal: updatedUser.primaryLearningGoal || undefined,
      targetSkill: updatedUser.targetSkill || undefined,
      currentCourseId: updatedUser.currentCourseId || undefined,
      skills: updatedUser.skills || undefined,
      learningGoals: updatedUser.learningGoals || undefined,
      branch: updatedUser.branch || undefined,
    };

    const token = createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      stepCompleted: step,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Onboarding update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save profile information." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
