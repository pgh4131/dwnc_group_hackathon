import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateMissionFromPost(postDescription) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
당신은 동아리 마케팅 미션을 추천해주는 AI 조수입니다.
다음은 기업이 올린 마케팅 공고 내용입니다. 이 내용을 바탕으로 동아리 학생들에게 전달할 '미션'을 하나 추천해주세요.
반드시 아래의 JSON 형식으로만 응답해야 합니다. 다른 말은 절대 추가하지 마세요.

공고 내용:
"""
${postDescription}
"""

응답 형식 (JSON):
{
  "title": "미션 제목 (간단하고 명확하게)",
  "description": "미션 상세 내용 (학생들이 구체적으로 무엇을 해야 하는지)",
  "deadline": "2026-12-31 (마감일 예시, 공고 내용에 기간이 있다면 참고하여 YYYY-MM-DD 형식으로, 없으면 현재 기준 한달 뒤)",
  "delayBuffer": "3일 (지연 허용 기간 등)",
  "targetMetric": "100 (목표 수치가 명확하다면 숫자만, 없다면 빈 문자열)"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // JSON 파싱을 위해 텍스트에서 ```json ... ``` 같은 포맷팅이 있다면 제거
    const cleanedText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI 생성 중 오류:", error);
    throw new Error("AI 미션 추천에 실패했습니다.");
  }
}
