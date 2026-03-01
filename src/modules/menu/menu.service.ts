import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { prisma } from "../../lib/prisma";

interface MenuItem {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
}

interface UpdateMenuItemPayload {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}

const addMenuItem = async (userId: string, menuItem: MenuItem) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    return {
      success: false,
      message: "Provider profile not found",
    };
  }

  const category = await prisma.category.findUnique({
    where: { id: menuItem.categoryId },
  });

  if (!category) {
    return {
      success: false,
      message: "Invalid category ID",
    };
  }

  const result = await prisma.meal.create({
    data: {
      name: menuItem.name,
      description: menuItem.description ?? null,
      price: menuItem.price,
      categoryId: menuItem.categoryId,
      imageUrl: menuItem.imageUrl ?? null,
      providerId: provider.id,
    },
  });

  return result;
};

const updateMenuItem = async (
  userId: string,
  mealId: string,
  payload: UpdateMenuItemPayload,
) => {
  //  Find provider
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  //  Find meal and check ownership
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
  });

  if (!meal) {
    throw new Error("Meal not found");
  }

  if (meal.providerId !== provider.id) {
    throw new Error("You are not allowed to update this meal");
  }

  //  If categoryId is changing → validate category
  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!category) {
      throw new Error("Invalid category ID");
    }
  }

  // Update
  const updatedMeal = await prisma.meal.update({
    where: { id: mealId },
    data: payload,
  });

  return updatedMeal;
};

const getAllMenuItems = async (query: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationSortingHelper(query);

  const { search, categoryId, minPrice = 0, maxPrice = 100000 } = query;

  const andConditions: any[] = [];

  // Searching (name + description)
  if (search) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  //  Filter by category
  if (categoryId) {
    andConditions.push({
      categoryId,
    });
  }

  // Filter by price
  if (minPrice && maxPrice) {
    andConditions.push({
      price: {
        gte: Number(minPrice),
        lte: Number(maxPrice),
      },
    });
  }

  andConditions.push({
    isAvailable: true, //menu item must be available
    provider: {
      isOpen: true,
    },
  });

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 📦 Get paginated data
  const meals = await prisma.meal.findMany({
    where: whereConditions,
    include: {
      category: {
        select: {
          name: true,
        },
      },
      provider: {
        select: {
          restaurantName: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.meal.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: meals.map((meal) => ({
      ...meal,
      restaurantName: meal.provider.restaurantName,
      categoryName: meal.category.name,
      category: undefined,
      provider: undefined,
    })),
  };
};

const getMenuByProvider = async (userId: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!provider) {
    throw new Error("Provider not found");
  }
  const providerId = provider.id;

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
          providerId: providerId,
          isAvailable: true,
        },

        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!providerWithMenu) {
    throw new Error("Provider not found");
  }

  return {
    menu: providerWithMenu.meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      description: meal.description,
      price: Number(meal.price),
      categoryId: meal.category.id,
      categoryName: meal.category.name,
      imageUrl: meal.imageUrl,
      isAvailable: meal.isAvailable,
      isDeleted: meal.isDeleted,
      createdAt: meal.createdAt,
    })),
  };
};

const getMenuItemById = async (id: string) => {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      provider: {
        select: {
          restaurantName: true,
        },
      },
      reviews: {
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          orderItems: true, //count how many time ordered
        },
      },
    },
  });

  if (!meal) {
    throw new Error("Meal not found");
  }

  return {
    id: meal.id,
    name: meal.name,
    description: meal.description,
    price: meal.price,
    imageUrl: meal.imageUrl,
    isAvailable: meal.isAvailable,
    categoryName: meal.category.name,
    providerId: meal.providerId,
    providerName: meal.provider.restaurantName,

    reviews: meal.reviews.map((review) => ({
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      userName: review.user.name,
      userImage: review.user.image,
    })),
    totalOrders: meal._count.orderItems,
  };
};

export const menuService = {
  addMenuItem,
  updateMenuItem,
  getAllMenuItems,
  getMenuItemById,
  getMenuByProvider,
};
