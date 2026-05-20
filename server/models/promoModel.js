import mongoose from "mongoose";

const promoSchema = new mongoose.Schema({
    promoCode: {type: String, required: true},
    promoCodeExpireAt: {type: Number, default: 0, required: true},
    promoCodeCreatedAt: {type: Number, default: 0},
});

const promoModel = mongoose.models.promocode || mongoose.model("promocode", promoSchema);

export default promoModel;