import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { aiService } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Retrieve engineering topics and notes for RAG
    const topics = await prisma.topic.findMany({
      select: {
        title: true,
        description: true,
        notesContent: true,
      },
      take: 6,
    });

    const materials = await prisma.learningMaterial.findMany({
      select: {
        title: true,
        contentSnippet: true,
        summary: true,
      },
      take: 3,
    });

    const contexts = [
      ...topics.map((t) => ({
        title: t.title,
        text: `${t.description}\n\n${t.notesContent || ""}`,
      })),
      ...materials.map((m) => ({
        title: m.title,
        text: m.contentSnippet || m.summary || "",
      })),
    ];

    const result = await aiService.answerLearningQuestion(query, contexts);

    return NextResponse.json({
      answer: result.answer,
      source: result.source,
    });
  } catch (error: any) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to answer learning question" },
      { status: 500 }
    );
  }
}
