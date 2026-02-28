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

export const analyticsService = {
  getAdminAnalytics,
};
