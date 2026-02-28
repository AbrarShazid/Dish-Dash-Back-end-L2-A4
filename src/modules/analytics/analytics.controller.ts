import { Request, Response } from "express";
import { analyticsService } from "./analytics.service";

const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    const result = await analyticsService.getAdminAnalytics();

    res.status(200).json({
      success: true,
      data: result,
      message: "Data fetched successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to get analytics",
    });
  }
};

export const analyticsController = {
  getAdminAnalytics,
};
