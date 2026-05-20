 import mongoose from "mongoose";

 const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true // Remove whitespace from both ends
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['rolls', 'sushi', 'pizza', 'soups', 'bouly', 'fishburger', 'fri', 'combo']
    },
    image: {
        type: String, // Store the image URL or path
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    priority: {
        type: Number,
        default: 0,
        required: true,
        min: 0,
        description: 'Чим більше — тим вище у списку'
    }
})

const dishModel = mongoose.models.Dish || mongoose.model('Dish', dishSchema);

export default dishModel;