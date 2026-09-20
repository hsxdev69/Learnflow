import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSessionToken } from "@/lib/auth";
import {
  HACKATHON_TRACKS,
  evaluateTrackReadiness,
} from "@/lib/hackathonData";

// GET: Returns all tracks and summary of available readiness assessments
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;
    const sessionUser = token ? parseSessionToken(token) : null;

    // Return tracks without the full question answers to prevent client leakage before quiz
    const publicTracks = HACKATHON_TRACKS.map((track) => ({
      id: track.id,
      title: track.title,
      subtitle: track.subtitle,
      tag: track.tag,
      badgeColor: track.badgeColor,
      gradient: track.gradient,
      iconName: track.iconName,
      estimatedMinutes: track.estimatedMinutes,
      description: track.description,
      recommendedCourseId: track.recommendedCourseId,
      recommendedCourseName: track.recommendedCourseName,
      typicalProblemStatements: track.typicalProblemStatements,
      fastTrackRoadmap: track.fastTrackRoadmap,
      skillRequirements: track.skillRequirements,
      questionCount: track.questions.length,
    }));

    return NextResponse.json({
      tracks: publicTracks,
      user: sessionUser ? { id: sessionUser.id, name: sessionUser.name } : null,
    });
  } catch (error: any) {
    console.error("Hackathon readiness GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve hackathon readiness data" },
      { status: 500 }
    );
  }
}

// POST: Submit answers and evaluate readiness
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;
    const sessionUser = token ? parseSessionToken(token) : null;

    const body = await request.json();
    const { trackId, answers } = body;

    if (!trackId || !answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "trackId and answers map are required" },
        { status: 400 }
      );
    }

    const track = HACKATHON_TRACKS.find((t) => t.id === trackId);
    if (!track) {
      return NextResponse.json(
        { error: `Track '${trackId}' not found` },
        { status: 404 }
      );
    }

    // Run evaluation engine
    const evaluation = evaluateTrackReadiness(track, answers);

    // If user is logged in, optionally persist progress or log attempt
    if (sessionUser?.id) {
      try {
        // Find or create a matching assessment in Prisma to log the score if desired
        const assessmentTitle = `Hackathon Readiness: ${track.title}`;
        let assessment = await prisma.assessment.findFirst({
          where: { title: assessmentTitle },
        });

        if (!assessment) {
          assessment = await prisma.assessment.create({
            data: {
              title: assessmentTitle,
              description: `Readiness evaluation for ${track.title} track.`,
              estimatedMinutes: track.estimatedMinutes,
            },
          });
        }

        await prisma.assessmentAttempt.create({
          data: {
            userId: sessionUser.id,
            assessmentId: assessment.id,
            score: evaluation.correctCount,
            maxScore: evaluation.totalQuestions,
            percentage: evaluation.scorePercentage,
          },
        });
      } catch (dbErr) {
        console.warn("Notice: could not record db assessmentAttempt (non-fatal):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    console.error("Hackathon readiness POST evaluation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to evaluate readiness" },
      { status: 500 }
    );
  }
}
