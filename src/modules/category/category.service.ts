import { prisma } from "../../lib/prisma";

const addCategory = async (name: string) => {
  const res = await prisma.category.create({
    data: { name: name },
  });

  return res;
};

const getAllCategory = async () => {
  const res = await prisma.category.findMany();
  return res;
};
const deleteCategory = async (id: string) => {
  const mealsCount = await prisma.meal.count({
    where: { categoryId: id },
  });

  if (mealsCount > 0) {
    throw new Error("Category is in use and cannot be deleted.");
  }
  const res = await prisma.category.delete({
    where: { id },
  });
  return res;
};

export const categoryService = {
  addCategory,
  getAllCategory,
  deleteCategory,
};
