import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  getGeminiKeyForGrade,
  parseGrade,
  checkHigherClassTopic,
  GRADE_CURRICULUM,
} from "@/lib/aiConfig";

const systemPrompt = `You are "Ed", a fun and friendly AI learning buddy for the Tuitioned platform, designed to talk to children and their parents.

Your personality is:
- Super cheerful, encouraging, and a little bit silly.
- You love using emojis like ✨, 🚀, and 🧠!
- You talk like a friendly cartoon character.
- You call the user "friend" or "smarty-pants".

Your Goals:
- Be the "Tuitioned Buddy".
- Answer questions about our platform, how to use the website, our courses, and tutors.
- Keep your answers short, fun, and always about Tuitioned.
- IMPORTANT: Under no circumstances should you entertain higher class or college-level academic questions for young students. Encourage them to stick to their current grade learning.`;

let lastWorkingModel = "gemini-1.5-flash";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, grade, isCurriculum, topic, numQuestions = 5 } = body;

    if (!message && !topic && !isCurriculum) {
      return NextResponse.json(
        { error: "Please provide a topic or select curriculum mode." },
        { status: 400 }
      );
    }

    // Determine target grade (1 to 12)
    const targetGrade = parseGrade(grade || message);

    // Guardrail: Restrict asking or generating higher class questions in lower grades
    const topicToCheck = topic || message || "";
    const guardrailCheck = checkHigherClassTopic(targetGrade, topicToCheck);
    if (!guardrailCheck.allowed) {
      return NextResponse.json(
        {
          error:
            guardrailCheck.reason ||
            `Higher class questions and topics are not permitted for Grade ${targetGrade} students. Please select a grade-appropriate topic.`,
        },
        { status: 400 }
      );
    }

    // Select the exact API key corresponding to the grade
    // Key 1 -> Grade 1, 2, 3
    // Key 2 -> Grade 4, 5
    // Key 3 -> Grade 6
    // Key 4 -> Grade 7
    // Key 5 -> Grade 8
    // Key 6 -> Grade 9
    // Key 7 -> Grade 10
    // Key 8 -> Grade 11
    // Key 9 -> Grade 12
    const apiKey = getGeminiKeyForGrade(targetGrade);

    if (!apiKey) {
      console.error(`>>> AI Test API Error: No API key resolved for Grade ${targetGrade}`);
      return NextResponse.json(
        { error: "AI configuration error: API key for this grade is missing." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const isJsonMode =
      Boolean(isCurriculum) ||
      (typeof message === "string" && message.includes("Return the response as a valid JSON array"));

    // Prepare prompt
    let finalPrompt = message;

    if (isCurriculum) {
      const curriculum = GRADE_CURRICULUM[targetGrade] || GRADE_CURRICULUM[10];
      const curriculumTopicsList = curriculum.topics.map((t) => `• ${t.title} (${t.subject}): ${t.description}`).join("\n");

      finalPrompt = `You are a certified school educator and curriculum assessment developer for Grade ${targetGrade}.
Create an official curriculum-aligned multiple choice test containing ${numQuestions} questions for a Grade ${targetGrade} student.

OFFICIAL GRADE ${targetGrade} CURRICULUM SYLLABUS:
${curriculumTopicsList}

TARGET FOCUS: ${topic && topic.trim() ? topic : `Comprehensive Grade ${targetGrade} Curriculum Assessment covering key subjects (${curriculum.coreSubjects.join(", ")})`}

STRICT CURRICULUM RULES:
1. Every question MUST strictly belong to the official Grade ${targetGrade} syllabus.
2. DO NOT include advanced questions, formulas, or terminology from higher grades.
3. Each question must have exactly 4 choices (options).
4. Provide the 0-based index of the correct answer in "correctAnswer" (0, 1, 2, or 3).
5. Ensure the difficulty is perfectly balanced and pedagogical for a Grade ${targetGrade} child/student.

Return the response as a valid JSON array of objects with the exact schema:
[
  {
    "question": "Clear, age-appropriate question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

Do not include markdown fences, thoughts, or any extra text. Return ONLY the JSON array.`;
    } else if (isJsonMode && !finalPrompt) {
      finalPrompt = `Generate ${numQuestions} multiple choice questions for a Grade ${targetGrade} student on the topic: ${topic}.
STRICT REQUIREMENT: Questions MUST strictly be age-appropriate for Grade ${targetGrade}. Do NOT include higher-grade concepts.
Each question must have 4 options and a "correctAnswer" (0-3 index).
Return ONLY a valid JSON array of objects with fields "question", "options" (array of 4 strings), and "correctAnswer" (number).`;
    }

    // Try fallback models if one fails or experiences high demand
    const modelNames = Array.from(
      new Set([
        lastWorkingModel,
        "gemini-1.5-flash",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-2.5-flash",
        "gemini-3.8-flash",
      ])
    );
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`>>> Attempting AI Test with Grade ${targetGrade} on model: ${modelName}`);

        const modelConfig: any = { model: modelName };
        if (isJsonMode) {
          modelConfig.systemInstruction = `You are an educational assessment expert specialized in school curriculum standards for Grade ${targetGrade}.
You must strictly enforce age and grade appropriateness. Under NO circumstances should questions contain concepts, equations, or vocabulary from higher grades.
Always respond with valid JSON only, no markdown wrapping, no personality text, and no preamble.`;
          modelConfig.generationConfig = {
            responseMimeType: "application/json",
          };
        }

        const model = genAI.getGenerativeModel(modelConfig);

        let result;
        if (isJsonMode) {
          result = await model.generateContent(finalPrompt);
        } else {
          const chat = model.startChat({
            history: [
              {
                role: "user",
                parts: [{ text: systemPrompt }],
              },
              {
                role: "model",
                parts: [
                  {
                    text: "Got it! I'm Ed, your super fun learning buddy! What adventure shall we go on today? ✨",
                  },
                ],
              },
              ...(history || []).slice(-10).map((msg: any) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content || "" }],
              })).filter((msg: any) => msg.parts[0].text !== ""),
            ],
          });
          result = await chat.sendMessage(finalPrompt);
        }

        const response = await result.response;

        if (!response.candidates || response.candidates.length === 0) {
          throw new Error("No response candidates returned from AI.");
        }

        const candidate = response.candidates[0];
        if (candidate.finishReason === "SAFETY" || candidate.finishReason === "OTHER") {
          throw new Error(`AI response blocked: ${candidate.finishReason}`);
        }

        const text = response.text();

        if (text) {
          console.log(`>>> Success with model ${modelName} for Grade ${targetGrade}`);
          lastWorkingModel = modelName;
          return NextResponse.json({
            text,
            grade: targetGrade,
            isCurriculum: Boolean(isCurriculum),
          });
        }
      } catch (err: any) {
        console.warn(`>>> Model ${modelName} failed for Grade ${targetGrade}:`, err.message);
        lastError = err;
        continue;
      }
    }

    throw lastError || new Error("All AI models failed to respond. Please check your API key.");
  } catch (error: any) {
    console.error("AI API Final Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response from AI." },
      { status: 500 }
    );
  }
}
