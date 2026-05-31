-- =============================================================================
-- SEED ONLY: requires tables already applied (prisma db push or schema SQL).
--
-- bcryptjs cost 10, password: travel1234
--
-- Deletes existing sample rows keyed by IDs below, then re-inserts minimal
-- data matching the Expo home tabs: ATTRACTIONS, DINING, FESTIVALS.
-- =============================================================================

DELETE FROM "ReviewImage" WHERE "id" LIKE 'fe_rimg_%';
DELETE FROM "ReviewLike" WHERE "reviewId" = 'fe_review_gion_first';
DELETE FROM "Review" WHERE "id" = 'fe_review_gion_first';
DELETE FROM "Favorite" WHERE "placeId" IN ('fe_place_gion_001', 'fe_place_dining_happy', 'fe_place_festival_lane');
DELETE FROM "Place" WHERE "id" IN ('fe_place_gion_001', 'fe_place_dining_happy', 'fe_place_festival_lane');
DELETE FROM "User" WHERE "email" = 'linh.nguyen@example.com';

INSERT INTO "User" ("email", "passwordHash", "fullName", "username", "location", "avatarUrl") VALUES (
  'linh.nguyen@example.com',
  '$2b$10$yds8y/KZXIjaYlVId6ARQe.gOBZgIkn5wW9gzDE6RVItbizcZN/Ni',
  'Linh Nguyễn',
  'linh_di_choi',
  'Việt Nam',
  'https://th.bing.com/th/id/OIP.iY6OLSZImubhw9Yiwg6OuAHaHa?w=186&h=186&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
);

INSERT INTO "Place"
  ("id", "name", "region", "category", "coverImageUrl", "featureLabel", "averageRating", "ratingCount", "about", "priceLevel")
VALUES
(
  'fe_place_gion_001',
  'Gion District',
  'Kyoto, Japan',
  'ATTRACTIONS'::"PlaceCategory",
  'https://i.pinimg.com/1200x/28/31/da/2831da0f8a4b18fde25867ef90e66207.jpg',
  'Yên tĩnh lúc này',
  4.9,
  1,
  'Phố cổ phù hợp để đi bộ, chụp ảnh và cảm nhận nhịp sống truyền thống của Kyoto.',
  65.3
),
(
  'fe_place_dining_happy',
  'Tsukiji Corner',
  'Tokyo, Japan',
  'DINING'::"PlaceCategory",
  'https://i.pinimg.com/1200x/f1/9c/a0/f19ca09250c88864491e7cacecd1eb40.jpg',
  'Đang mở cửa',
  0,
  0,
  'Quán ăn nhỏ phục vụ set hải sản và bữa tối cho nhóm 2-4 người.',
  40
),
(
  'fe_place_festival_lane',
  'Tokyo Lantern Walk',
  'Tokyo, Japan',
  'FESTIVALS'::"PlaceCategory",
  'https://i.pinimg.com/1200x/f1/9c/a0/f19ca09250c88864491e7cacecd1eb40.jpg',
  'Cuối tuần này',
  0,
  0,
  'Lễ hội đèn lồng buổi tối với đồ ăn đường phố và các gian hàng nghệ thuật.',
  35
);

INSERT INTO "Review" ("id", "placeId", "userId", "rating", "content")
SELECT
  'fe_review_gion_first',
  'fe_place_gion_001',
  u.id,
  5,
  'Đi bộ qua Gion lúc chạng vạng rất cuốn hút. Đèn lồng bắt đầu sáng lên và không khí cực kỳ dễ chịu.'
FROM "User" u WHERE u."email" = 'linh.nguyen@example.com';

INSERT INTO "ReviewImage" ("id", "reviewId", "url") VALUES
('fe_rimg_a', 'fe_review_gion_first', 'https://i.pinimg.com/736x/72/41/dd/7241ddb23e868c19ec43a701104132f6.jpg'),
('fe_rimg_b', 'fe_review_gion_first', 'https://i.pinimg.com/736x/97/24/45/97244547fc44fbc06968e4c72d2efdfc.jpg');

SELECT setval(pg_get_serial_sequence('"User"', 'id'), (SELECT COALESCE(MAX("id"), 1) FROM "User"));
SELECT setval(pg_get_serial_sequence('"ReviewLike"', 'id'), (SELECT COALESCE(MAX("id"), 1) FROM "ReviewLike"));
