import type { PlaceCategory } from "../../../lib/api/types";

export const placeCategories: { value: PlaceCategory; label: string }[] = [
  { value: "attractions", label: "Điểm đến" },
  { value: "dining", label: "Ẩm thực" },
  { value: "festivals", label: "Lễ hội" },
];

export function getPlaceCategoryLabel(category: PlaceCategory) {
  return placeCategories.find((item) => item.value === category)?.label ?? category;
}
