import { Request, Response } from "express";
import { userService } from "./user.service";
// get all user (admin)
const getAllUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUser();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      error: "User can't be fetched!",
      details: error || "Something went wrong",
    });
  }
};
// get profile
const getProfile = async (req: Request, res: Response) => {
  try {
    const result = await userService.getProfile(req.user?.id as string);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
};
//update user profile

const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const result = await userService.updateUserProfile(
      req.user?.id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error || "Failed, something went wrong!",
    });
  }
};

// update status (ban/unban)
const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await userService.updateUserStatus(id as string, status);

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed, something went wrong!",
    });
  }
};

export const userController = {
  getAllUser,
  getProfile,
  updateUserProfile,
  updateUserStatus,
};
