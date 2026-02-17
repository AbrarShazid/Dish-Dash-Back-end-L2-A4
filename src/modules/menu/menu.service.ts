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

  const { search, categoryId, minPrice, maxPrice } = query;

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
      categoryName: meal.category.name,
      category: undefined,
    })),
  };
};

// const getMenuItemById = async (id: string) => {
//   const meal = await prisma.meal.findUnique({
//     where: { id },
//     include: {
//       category: {
//         select: {
//           name: true,
//         },
//       },
//       provider: {
//         select: {
//           restaurantName: true,
//         },
//       },
//     },
//   });

//   if (!meal) {
//     throw new Error("Meal not found");
//   }

//   return {
//     id: meal.id,
//     name: meal.name,
//     description: meal.description,
//     price: meal.price,
//     imageUrl: meal.imageUrl,
//     isAvailable: meal.isAvailable,
//     categoryName: meal.category.name,
//     providerName: meal.provider.restaurantName,
//   };
// };

export const menuService = {
  addMenuItem,
  updateMenuItem,
  getAllMenuItems,
  // getMenuItemById,
};
