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
  }));
};



export const providerService = {
  getAllProviders,
  // getMenuByProvider,
};
