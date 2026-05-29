import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  const verifiedAt = new Date();

  await prisma.promotion.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.bookingOption.deleteMany();
  await prisma.tripStop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.collectionPlace.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.placeUpdate.deleteMany();
  await prisma.reviewReply.deleteMany();
  await prisma.reviewLike.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();

  const demoHash = await bcrypt.hash("demo1234", 10);

  const traveler = await prisma.user.create({
    data: {
      email: "demo@example.com",
      passwordHash: demoHash,
      role: "TRAVELER",
      emailVerifiedAt: verifiedAt,
      fullName: "Alex Johnson",
      username: "Alex_love_travel",
      location: "Việt Nam",
      avatarUrl:
        "https://th.bing.com/th/id/OIP.iY6OLSZImubhw9Yiwg6OuAHaHa?w=186&h=186&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@example.com",
      passwordHash: demoHash,
      role: "OWNER",
      emailVerifiedAt: verifiedAt,
      fullName: "Owner Demo",
      username: "owner_demo",
      location: "Việt Nam",
    },
  });

  const firstPlace = await prisma.place.create({
    data: {
      ownerId: owner.id,
      name: "Gion District",
      region: "Kyoto, Nhật Bản",
      category: "ATTRACTIONS",
      coverImageUrl:
        "https://i.pinimg.com/1200x/28/31/da/2831da0f8a4b18fde25867ef90e66207.jpg",
      featureLabel: "Yên tĩnh lúc này",
      averageRating: 4.9,
      ratingCount: 850,
      priceLevel: 65.3,
      about:
        "Không gian cổ kính, nhẹ nhàng và rất phù hợp cho hành trình dạo bộ, chụp ảnh và cảm nhận nhịp sống truyền thống.",
    },
  });

  const review = await prisma.review.create({
    data: {
      placeId: firstPlace.id,
      userId: traveler.id,
      rating: 4,
      content:
        "Đi bộ qua Gion lúc chạng vạng thật sự rất cuốn hút. Đèn lồng bắt đầu sáng lên và không khí cực kỳ dễ chịu.",
    },
  });

  await prisma.reviewReply.create({
    data: {
      reviewId: review.id,
      ownerId: owner.id,
      content:
        "Cảm ơn bạn đã ghé thăm. Bên mình rất vui khi Gion đem lại trải nghiệm nhẹ nhàng cho chuyến đi của bạn.",
    },
  });

  await prisma.reviewImage.createMany({
    data: [
      {
        reviewId: review.id,
        url: "https://i.pinimg.com/736x/72/41/dd/7241ddb23e868c19ec43a701104132f6.jpg",
      },
      {
        reviewId: review.id,
        url: "https://i.pinimg.com/736x/97/24/45/97244547fc44fbc06968e4c72d2efdfc.jpg",
      },
    ],
  });

  const secondPlace = await prisma.place.create({
    data: {
      ownerId: owner.id,
      name: "Happy Restaurant",
      region: "Tokyo, Nhật Bản",
      category: "DINING",
      coverImageUrl:
        "https://i.pinimg.com/1200x/f1/9c/a0/f19ca09250c88864491e7cacecd1eb40.jpg",
      featureLabel: "Đang mở cửa",
      averageRating: 4.7,
      ratingCount: 120,
      priceLevel: 40,
      about: "Trải nghiệm ẩm thực địa phương với không gian ấm cúng, phù hợp cho nhóm bạn và gia đình.",
    },
  });

  await prisma.promotion.createMany({
    data: [
      {
        placeId: firstPlace.id,
        title: "Giảm 20% thực đơn buổi trưa",
        isActive: true,
        startDate: "Oct 10, 2024",
        endDate: "Oct 30, 2024",
        days: ["M", "T", "W", "T", "F"],
        startTime: "11:00 AM",
        endTime: "01:00 PM",
        specificTime: true,
      },
      {
        placeId: secondPlace.id,
        title: "Giờ vàng mua 1 tặng 1",
        isActive: false,
        startDate: "Oct 10, 2024",
        endDate: "Oct 30, 2024",
        days: ["Sa", "S"],
        startTime: "05:00 PM",
        endTime: "08:00 PM",
        specificTime: true,
      },
    ],
  });

  await prisma.placeUpdate.createMany({
    data: [
      {
        placeId: firstPlace.id,
        ownerId: owner.id,
        title: "Góc chụp ảnh đẹp nhất hôm nay",
        content:
          "Khung đường đèn lồng đang rất đẹp vào lúc 17:30 - 18:15. Nếu bạn ghé qua trong khoảng này thì nhớ mang theo máy ảnh.",
      },
      {
        placeId: secondPlace.id,
        ownerId: owner.id,
        title: "Thêm combo bữa tối nhẹ",
        content:
          "Nhà hàng vừa thêm combo cho cặp đôi, phù hợp để đặt bàn sớm và dùng bữa tối thư giãn.",
      },
    ],
  });

  const dinnerOption = await prisma.bookingOption.create({
    data: {
      placeId: secondPlace.id,
      title: "Bàn tối cho 2 người",
      description: "Khung giờ phù hợp cho bữa tối nhẹ nhàng và thoải mái.",
      priceLabel: "350.000đ / bàn",
      durationMinutes: 90,
      maxPartySize: 2,
      isActive: true,
    },
  });

  const dinnerSlot = await prisma.availabilitySlot.create({
    data: {
      optionId: dinnerOption.id,
      startAt: new Date("2026-06-15T11:00:00.000Z"),
      endAt: new Date("2026-06-15T12:30:00.000Z"),
      capacity: 6,
      isActive: true,
    },
  });

  await prisma.booking.create({
    data: {
      placeId: secondPlace.id,
      optionId: dinnerOption.id,
      slotId: dinnerSlot.id,
      travelerId: traveler.id,
      partySize: 2,
      note: "Bàn gần cửa sổ nếu còn chỗ",
      status: "CONFIRMED",
    },
  });

  const summerCollection = await prisma.collection.create({
    data: {
      userId: traveler.id,
      title: "Bộ sưu tập hè 2026",
      isPublic: false,
    },
  });

  await prisma.collectionPlace.createMany({
    data: [
      {
        collectionId: summerCollection.id,
        placeId: firstPlace.id,
      },
      {
        collectionId: summerCollection.id,
        placeId: secondPlace.id,
      },
    ],
  });

  await prisma.trip.create({
    data: {
      userId: traveler.id,
      title: "Kyoto thư giãn cuối tuần",
      destination: "Kyoto, Nhật Bản",
      startDate: new Date("2026-06-12"),
      endDate: new Date("2026-06-14"),
      budget: "balanced",
      notes: "Ưu tiên địa điểm yên tĩnh, đi bộ nhẹ và có thời gian chụp ảnh.",
      stops: {
        create: [
          {
            dayNumber: 1,
            orderIndex: 1,
            title: "Check-in khách sạn",
            location: "Khu trung tâm Kyoto",
            note: "Nhận phòng trước 15:00",
            startTime: "14:00",
            endTime: "15:00",
          },
          {
            dayNumber: 1,
            orderIndex: 2,
            title: "Dạo Gion District",
            location: "Kyoto, Nhật Bản",
            note: "Đi bộ và chụp ảnh lúc hoàng hôn",
            startTime: "16:30",
            endTime: "18:30",
          },
          {
            dayNumber: 2,
            orderIndex: 1,
            title: "Ăn tối tại Happy Restaurant",
            location: "Tokyo, Nhật Bản",
            note: "Đặt bàn cho 2 người",
            startTime: "18:00",
            endTime: "20:00",
          },
        ],
      },
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: traveler.id,
        type: "booking_status",
        title: "Booking của bạn đã được xác nhận",
        message: "Happy Restaurant đã xác nhận bàn tối cho 2 người.",
        payload: {
          screen: "Booking History",
          params: {
            placeId: secondPlace.id,
          },
        },
      },
      {
        userId: traveler.id,
        type: "place_update",
        title: "Gion District có cập nhật mới",
        message: "Góc chụp ảnh đẹp nhất hôm nay",
        payload: {
          screen: "Detail Location",
          params: {
            placeId: firstPlace.id,
          },
        },
      },
    ],
  });

  console.info("Đã nạp dữ liệu mẫu thành công.");
  console.info("- Traveler: demo@example.com / demo1234");
  console.info("- Owner: owner@example.com / demo1234");
  console.info("Cả hai tài khoản đã được xác minh email và có thể đăng nhập ngay.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    void prisma.$disconnect();
    process.exit(1);
  });
