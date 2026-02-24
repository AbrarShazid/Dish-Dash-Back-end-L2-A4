import { OrderStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
interface OrderItemPayload {
  mealId: string;
  quantity: number;
}
interface CreateOrderPayload {
  deliveryAddress: string;
  providerId: string;
  items: OrderItemPayload[];
}
const createOrder = async (customerId: string, payload: CreateOrderPayload) => {
  const { providerId, deliveryAddress, items } = payload;
  if (!deliveryAddress) {
    throw new Error("Delivery address required");
  }
  if (!items.length) throw new Error("Empty order");
  items.forEach((item) => {
    if (item.quantity <= 0) {
      throw new Error("Invalid quantity");
    }
  });

  // Get meals only from that provider

  const mealIds = items.map((i) => i.mealId);

  const meals = await prisma.meal.findMany({
    where: {
      id: { in: mealIds },
      providerId: providerId,
      isAvailable: true,
      provider: { isOpen: true },
    },
  });

  if (meals.length !== items.length) {
    throw new Error("Invalid meals for this provider");
  }

  const mealMap = new Map(meals.map((m) => [m.id, m]));

  const totalAmount = items.reduce((sum, item) => {
    const meal = mealMap.get(item.mealId)!;
    return sum + Number(meal.price) * item.quantity;
  }, 0);
  const order = await prisma.order.create({
    data: {
      customerId,
      providerId,
      deliveryAddress,
      totalAmount,
      items: {
        create: items.map((item) => {
          const meal = mealMap.get(item.mealId)!;
          return {
            mealName: meal.name,
            mealId: meal.id,
            quantity: item.quantity,
            price: meal.price,
          };
        }),
      },
    },
    include: { items: true },
  });

  return order;
};

const updateOrderStatus = async (
  userId: string,
  userRole: string,
  orderId: string,
  newStatus: OrderStatus,
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      provider: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const currentStatus = order.status;
  let allowed = false;

  //  If already finished → block everything
  if (
    currentStatus === OrderStatus.DELIVERED ||
    currentStatus === OrderStatus.CANCELLED
  ) {
    throw new Error("Order already completed");
  }

  // CUSTOMER RULES
  if (userRole === Role.CUSTOMER) {
    if (
      currentStatus === OrderStatus.PLACED &&
      newStatus === OrderStatus.CANCELLED &&
      order.customerId === userId
    ) {
      allowed = true;
    } else {
      throw new Error("Customer cannot perform this action");
    }
  }

  //  PROVIDER RULES

  if (userRole === Role.PROVIDER) {
    if (order.provider.userId !== userId) {
      throw new Error("Not your order");
    }

    if (
      currentStatus === OrderStatus.PLACED &&
      (newStatus === OrderStatus.PREPARING ||
        newStatus === OrderStatus.CANCELLED)
    ) {
      allowed = true;
    } else if (
      currentStatus === OrderStatus.PREPARING &&
      newStatus === OrderStatus.READY
    ) {
      allowed = true;
    } else if (
      currentStatus === OrderStatus.READY &&
      newStatus === OrderStatus.DELIVERED
    ) {
      allowed = true;
    } else {
      throw new Error("Invalid status change");
    }
  }
  if (!allowed) throw new Error("Status update not allowed");

  return prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
};

const getMyOrders = async (customerId: string) => {
  const result = await prisma.order.findMany({
    where: { customerId },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      deliveryAddress: true,
      createdAt: true,
      updatedAt: true,
      provider: {
        select: { restaurantName: true },
      },
      items: {
        select: {
          mealName: true,
          mealId: true,
          quantity: true,
          price: true,
        },
      },
    },
  });

  
  return result.map((singleOrder) => ({
    orderId: singleOrder.id,
    
    status: singleOrder.status,
    totalAmount: singleOrder.totalAmount,
    deliveryAddress: singleOrder.deliveryAddress,
    createdAt: singleOrder.createdAt,
    updatedAt: singleOrder.updatedAt,
    restaurantName: singleOrder.provider.restaurantName,
    items: singleOrder.items,
  }));
};

const getProviderOrders = async (userId: string) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!providerProfile) {
    throw new Error("Provider profile not found");
  }

  const providerId = providerProfile.id;

  const result = await prisma.order.findMany({
    where: { providerId },
    include: {
      customer: {
        select: {
          name: true,
        },
      },
    },
  });

  return result.map((singleOrder) => ({
    orderId: singleOrder.id,
    status: singleOrder.status,
    totalAmount: singleOrder.totalAmount,
    deliveryAddress: singleOrder.deliveryAddress,
    createdAt: singleOrder.createdAt,
    updatedAt: singleOrder.updatedAt,
    customerName: singleOrder.customer.name,
  }));
};

const getAllOrder = async () => {
  const result = await prisma.order.findMany({
    include: {
      customer: {
        select: {
          name: true,
        },
      },
      provider: {
        select: {
          restaurantName: true,
        },
      },
    },
  });

  return result.map((result) => ({
    orderId: result.id,
    orderStatus: result.status,
    orderAmount: result.totalAmount,
    orderDeliveryAddress: result.deliveryAddress,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    customerName: result.customer.name,
    restaurantName: result.provider.restaurantName,

    customerId: result.customerId,
    providerId: result.providerId,
  }));
};

const getOrderById = async (
  userId: string,
  userRole: string,
  orderId: string,
) => {
  const result = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          mealId:true,
          mealName: true,
          quantity: true,
          price: true,
        },
      },
      provider: {
        select: {
          userId: true,
          restaurantName: true,
        },
      },
      customer: {
        select: { name: true },
      },
    },
  });

  if (!result) {
    throw new Error("No data found on this order id");
  }
  if (userRole === Role.CUSTOMER) {
    if (userId !== result.customerId) {
      throw new Error("Unauthorized");
    }
  } else if (userRole === Role.PROVIDER) {
    if (userId !== result.provider.userId) {
      throw new Error("Unauthorized");
    }
  }

  return {
    orderId: result.id,
    orderStatus: result.status,
    orderAmount: result.totalAmount,
    orderDeliveryAddress: result.deliveryAddress,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    restaurantName: result.provider.restaurantName,
    customerName: result.customer.name,
    items: result.items,
  };
};

export const orderService = {
  createOrder,
  updateOrderStatus,
  getMyOrders,
  getProviderOrders,
  getAllOrder,
  getOrderById,
};
