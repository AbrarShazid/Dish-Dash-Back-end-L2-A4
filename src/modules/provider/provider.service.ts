import { prisma } from "../../lib/prisma";

const getAllProviders = async () => {
  const result = await prisma.providerProfile.findMany({
    where: { isOpen: true },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          orders: true,
          meals: true,
          
        },
      },
    },
  });

  return result.map((singleProvider) => ({
    providerId: singleProvider.id,
    restaurantName: singleProvider.restaurantName,
    description: singleProvider.description,
    image: singleProvider.imageUrl,
    isOpen: singleProvider.isOpen,
    createdAt: singleProvider.createdAt,
    restauranOwner: singleProvider.user.name,
    totalOrderServed: singleProvider._count.orders,
    totalItem: singleProvider._count.meals,
   
  }));
};

const getMenuByProvider = async (providerId: string) => {
  const providerWithMenu = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    include: {
      user: {
        select: {
          name: true,
        },
      },

      meals: {
        where: {
          isAvailable: true,
        },

        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!providerWithMenu || !providerWithMenu.isOpen) {
    throw new Error("Provider not found");
  }

  return {
    providerId: providerWithMenu.id,
    restaurantName: providerWithMenu.restaurantName,
    description: providerWithMenu.description,
    image: providerWithMenu.imageUrl,
    isOpen: providerWithMenu.isOpen,
    createdAt: providerWithMenu.createdAt,
    restaurantOwner: providerWithMenu.user.name,
    menu: providerWithMenu.meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      restaurantName: providerWithMenu.restaurantName,
      description: meal.description,
      price: meal.price,
      image: meal.imageUrl,
      categoryName: meal.category.name,
    })),
  };
};

export const providerService = {
  getAllProviders,
  getMenuByProvider,
};
