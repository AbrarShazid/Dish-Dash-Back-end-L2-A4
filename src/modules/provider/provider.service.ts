import { prisma } from "../../lib/prisma";
interface BecomeProviderPayload {
  restaurantName: string;
  image?: string;
  description?: string;
}

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

// become provide from customer
const becomeProvider = async (
  userId: string,
  payload: BecomeProviderPayload,
) => {
  return await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { role: "PROVIDER" },
    });

    const providerProfile = await tx.providerProfile.create({
      data: {
        userId,
        restaurantName: payload.restaurantName,
        description: payload.description ?? null,
        imageUrl: payload.image ?? null,
      },
    });

    return {
      succes: true,
      providerProfile,
    };
  });
};

//update provider profile (restaurant name, description, image etc)
const updateProviderProfile = async (
  userId: string,
  payload: BecomeProviderPayload,
  // file: Express.Multer.File
) => {
  return await prisma.$transaction(async (tx) => {
    // const uploadResult: any = await uploadToCloudinary(file.buffer);

    // const imageUrl = uploadResult.secure_url;

    const providerProfile = await tx.providerProfile.update({
      where: { userId },
      data: {
        restaurantName: payload.restaurantName,
        description: payload.description ?? null,
        // imageUrl,
      },
    });

    return {
      succes: true,
      providerProfile,
    };
  });
};

const toggleOpen = async (userId: string, isOpen: boolean) => {
  const provider = await prisma.providerProfile.update({
    where: { userId },
    data: { isOpen },
  });

  return provider;
};

export const providerService = {
  getAllProviders,
  getMenuByProvider,
  becomeProvider,
  updateProviderProfile,
  toggleOpen,
};
