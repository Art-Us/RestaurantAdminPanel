import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { io } from "../server.js";

export const getTodayOrders = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // if (!user.isAdmin) {
    //   return res.json({ success: false, message: "Access denied" });
    // }


    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = startOfDay.getTime();
    const endTimestamp = endOfDay.getTime();

    const orders = await orderModel.find({
      createdAt: { $gte: startTimestamp, $lte: endTimestamp }
    });

    res.json({
      success: true,
      receivedOrders: orders.map(order => ({
        id: order._id,
        orders: order.orders.map(item => ({
          image: item.image,
          title: item.title,
          description: item.description,
          weight: item.weight,
          price: item.price,
          quantity: item.quantity,
          type: item.type,
        })),
        customer: {
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          phone: order.user.phone,
          email: order.user.email,
          street: order.user.street,
          house: order.user.house,
          apartment: order.user.apartment,
          entrance: order.user.entrance,
          floor: order.user.floor,
          comment: order.user.comment,
          numberOfPersons: order.user.numberOfPersons,
          paymentMethod: order.user.paymentMethod
        },
        createdAt: order.createdAt,
        isCompleted: order.isCompleted,
      })),
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const createOrder = async (req, res) => {
  try {
    const { combinedData } = req.body;

    if (!combinedData) {
      return res.json({ success: false, message: "Missing combinedData" });
    }
    if (!combinedData.orders) {
      return res.json({ success: false, message: "Missing order" });
    }
    if (!combinedData.user) {
      return res.json({ success: false, message: "Missing user data" });
    }

    const order = new orderModel({
      orders: combinedData.orders,
      user: combinedData.user,
      createdAt: Date.now()
    });

    await order.save();
    io.emit("new-order", order);

    return res.json({
      success: true,
      message: "Order created successfully"
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const completeOrderById = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId } = req.body;

        if (!userId || !orderId) {
            return res.json({ success: false, message: "Missing userId or orderId" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // if (!admin.isAdmin) {
        //     return res.json({ success: false, message: "Access denied. Admin only." });
        // }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Feedback not found" });
        }

        if (order.isCompleted) {
            order.isCompleted = false;
            await order.save();
            return res.json({ success: true, message: "Order not completed now" });
        }
        else {
            order.isCompleted = true;
            await order.save();
            return res.json({ success: true, message: "Order is completed now" });
        }

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};