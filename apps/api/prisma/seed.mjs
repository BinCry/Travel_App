import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = "travel1234";

function bookingTimestamps(status) {
  const now = new Date();
  return {
    confirmedAt: status === "CONFIRMED" || status === "COMPLETED" || status === "NO_SHOW" ? now : null,
    rejectedAt: status === "REJECTED" ? now : null,
    cancelledAt: status === "CANCELLED" ? now : null,
    completedAt: status === "COMPLETED" ? now : null,
    noShowAt: status === "NO_SHOW" ? now : null,
    refundPendingAt: status === "REFUND_PENDING" ? now : null,
    refundedAt: status === "REFUNDED" ? now : null,
  };
}

async function resetDatabase() {
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.bookingOption.deleteMany();
  await prisma.promotion.deleteMany();
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
}

async function createUser(data) {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: data.role,
      emailVerifiedAt: new Date(),
      fullName: data.fullName,
      username: data.username,
      location: data.location,
      avatarUrl: data.avatarUrl ?? null,
    },
  });
}

async function recalcPlaceStats(placeId) {
  const aggregate = await prisma.review.aggregate({
    where: { placeId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.place.update({
    where: { id: placeId },
    data: {
      averageRating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      ratingCount: aggregate._count,
    },
  });
}

async function createReview({
  placeId,
  userId,
  rating,
  content,
  imageUrls = [],
  ownerId,
  ownerReplyContent,
}) {
  const review = await prisma.review.create({
    data: {
      placeId,
      userId,
      rating,
      content,
      images: imageUrls.length
        ? {
            create: imageUrls.map((url) => ({ url })),
          }
        : undefined,
    },
  });

  if (ownerId && ownerReplyContent) {
    await prisma.reviewReply.create({
      data: {
        reviewId: review.id,
        ownerId,
        content: ownerReplyContent,
      },
    });
  }

  await recalcPlaceStats(placeId);
  return review;
}

async function createBookingWithHistory({
  placeId,
  optionId,
  slotId,
  travelerId,
  partySize,
  note = null,
  ownerDecisionNote = null,
  cancellationReason = null,
  unitPriceAmount,
  subtotalAmount,
  discountAmount = 0,
  finalAmount,
  currency = "VND",
  appliedVoucherCode = null,
  voucherId = null,
  status = "PENDING",
  history = [],
}) {
  const booking = await prisma.booking.create({
    data: {
      placeId,
      optionId,
      slotId,
      travelerId,
      voucherId,
      partySize,
      note,
      ownerDecisionNote,
      cancellationReason,
      unitPriceAmount,
      subtotalAmount,
      discountAmount,
      finalAmount,
      currency,
      appliedVoucherCode,
      status,
      ...bookingTimestamps(status),
    },
  });

  const fallbackHistory = [
    {
      status: "PENDING",
      note,
      actorRole: "TRAVELER",
      actorUserId: travelerId,
      actorName: "Khách đặt chỗ",
    },
  ];

  const allHistory = history.length > 0 ? history : fallbackHistory;

  await prisma.bookingStatusHistory.createMany({
    data: allHistory.map((entry, index) => ({
      bookingId: booking.id,
      status: entry.status,
      note: entry.note ?? null,
      actorRole: entry.actorRole ?? null,
      actorUserId: entry.actorUserId ?? null,
      actorName: entry.actorName ?? null,
      createdAt: new Date(Date.now() + index * 1000),
    })),
  });

  return booking;
}

async function syncVoucherUsageCounts() {
  const vouchers = await prisma.voucher.findMany({
    select: { id: true },
  });

  for (const voucher of vouchers) {
    const usedCount = await prisma.booking.count({
      where: {
        voucherId: voucher.id,
        status: {
          notIn: ["REJECTED", "CANCELLED"],
        },
      },
    });

    await prisma.voucher.update({
      where: { id: voucher.id },
      data: { usedCount },
    });
  }
}

async function main() {
  await resetDatabase();

  const [
    linhTraveler,
    thaoTraveler,
    quangTraveler,
    minhOwner,
    lanOwner,
  ] = await Promise.all([
    createUser({
      email: "linh.nguyen@example.com",
      role: "TRAVELER",
      fullName: "Linh Nguyễn",
      username: "linhnguyen",
      location: "Đà Nẵng",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    }),
    createUser({
      email: "thao.tran@example.com",
      role: "TRAVELER",
      fullName: "Thảo Trần",
      username: "thaotran",
      location: "Hội An",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    }),
    createUser({
      email: "quang.pham@example.com",
      role: "TRAVELER",
      fullName: "Quang Phạm",
      username: "quangpham",
      location: "Hà Nội",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    }),
    createUser({
      email: "minh.host@example.com",
      role: "OWNER",
      fullName: "Minh Trần",
      username: "minhhost",
      location: "Kyoto",
    }),
    createUser({
      email: "lan.owner@example.com",
      role: "OWNER",
      fullName: "Lan Phạm",
      username: "lanowner",
      location: "Sa Pa",
    }),
  ]);

  const [
    kyotoLanternWalk,
    hoiAnBistro,
    sapaFestival,
    daNangCafe,
  ] = await Promise.all([
    prisma.place.create({
      data: {
        ownerId: minhOwner.id,
        name: "Kyoto Lantern Walk",
        region: "Kyoto, Nhật Bản",
        category: "ATTRACTIONS",
        coverImageUrl:
          "https://i.pinimg.com/1200x/28/31/da/2831da0f8a4b18fde25867ef90e66207.jpg",
        featureLabel: "Yên tĩnh lúc chiều tà",
        averageRating: 0,
        ratingCount: 0,
        priceLevel: 180000,
        about:
          "Tuyến phố cổ với đèn lồng, kiến trúc truyền thống và nhịp đi bộ rất dễ chịu cho buổi chiều tối.",
      },
    }),
    prisma.place.create({
      data: {
        ownerId: minhOwner.id,
        name: "Hội An Riverside Bistro",
        region: "Hội An, Việt Nam",
        category: "DINING",
        coverImageUrl:
          "https://i.pinimg.com/1200x/f1/9c/a0/f19ca09250c88864491e7cacecd1eb40.jpg",
        featureLabel: "Đang nhận booking tối",
        averageRating: 0,
        ratingCount: 0,
        priceLevel: 420000,
        about:
          "Nhà hàng nhỏ bên sông, phù hợp cho bữa tối nhẹ nhàng, nhóm bạn nhỏ và cặp đôi thích không khí thư giãn.",
      },
    }),
    prisma.place.create({
      data: {
        ownerId: lanOwner.id,
        name: "Sapa Cloud Festival",
        region: "Sa Pa, Việt Nam",
        category: "FESTIVALS",
        coverImageUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        featureLabel: "Cuối tuần đông vui",
        averageRating: 0,
        ratingCount: 0,
        priceLevel: 250000,
        about:
          "Không gian sự kiện ngoài trời với khung núi mây, hoạt động âm nhạc nhẹ và khu trải nghiệm ẩm thực địa phương.",
      },
    }),
    prisma.place.create({
      data: {
        ownerId: lanOwner.id,
        name: "Da Nang Sea Breeze Cafe",
        region: "Đà Nẵng, Việt Nam",
        category: "DINING",
        coverImageUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
        featureLabel: "Cafe sáng ven biển",
        averageRating: 0,
        ratingCount: 0,
        priceLevel: 95000,
        about:
          "Quán cafe nhìn ra biển, hợp cho bữa sáng, làm việc nhẹ và dừng chân trước khi khám phá thành phố.",
      },
    }),
  ]);

  await Promise.all([
    prisma.promotion.create({
      data: {
        placeId: hoiAnBistro.id,
        title: "Giảm 15% set tối trước 18:00",
        isActive: true,
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        startTime: "17:00",
        endTime: "18:00",
        specificTime: true,
      },
    }),
    prisma.promotion.create({
      data: {
        placeId: sapaFestival.id,
        title: "Combo vé nhóm 4 người",
        isActive: true,
        startDate: "2026-06-05",
        endDate: "2026-06-30",
        days: ["saturday", "sunday"],
        startTime: "08:00",
        endTime: "22:00",
        specificTime: true,
      },
    }),
  ]);

  await Promise.all([
    prisma.placeUpdate.create({
      data: {
        placeId: kyotoLanternWalk.id,
        ownerId: minhOwner.id,
        title: "Khung giờ chụp ảnh đẹp nhất hôm nay",
        content:
          "Từ 17:20 đến 18:10 ánh sáng đang rất đẹp, phù hợp để đi bộ chậm và chụp ảnh dọc tuyến phố đèn lồng.",
      },
    }),
    prisma.placeUpdate.create({
      data: {
        placeId: hoiAnBistro.id,
        ownerId: minhOwner.id,
        title: "Thêm set tối theo mùa",
        content:
          "Bếp vừa cập nhật set tối mới cho 2 người với món khai vị nhẹ và món chính theo hải sản trong ngày.",
      },
    }),
    prisma.placeUpdate.create({
      data: {
        placeId: sapaFestival.id,
        ownerId: lanOwner.id,
        title: "Mở thêm khu ngắm mây sáng sớm",
        content:
          "Ban tổ chức đã mở thêm khung ngắm mây từ 05:30 cho khách muốn săn mây và chụp ảnh bình minh.",
      },
    }),
  ]);

  await createReview({
    placeId: kyotoLanternWalk.id,
    userId: linhTraveler.id,
    rating: 5,
    content:
      "Đi bộ lúc hoàng hôn rất thư giãn, ánh sáng lên ảnh đẹp và không khí cổ kính đúng như mong đợi.",
    imageUrls: [
      "https://i.pinimg.com/736x/72/41/dd/7241ddb23e868c19ec43a701104132f6.jpg",
      "https://i.pinimg.com/736x/97/24/45/97244547fc44fbc06968e4c72d2efdfc.jpg",
    ],
    ownerId: minhOwner.id,
    ownerReplyContent:
      "Cảm ơn bạn đã ghé thăm. Nếu quay lại vào cuối tuần, bên mình gợi ý khung 17:30 để ảnh lên màu đẹp hơn.",
  });

  await createReview({
    placeId: kyotoLanternWalk.id,
    userId: thaoTraveler.id,
    rating: 4,
    content:
      "Phố khá đẹp và dễ đi bộ, chỉ hơi đông vào cuối buổi chiều nhưng vẫn đáng trải nghiệm.",
    ownerId: minhOwner.id,
    ownerReplyContent:
      "Cảm ơn Thảo. Bên mình vừa thêm hướng dẫn khung giờ ít đông hơn để khách tham khảo trước khi ghé.",
  });

  await createReview({
    placeId: kyotoLanternWalk.id,
    userId: quangTraveler.id,
    rating: 5,
    content:
      "Không gian rất hợp để chụp ảnh và đi chậm, cảm giác yên bình hơn nhiều khu du lịch đông đúc khác.",
  });

  await createReview({
    placeId: hoiAnBistro.id,
    userId: linhTraveler.id,
    rating: 4,
    content:
      "Set tối ngon, phục vụ ổn và chỗ ngồi sát sông khá dễ chịu. Nếu đặt sớm sẽ chọn được vị trí đẹp hơn.",
    ownerId: minhOwner.id,
    ownerReplyContent:
      "Cảm ơn Linh. Lần tới bạn có thể ghi chú trước nếu muốn giữ bàn gần ban công nhìn ra sông.",
  });

  await createReview({
    placeId: hoiAnBistro.id,
    userId: thaoTraveler.id,
    rating: 5,
    content:
      "Món lên vừa phải, không gian buổi tối rất chill và nhân viên hỗ trợ khách đặt bàn khá kỹ.",
  });

  await createReview({
    placeId: sapaFestival.id,
    userId: quangTraveler.id,
    rating: 5,
    content:
      "Sự kiện có không khí vui nhưng vẫn dễ theo dõi, khu săn mây sáng sớm là phần mình thích nhất.",
    ownerId: lanOwner.id,
    ownerReplyContent:
      "Cảm ơn Quang. Cuối tuần tới bọn mình có thêm khung acoustic buổi tối nếu bạn muốn quay lại trải nghiệm.",
  });

  await prisma.favorite.createMany({
    data: [
      { userId: linhTraveler.id, placeId: kyotoLanternWalk.id },
      { userId: linhTraveler.id, placeId: hoiAnBistro.id },
      { userId: thaoTraveler.id, placeId: sapaFestival.id },
      { userId: quangTraveler.id, placeId: kyotoLanternWalk.id },
      { userId: quangTraveler.id, placeId: daNangCafe.id },
    ],
  });

  const [linhCollection, thaoCollection] = await Promise.all([
    prisma.collection.create({
      data: {
        userId: linhTraveler.id,
        title: "Chill cuối tuần",
        isPublic: false,
      },
    }),
    prisma.collection.create({
      data: {
        userId: thaoTraveler.id,
        title: "Ăn tối & dạo phố",
        isPublic: true,
      },
    }),
  ]);

  await prisma.collectionPlace.createMany({
    data: [
      { collectionId: linhCollection.id, placeId: kyotoLanternWalk.id },
      { collectionId: linhCollection.id, placeId: daNangCafe.id },
      { collectionId: thaoCollection.id, placeId: hoiAnBistro.id },
      { collectionId: thaoCollection.id, placeId: kyotoLanternWalk.id },
    ],
  });

  await prisma.trip.create({
    data: {
      userId: linhTraveler.id,
      title: "Đà Nẵng - Hội An 3 ngày thư giãn",
      destination: "Đà Nẵng & Hội An",
      startDate: new Date("2026-06-12"),
      endDate: new Date("2026-06-14"),
      budget: "balanced",
      notes: "Ưu tiên đi nhẹ, ăn ngon và có một tối thật chill ở Hội An.",
      stops: {
        create: [
          {
            dayNumber: 1,
            orderIndex: 1,
            title: "Cafe sáng ven biển",
            location: daNangCafe.region,
            note: "Làm việc nhẹ và ngắm biển trước khi di chuyển",
            startTime: "08:00",
            endTime: "09:30",
          },
          {
            dayNumber: 2,
            orderIndex: 1,
            title: "Ăn tối bên sông",
            location: hoiAnBistro.region,
            note: "Đã giữ bàn cho 2 người",
            startTime: "18:00",
            endTime: "19:30",
          },
          {
            dayNumber: 2,
            orderIndex: 2,
            title: "Đi bộ phố cổ đêm",
            location: hoiAnBistro.region,
            note: "Chụp ảnh và đi dạo nhẹ sau bữa tối",
            startTime: "19:45",
            endTime: "21:00",
          },
        ],
      },
    },
  });

  const kyotoOption = await prisma.bookingOption.create({
    data: {
      placeId: kyotoLanternWalk.id,
      title: "Tour đi bộ hoàng hôn",
      description: "Khung giờ đẹp để đi bộ, nghe kể chuyện khu phố và chụp ảnh.",
      priceLabel: "180.000đ / khách",
      basePriceAmount: 180000,
      currency: "VND",
      durationMinutes: 90,
      maxPartySize: 6,
      isActive: true,
    },
  });

  const bistroOption = await prisma.bookingOption.create({
    data: {
      placeId: hoiAnBistro.id,
      title: "Bữa tối bên sông cho 2 người",
      description: "Set tối nhẹ nhàng, phù hợp cho cặp đôi hoặc nhóm 2 người.",
      priceLabel: "420.000đ / bàn",
      basePriceAmount: 420000,
      currency: "VND",
      durationMinutes: 90,
      maxPartySize: 2,
      isActive: true,
    },
  });

  const festivalOption = await prisma.bookingOption.create({
    data: {
      placeId: sapaFestival.id,
      title: "Vé vào cổng cuối tuần",
      description: "Vé tham gia trọn ngày cho khu âm nhạc và trải nghiệm săn mây.",
      priceLabel: "250.000đ / khách",
      basePriceAmount: 250000,
      currency: "VND",
      durationMinutes: 240,
      maxPartySize: 4,
      isActive: true,
    },
  });

  const [
    kyotoSlotA,
    kyotoSlotB,
    bistroSlotA,
    bistroSlotB,
    festivalSlotA,
  ] = await Promise.all([
    prisma.availabilitySlot.create({
      data: {
        optionId: kyotoOption.id,
        startAt: new Date("2026-06-21T10:30:00.000Z"),
        endAt: new Date("2026-06-21T12:00:00.000Z"),
        capacity: 10,
        isActive: true,
      },
    }),
    prisma.availabilitySlot.create({
      data: {
        optionId: kyotoOption.id,
        startAt: new Date("2026-06-22T10:30:00.000Z"),
        endAt: new Date("2026-06-22T12:00:00.000Z"),
        capacity: 10,
        isActive: true,
      },
    }),
    prisma.availabilitySlot.create({
      data: {
        optionId: bistroOption.id,
        startAt: new Date("2026-06-15T11:00:00.000Z"),
        endAt: new Date("2026-06-15T12:30:00.000Z"),
        capacity: 8,
        isActive: true,
      },
    }),
    prisma.availabilitySlot.create({
      data: {
        optionId: bistroOption.id,
        startAt: new Date("2026-06-16T11:00:00.000Z"),
        endAt: new Date("2026-06-16T12:30:00.000Z"),
        capacity: 8,
        isActive: true,
      },
    }),
    prisma.availabilitySlot.create({
      data: {
        optionId: festivalOption.id,
        startAt: new Date("2026-06-20T01:00:00.000Z"),
        endAt: new Date("2026-06-20T05:00:00.000Z"),
        capacity: 20,
        isActive: true,
      },
    }),
  ]);

  const [bistroVoucher, kyotoVoucher] = await Promise.all([
    prisma.voucher.create({
      data: {
        placeId: hoiAnBistro.id,
        optionId: bistroOption.id,
        code: "RIVERSIDE50",
        title: "Giảm 50.000đ bữa tối bên sông",
        description: "Áp dụng cho booking bữa tối 2 người trong khung giờ tối.",
        isActive: true,
        startsAt: new Date("2026-06-01T00:00:00.000Z"),
        endsAt: new Date("2026-06-30T23:59:59.000Z"),
        usageLimit: 20,
        usedCount: 0,
        discountType: "FIXED_AMOUNT",
        discountValue: 50000,
      },
    }),
    prisma.voucher.create({
      data: {
        placeId: kyotoLanternWalk.id,
        optionId: kyotoOption.id,
        code: "LANTERN10",
        title: "Giảm 10% tour đi bộ",
        description: "Áp dụng cho tour đi bộ hoàng hôn trong tháng 6.",
        isActive: true,
        startsAt: new Date("2026-06-01T00:00:00.000Z"),
        endsAt: new Date("2026-06-30T23:59:59.000Z"),
        usageLimit: 15,
        usedCount: 0,
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscountAmount: 30000,
      },
    }),
  ]);

  const confirmedBistroBooking = await createBookingWithHistory({
    placeId: hoiAnBistro.id,
    optionId: bistroOption.id,
    slotId: bistroSlotA.id,
    travelerId: linhTraveler.id,
    partySize: 2,
    note: "Nếu còn chỗ hãy ưu tiên bàn nhìn ra sông.",
    ownerDecisionNote: "Giữ bàn đến 18:15.",
    unitPriceAmount: 420000,
    subtotalAmount: 420000,
    discountAmount: 50000,
    finalAmount: 370000,
    appliedVoucherCode: bistroVoucher.code,
    voucherId: bistroVoucher.id,
    status: "CONFIRMED",
    history: [
      {
        status: "PENDING",
        note: "Khách gửi yêu cầu booking.",
        actorRole: "TRAVELER",
        actorUserId: linhTraveler.id,
        actorName: linhTraveler.fullName,
      },
      {
        status: "CONFIRMED",
        note: "Đã giữ bàn và xác nhận booking.",
        actorRole: "OWNER",
        actorUserId: minhOwner.id,
        actorName: minhOwner.fullName,
      },
    ],
  });

  await createBookingWithHistory({
    placeId: hoiAnBistro.id,
    optionId: bistroOption.id,
    slotId: bistroSlotB.id,
    travelerId: thaoTraveler.id,
    partySize: 2,
    note: "Mình đi đúng giờ, không cần setup thêm.",
    unitPriceAmount: 420000,
    subtotalAmount: 420000,
    discountAmount: 0,
    finalAmount: 420000,
    status: "PENDING",
  });

  await createBookingWithHistory({
    placeId: kyotoLanternWalk.id,
    optionId: kyotoOption.id,
    slotId: kyotoSlotA.id,
    travelerId: quangTraveler.id,
    partySize: 3,
    note: "Nhóm mình muốn đi chậm để chụp ảnh.",
    ownerDecisionNote: "Hướng dẫn viên sẽ đón tại điểm hẹn trước 10 phút.",
    unitPriceAmount: 180000,
    subtotalAmount: 540000,
    discountAmount: 30000,
    finalAmount: 510000,
    appliedVoucherCode: kyotoVoucher.code,
    voucherId: kyotoVoucher.id,
    status: "COMPLETED",
    history: [
      {
        status: "PENDING",
        note: "Khách đã gửi booking cho nhóm 3 người.",
        actorRole: "TRAVELER",
        actorUserId: quangTraveler.id,
        actorName: quangTraveler.fullName,
      },
      {
        status: "CONFIRMED",
        note: "Đã xác nhận và gửi điểm hẹn chi tiết.",
        actorRole: "OWNER",
        actorUserId: minhOwner.id,
        actorName: minhOwner.fullName,
      },
      {
        status: "COMPLETED",
        note: "Tour kết thúc đúng lịch trình.",
        actorRole: "OWNER",
        actorUserId: minhOwner.id,
        actorName: minhOwner.fullName,
      },
    ],
  });

  await createBookingWithHistory({
    placeId: sapaFestival.id,
    optionId: festivalOption.id,
    slotId: festivalSlotA.id,
    travelerId: linhTraveler.id,
    partySize: 2,
    note: "Mình muốn vào cổng sớm để săn mây.",
    cancellationReason: "Đổi kế hoạch di chuyển nên không kịp lên Sa Pa.",
    unitPriceAmount: 250000,
    subtotalAmount: 500000,
    discountAmount: 0,
    finalAmount: 500000,
    status: "CANCELLED",
    history: [
      {
        status: "PENDING",
        note: "Khách tạo booking vé sự kiện.",
        actorRole: "TRAVELER",
        actorUserId: linhTraveler.id,
        actorName: linhTraveler.fullName,
      },
      {
        status: "CANCELLED",
        note: "Khách đổi kế hoạch và hủy booking.",
        actorRole: "TRAVELER",
        actorUserId: linhTraveler.id,
        actorName: linhTraveler.fullName,
      },
    ],
  });

  await syncVoucherUsageCounts();

  await prisma.notification.createMany({
    data: [
      {
        userId: linhTraveler.id,
        type: "booking_status",
        title: "Booking đã được xác nhận",
        message: `Hội An Riverside Bistro đã xác nhận booking ${confirmedBistroBooking.id}.`,
        payload: {
          screen: "Booking Detail",
          params: {
            bookingId: confirmedBistroBooking.id,
          },
        },
      },
      {
        userId: linhTraveler.id,
        type: "place_update",
        title: "Kyoto Lantern Walk có cập nhật mới",
        message: "Khung giờ chụp ảnh đẹp nhất hôm nay vừa được cập nhật.",
        payload: {
          screen: "Detail Location",
          params: {
            placeId: kyotoLanternWalk.id,
          },
        },
      },
      {
        userId: quangTraveler.id,
        type: "review_reply",
        title: "Chủ địa điểm đã phản hồi đánh giá của bạn",
        message: "Lan Phạm vừa phản hồi đánh giá tại Sapa Cloud Festival.",
        payload: {
          screen: "All Reviews",
          params: {
            placeId: sapaFestival.id,
            placeName: sapaFestival.name,
          },
        },
      },
    ],
  });

  const summary = await Promise.all([
    prisma.place.findMany({
      select: {
        name: true,
        averageRating: true,
        ratingCount: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  console.info("Đã nạp dữ liệu production-like thành công.");
  console.info(`Mật khẩu chung cho toàn bộ tài khoản test: ${DEFAULT_PASSWORD}`);
  console.info("Tài khoản traveler:");
  console.info(`- ${linhTraveler.email}`);
  console.info(`- ${thaoTraveler.email}`);
  console.info(`- ${quangTraveler.email}`);
  console.info("Tài khoản owner:");
  console.info(`- ${minhOwner.email}`);
  console.info(`- ${lanOwner.email}`);
  console.info("Tóm tắt rating thực theo dữ liệu seed:");
  for (const place of summary[0]) {
    console.info(`- ${place.name}: ${place.averageRating} (${place.ratingCount} đánh giá)`);
  }
  console.info("Tóm tắt booking theo trạng thái:");
  for (const item of summary[1]) {
    console.info(`- ${item.status}: ${item._count.status}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    void prisma.$disconnect();
    process.exit(1);
  });
