import Review from "../../../DB/Models/review.model.js";
import Reservation from "../../../DB/Models/reservation.model.js";
import Restaurant from "../../../DB/Models/restaurant.model.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { flagReview } from "../../Services/flag-review-service.js";
import mongoose from "mongoose";

/**
 * @api {POST} /reviews/create Create a new review
 */
export const createReview = async (req, res, next) => {
  const { reservationId, comment, rate } = req.body;

  if (!reservationId || !rate) {
    return next(new ErrorClass("Reservation ID and rate are required", 400));
  }

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    return next(new ErrorClass("Reservation not found", 404));
  }

  if (reservation.userId.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized to review this reservation", 403));
  }

  if (reservation.status !== "completed") {
    return next(
      new ErrorClass("Cannot review a reservation that is not completed", 400),
    );
  }

  const existingReview = await Review.findOne({ reservationId });
  if (existingReview) {
    return next(
      new ErrorClass("You have already reviewed this reservation", 400),
    );
  }

  const restaurantId = reservation.restaurantId;

  const review = new Review({
    userId: req.authUser._id,
    reservationId,
    restaurantId,
    comment,
    rate,
  });

  const newReview = await review.save();

  // Update the avgRating in the Restaurant model
  const allReviews = await Review.find({ restaurantId });
  const totalRating = allReviews.reduce((sum, r) => sum + r.rate, rate);
  const avgRating = totalRating / (allReviews.length + 1);

  await Restaurant.findByIdAndUpdate(
    restaurantId,
    { avgRating },
    { new: true },
  );

  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    review: newReview,
  });

  // Flag the review as negative or positive
  flagReview(comment, newReview._id);
};
/**
 * @api {PUT} /reviews/update/:id Update an existing review
 */
export const updateReview = async (req, res, next) => {
  const { id } = req.params;
  const { comment, rate } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    return next(new ErrorClass("Review not found", 404));
  }

  if (review.userId.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized to update this review", 403));
  }

  if (comment) review.comment = comment.trim();
  if (rate) {
    if (rate < 1 || rate > 5) {
      return next(new ErrorClass("Rate must be between 1 and 5", 400));
    }
    review.rate = rate;
  }

  const updatedReview = await review.save();

  // Update the avgRating in the Restaurant model
  const allReviews = await Review.find({ restaurantId: review.restaurantId });
  const totalRating = allReviews.reduce((sum, r) => sum + r.rate, 0);
  const avgRating = totalRating / allReviews.length;

  await Restaurant.findByIdAndUpdate(
    review.restaurantId,
    { avgRating },
    { new: true },
  );

  res.status(200).json({
    status: "success",
    message: "Review updated successfully",
    review: updatedReview,
  });
};

/**
 * @api {DELETE} /reviews/delete/:id Delete a review
 */
export const deleteReview = async (req, res, next) => {
  const { id } = req.params;

  // Find the review first to check ownership
  const review = await Review.findById(id);

  if (!review) {
    return next(
      new ErrorClass(
        "Review not found",
        404,
        "The requested review does not exist",
      ),
    );
  }

  if (review.userId.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "Unauthorized",
        403,
        "You can only delete your own reviews",
      ),
    );
  }

  await Review.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "Review deleted successfully",
  });
};
//
/**
 * @api {GET} /reviews/restaurant/:restaurantId Get all reviews for a specific restaurant
 * @apiQuery {Number} page Page number (default: 1)
 * @apiQuery {Number} limit Number of reviews per page (default: 10)
 */
export const getAllReviewsForRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Correctly create ObjectId using new
    const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);

    const totalReviews = await Review.countDocuments({
      restaurantId: restaurantObjectId,
    });
    const reviews = await Review.find({ restaurantId: restaurantObjectId })
      .populate("userId", "name email")
      .populate("reservationId", "date time status")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const avgRating =
      await Restaurant.findById(restaurantObjectId).select("avgRating");

    const ratings = await Review.aggregate([
      {
        $match: {
          restaurantId: restaurantObjectId,
        },
      },
      {
        $group: {
          _id: "$rate",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    if (!reviews || reviews.length === 0) {
      return next(new ErrorClass("No reviews found for this restaurant", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Reviews fetched successfully",
      data: reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        limit,
      },
      avgRating: avgRating.avgRating,
      ratings,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorClass("Error fetching reviews", 500));
  }
};
