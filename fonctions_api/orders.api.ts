import api from "@/lib/axios";

export const getOrders = async () => {
  try {
    const response = await api.get("/api/v1/orders/");
    return response.data;
  } catch (error) {
    throw error;
  }
};
