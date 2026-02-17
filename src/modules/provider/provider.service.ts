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

const getMenuByProvider = async (providerId: string) => {
 const providerWithMenu = await prisma.providerProfile.findUnique({
   where: { id: providerId, isOpen: true },
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


 if (!providerWithMenu) {
   throw new Error("Provider not found");
 }


 return {
   providerId: providerWithMenu.id,
   restaurantName: providerWithMenu.restaurantName,
   description: providerWithMenu.description,
   image: providerWithMenu.imageUrl,
   isOpen: providerWithMenu.isOpen,
   createdAt: providerWithMenu.createdAt,
   restauranOwner: providerWithMenu.user.name,
   menu: providerWithMenu.meals.map((meal) => ({
     mealId: meal.id,
     name: meal.name,
     description: meal.description,
     price: meal.price,
     image: meal.imageUrl,
     category: meal.category.name,
   })),
 };
};


export const providerService = {
  getAllProviders,
  getMenuByProvider,
};
