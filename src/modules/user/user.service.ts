import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

interface UserPayload {
  name: string;
  image?: string;
}
const getAllUser = async () => {
  const result = await prisma.user.findMany({
  orderBy: {
    createdAt: 'desc', 
  },
});
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

export const userService = {
  getAllUser,
  getProfile,
  updateUserProfile,
  updateUserStatus,
};
