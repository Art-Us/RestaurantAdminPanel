import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  image: {type: String, default: ""},
  title: {type: String, default: ""},
  description: {type: String, default: ""},
  weight: {type: Number, default: 0},
  price: {type: Number, default: 0},
  quantity: {type: Number, default: 0},
  type: {type: String, default: ""},
});

const userSchema = new mongoose.Schema({
  firstName: {type: String, default: ""},
  lastName: {type: String, default: ""},
  phone: {type: String, default: ""},
  email: {type: String, default: ""},
  street: {type: String, default: ""},
  house: {type: String, default: ""},
  apartment: {type: String, default: ""},
  entrance: {type: String, default: ""},
  floor: {type: String, default: ""},
  comment: {type: String, default: ""},
  numberOfPersons: {type: String, default: ""},
  paymentMethod: {type: String, default: ""}


});

const orderSchema = new mongoose.Schema({
  orders: [itemSchema],
  user: userSchema,
  createdAt: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
});
const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;