import { prisma } from "../../lib/prisma";

const createReview = async (
  userId: string,
  mealId: string,
  rating: number,
  comment?: string,
) => {
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // 2️⃣ Check if user ordered this meal before
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      mealId,
      order: {
        customerId: userId,
        status: "DELIVERED",
      },
      review: null, //  not reviewed yet
    },
  });

  if (!orderItem) {
    throw new Error(
      "You have no delivered order to review or already reviewed",
    );
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment: comment ?? null,
      mealId,
      userId,
      orderItemId: orderItem.id,
    },
  });

  return review;
};

export const reviewService = {
  createReview,
};
