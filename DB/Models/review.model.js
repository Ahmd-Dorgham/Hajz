import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

reviewSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], async function (next) {
  try {
    const review = await Review.findOne(this.getQuery());
    if (!review) return next();

    const { restaurantId } = review;

    // Recalculate average rating after the review is deleted
    const allReviews = await Review.find({ restaurantId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rate, 0);
    const avgRating = allReviews.length ? totalRating / allReviews.length : 0;

    await mongoose.models.Restaurant.findByIdAndUpdate(restaurantId, { avgRating }, { new: true });

    next();
  } catch (error) {
    next(error);
  }
});

const Review = model("Review", reviewSchema);
export default mongoose.models.Review || Review;
