import { Request, Response } from "express";
import { menuService } from "./menu.service";

const addMenuItem = async (req: Request, res: Response) => {
  try {
    const result = await menuService.addMenuItem(
      req.user?.id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: result,
      message: "Menu item added successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed",
    });
  }
};





export const menuController = {
  addMenuItem,
  // updateMenuItem,
  // getAllMenuItems,
  // getMenuItemById,
};
