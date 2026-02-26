import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

interface BecomeProviderPayload {
  restaurantName: string;
  image?: string;
  description?: string;
}
interface UserPayload {
  name: string;
  image?: string;
}
const getAllUser = async () => {
  const result = await prisma.user.findMany();
  return result;
};

const getProfile = async (userId: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  return result;
};

//update user profile
const updateUserProfile = async (userId: string, payload: UserPayload) => {
  const updateData: UserPayload = {
    name: payload.name,
  };

  if (payload.image !== undefined && payload.image !== "") {
    updateData.image = payload.image;
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return result;
};

// ban/ unban
const updateUserStatus = async (id: string, status: UserStatus) => {
  const result = await prisma.user.update({
    where: { id },
    data: { status },
  });

  // If user is provider AND banned ,close restaurant
  if (result.role === Role.PROVIDER && status === UserStatus.SUSPEND) {
    await prisma.providerProfile.updateMany({
      where: { userId: id },
      data: { isOpen: false },
    });
  }

  // If provider is activated again reopen
  if (result.role === Role.PROVIDER && status === UserStatus.ACTIVATE) {
    await prisma.providerProfile.updateMany({
      where: { userId: id },
      data: { isOpen: true }, // optional decision
    });
  }

  // delete all sessions for this user
  await prisma.session.deleteMany({
    where: { userId: id },
  });
  return result;
};

// become provide from customer
const becomeProvider = async (
  userId: string,
  payload: BecomeProviderPayload,
) => {
  return await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { role: "PROVIDER" },
    });

    const providerProfile = await tx.providerProfile.create({
      data: {
        userId,
        restaurantName: payload.restaurantName,
        description: payload.description ?? null,
        imageUrl:payload.image??null
      },
    });

    return {
      succes: true,
      providerProfile,
    };
  });
};
//update provider profile (restaurant name, description, image etc)
const updateProviderProfile = async (
  userId: string,
  payload: BecomeProviderPayload,
  // file: Express.Multer.File
) => {
  return await prisma.$transaction(async (tx) => {
    // const uploadResult: any = await uploadToCloudinary(file.buffer);

    // const imageUrl = uploadResult.secure_url;

    const providerProfile = await tx.providerProfile.update({
      where: { userId },
      data: {
        restaurantName: payload.restaurantName,
        description: payload.description ?? null,
        // imageUrl,
      },
    });

    return {
      succes: true,
      providerProfile,
    };
  });
};

const toggleOpen = async (userId: string, isOpen: boolean) => {
  const provider = await prisma.providerProfile.update({
    where: { userId },
    data: { isOpen },
  });

  return provider;
};

export const userService = {
  getAllUser,
  getProfile,
  updateUserProfile,
  updateUserStatus,
  becomeProvider,
  updateProviderProfile,
  toggleOpen,
};
