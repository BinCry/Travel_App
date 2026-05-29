import { Prisma } from "@prisma/client";
import {
  notificationSchema,
  type NotificationItem,
  type NotificationType,
} from "@travel-app/shared/contracts/notifications";
import { prisma } from "../database/client.js";

type NotificationPayload = Prisma.InputJsonValue | undefined;

function bookingStatusLabel(status: string) {
  switch (status) {
    case "DRAFT":
      return "bản nháp";
    case "PENDING":
      return "đang chờ xác nhận";
    case "CONFIRMED":
      return "đã xác nhận";
    case "REJECTED":
      return "đã bị từ chối";
    case "CANCELLED":
      return "đã hủy";
    case "COMPLETED":
      return "đã hoàn tất";
    case "NO_SHOW":
      return "không đến";
    case "REFUND_PENDING":
      return "đang chờ hoàn tiền";
    case "REFUNDED":
      return "đã hoàn tiền";
    default:
      return status;
  }
}

function mapNotification(notification: {
  id: string;
  type: string;
  title: string;
  message: string;
  payload: Prisma.JsonValue | null;
  readAt: Date | null;
  createdAt: Date;
}): NotificationItem {
  return notificationSchema.parse({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    payload: notification.payload,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  });
}

async function assertOwnedNotification(userId: number, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw Object.assign(new Error("NOTIFICATION_NOT_FOUND"), { statusCode: 404 });
  }

  return notification;
}

async function createOne(input: {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  payload?: NotificationPayload;
}) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      payload: input.payload,
    },
  });
}

export const notificationsService = {
  async list(userId: number): Promise<NotificationItem[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    });

    return notifications.map(mapNotification);
  },

  async markRead(userId: number, notificationId: string): Promise<NotificationItem> {
    await assertOwnedNotification(userId, notificationId);
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        readAt: new Date(),
      },
    });
    return mapNotification(updated);
  },

  async markAllRead(userId: number) {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: {
        readAt: new Date(),
      },
    });
  },

  async remove(userId: number, notificationId: string) {
    await assertOwnedNotification(userId, notificationId);
    await prisma.notification.delete({
      where: { id: notificationId },
    });
  },

  async notifyReviewReply(input: {
    travelerId: number;
    placeId: string;
    placeName: string;
    reviewId: string;
    ownerName: string;
  }) {
    await createOne({
      userId: input.travelerId,
      type: "review_reply",
      title: "Chủ địa điểm đã phản hồi review của bạn",
      message: `${input.ownerName} vừa gửi phản hồi cho review tại ${input.placeName}.`,
      payload: {
        screen: "All Reviews",
        params: {
          placeId: input.placeId,
          placeName: input.placeName,
          reviewId: input.reviewId,
        },
      },
    });
  },

  async notifyBookingStatusChange(input: {
    travelerId: number;
    placeId: string;
    placeName: string;
    bookingId: string;
    status: string;
  }) {
    await createOne({
      userId: input.travelerId,
      type: "booking_status",
      title: "Booking của bạn vừa được cập nhật",
      message: `Booking tại ${input.placeName} đã chuyển sang trạng thái ${bookingStatusLabel(input.status)}.`,
      payload: {
        screen: "Booking History",
        params: {
          bookingId: input.bookingId,
          placeId: input.placeId,
        },
      },
    });
  },

  async notifyPlaceUpdateFollowers(input: {
    placeId: string;
    placeName: string;
    updateId: string;
    title: string;
    ownerId: number;
  }) {
    const favorites = await prisma.favorite.findMany({
      where: { placeId: input.placeId },
      select: { userId: true },
      distinct: ["userId"],
    });

    const followerIds = favorites
      .map((item) => item.userId)
      .filter((userId) => userId !== input.ownerId);

    if (!followerIds.length) {
      return;
    }

    await prisma.notification.createMany({
      data: followerIds.map((userId) => ({
        userId,
        type: "place_update",
        title: `Địa điểm ${input.placeName} có cập nhật mới`,
        message: input.title,
        payload: {
          screen: "Detail Location",
          params: {
            placeId: input.placeId,
            updateId: input.updateId,
          },
        } satisfies Prisma.InputJsonValue,
      })),
    });
  },
};
