import mongoose, {Schema} from "mongoose";


const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,    // one who is subscribing.
        ref: "User"
    }, 
    Channel: {
        type: Schema.Types.ObjectId,    // one to whom 'subscriber' is Subscribing.
        ref: "User"
    }
}); 


export const Subscription =  mongoose.model("Subscription", subscriptionSchema)