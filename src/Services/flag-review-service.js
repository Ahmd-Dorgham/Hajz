// import axios from "axios";
// import Review from "../../DB/Models/review.model.js";
//
// /**
//  *
//  * @param {string} review - The review text.
//  * @param {string} id - The ID of the review.
//  * @returns {Promise<{status: string}>} - An object containing the sentiment status ('negative' or 'positive').
//  * @throws {Error} - Throws an error if the process fails.
//  */
// export async function flagReview(review, id) {
//   if (!review || !id) {
//     throw new Error("Review and ID are required");
//   }
//
//   const AI_URL = process.env.AI_URL;
//   // Function to detect if the review is in Arabic or English
//   const detectLanguage = (text) => {
//     const arabicRegex = /[\u0600-\u06FF]/;
//     return arabicRegex.test(text) ? "arabic" : "english";
//   };
//
//   // Detect the language
//   const language = detectLanguage(review);
//
//   // Define the Flask API endpoint based on the language
//   const flaskUrl =
//     language === "english"
//       ? `${AI_URL}/predict/english?review=${encodeURIComponent(review)}`
//       : `${AI_URL}/predict/arabic?review=${encodeURIComponent(review)}`;
//
//   try {
//     // Call the Flask prediction API
//     const response = await axios.post(
//       flaskUrl,
//       {},
//       {
//         headers: {
//           Authorization: process.env.AI_API_KEY,
//         },
//       },
//     );
//
//     // Validate the response from the Flask service
//     const prediction = response.data.prediction;
//     if (prediction !== "negative" && prediction !== "positive") {
//       throw new Error("Invalid prediction response from Flask service");
//     }
//
//     const review = await Review.findById(id);
//     if (!review) {
//       return;
//     }
//
//     review.isNegative = prediction === "negative";
//
//     await review.save();
//   } catch (error) {
//     console.error("Error in processReview:", error.message);
//   }
// }
