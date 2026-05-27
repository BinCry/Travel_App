import {
  tripPlanRequestSchema,
  tripPlanResponseSchema,
  type TripPlanResponse,
} from "@travel-app/shared/contracts/ai";
import { generateTripPlanContent } from "../integrations/gemini.js";

export const aiService = {
  async planTrip(body: unknown): Promise<TripPlanResponse> {
    const data = tripPlanRequestSchema.parse(body);
    const where = data.location?.trim() || "khu vực của bạn";
    const generated = await generateTripPlanContent(
      [
        "Bạn là trợ lý lên kế hoạch du lịch cho ứng dụng di động.",
        "Hãy trả về JSON thuần với đúng các khóa: location, suggestions, note.",
        "Toàn bộ nội dung phải viết bằng tiếng Việt có dấu, ngắn gọn, rõ ràng và tự nhiên.",
        "suggestions phải là mảng gồm đúng 3 mục hành trình ngắn gọn.",
        "Mỗi mục trong suggestions phải có đủ title, description, duration.",
        "Nội dung phải bám sát nhu cầu người dùng và địa điểm được cung cấp.",
        `Yêu cầu của người dùng: ${data.query}`,
        `Địa điểm: ${where}`,
      ].join("\n")
    );

    return tripPlanResponseSchema.parse({
      query: data.query,
      location: generated.location?.trim() || where,
      suggestions: generated.suggestions.slice(0, 3),
      note:
        generated.note?.trim() ||
        (data.location
          ? "Gợi ý được tạo bởi Gemini."
          : "Gợi ý được tạo bởi Gemini dựa trên sở thích du lịch của bạn."),
    });
  },
};
