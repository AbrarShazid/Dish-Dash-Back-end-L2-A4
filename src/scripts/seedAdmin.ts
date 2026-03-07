import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/authMiddleware";

const APP_URL = process.env.APP_URL;
const BACKEND_URL = process.env.BACKEND_URL;

async function seedAdmin() {
  try {
    const adminData = {
      name: process.env.ADMIN_NAME!,
      email: process.env.ADMIN_EMAIL!,
      password: process.env.ADMIN_PASSWORD!,
      role: UserRole.ADMIN,
    };

    //check user exist on db or not

    const existinguser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existinguser) {
      console.log("Admin already exists");
      return;
    }
    const signUpAdmin = await fetch(`${BACKEND_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // origin: "http://localhost:3000",
        origin: `${APP_URL}`,
      },
      body: JSON.stringify(adminData),
    });

    if (signUpAdmin.ok) {
      const updateVerified = await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
}

seedAdmin();
