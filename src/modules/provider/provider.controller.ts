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


export const providerController = {
  getAllProviders,
  getMenuByProvider,
};
