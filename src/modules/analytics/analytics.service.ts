import { prisma } from "../../lib/prisma";

const getAdminAnalytics = async () => {
  const totalUsers = await prisma.user.count();
  const totalProviders = await prisma.providerProfile.count();
  const totalMeals = await prisma.meal.count();
  const totalOrders = await prisma.order.count();

  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: "DELIVERED" },
  });

  return {
    totalUser: totalUsers,
    totalRestaurant: totalProviders,
    totalItem: totalMeals,
    totalOrders: totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount,
  };
};

const getProviderAnalytics = async (userId: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: {
      userId,
    },
  });
  const providerId = provider?.id;

  if (!providerId) {
    throw new Error("No provider found!");
  }
  // Total orders for this provider
  const totalOrders = await prisma.order.count({
    where: { providerId },
  });

  // Total revenue from delivered orders
  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      providerId,
      status: "DELIVERED",
    },
  });

  const totalMenuItems = await prisma.meal.count({
    where: {
      providerId,
      isDeleted: false,
    },
  });

  // Average rating from reviews of this provider's meals
  const avgRating = await prisma.review.aggregate({
    _avg: { rating: true },
    where: {
      meal: {
        providerId,
      },
    },
  });

  // Total unique customers served
  const uniqueCustomers = await prisma.order.groupBy({
    by: ["customerId"],
    where: { providerId },
    _count: true,
  });
  return {
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
    totalMenuItems,
    averageRating: Number(avgRating._avg.rating) || 0,
    totalCustomersServed: uniqueCustomers.length,
  };
};

export const analyticsService = {
  getAdminAnalytics,
  getProviderAnalytics,
};
