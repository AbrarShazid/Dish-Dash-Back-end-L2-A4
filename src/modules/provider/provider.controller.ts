import { Request, Response } from "express";
import { providerService } from "./provider.service";

const getAllProviders = async (req: Request, res: Response) => {
  try {
    const result = await providerService.getAllProviders();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed",
    });
  }
};

const getMenuByProvider = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    const result = await providerService.getMenuByProvider(
      providerId as string,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed",
    });
  }
};

// become provider from customer
const becomeProvider = async (req: Request, res: Response) => {
  try {
    const result = await providerService.becomeProvider(
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

//update provider profile (restaurant name, description, image etc)

const updateProviderProfile = async (req: Request, res: Response) => {
  try {
    const result = await providerService.updateProviderProfile(
      req.user?.id as string,
      req.body,
      // req.file
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

const toggleOpen = async (req: Request, res: Response) => {
  const { isOpen } = req.body;

  try {
    const result = await providerService.toggleOpen(
      req.user?.id as string,
      isOpen as boolean,
    );

    res.status(200).json({
      success: true,
      message: `Restaurant is now ${isOpen ? "open" : "closed"}`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed, something went wrong!",
    });
  }
};

export const providerController = {
  getAllProviders,
  getMenuByProvider,
  becomeProvider,
  updateProviderProfile,
  toggleOpen,
};
