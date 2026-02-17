import { Request, Response } from "express";
import { reviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { mealId, rating, comment } = req.body;
    const result = await reviewService.createReview(
      userId,
      mealId,
      rating,
      comment,
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed",
    });
  }
};

export const reviewController = {
  createReview,
};
