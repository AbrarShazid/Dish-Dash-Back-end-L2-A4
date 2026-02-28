import { Request, Response } from "express";
import { categoryService } from "./category.service";

const addCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const convert = name.trim().toLowerCase();
    if (!convert) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const result = await categoryService.addCategory(convert);
    res.status(200).json({
      success: true,
      data: result,
      message: "Category added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add category",
    });
  }
};

const getAllCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getAllCategory();
    res.status(200).json({
      success: true,
      data: result,
      message: "Category fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    const result = await categoryService.deleteCategory(categoryId as string);

    return res.status(200).json({
      success: true,
      data: result,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    return res.status(409).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};

export const categoryController = {
  addCategory,
  getAllCategory,
  deleteCategory,
};
