// import fs from "fs";
// import cosineSimilarity from "cosine-similarity";
// import Fuse from "fuse.js"; // Fuzzy search library
// import path from "node:path";
//
// export default function predictMealService(mealName) {
//   // Load the model
//   // let usersPath = path.join(process.cwd(), 'users.json');
//   let modelPath = path.join(process.cwd(), "recommendation_model.json");
//   const modelData = JSON.parse(fs.readFileSync(modelPath, "utf8"));
//   const { data, vectors, vocabulary } = modelData;
//
//   // Preprocess vocabulary to extract unique words
//   const uniqueWords = Array.from(
//     new Set(
//       data
//         .flatMap((item) => item["Food Product"].toLowerCase().split(/\W+/)) // Split product names into words
//         .filter((word) => word.length > 2), // Filter short or irrelevant words
//     ),
//   );
//
//   // Fuzzy matching for single words
//   function findClosestWord(input, wordList) {
//     const fuse = new Fuse(wordList, { threshold: 0.4 });
//     const result = fuse.search(input);
//     return result.length > 0 ? result[0].item : input; // Return best match or input
//   }
//
//   // Compute TF-IDF vector
//   function computeTFIDFVector(input, vocabulary) {
//     const words = input.split(" ");
//     const vector = new Array(Object.keys(vocabulary).length).fill(0);
//     words.forEach((word) => {
//       if (vocabulary[word]) {
//         vector[vocabulary[word]] += 1; // Count word frequency
//       }
//     });
//     return vector;
//   }
//
//   // Recommendation function
//   function recommend(foodName, topN = 8) {
//     // Find the closest single word using fuzzy matching
//     const closestWord = findClosestWord(foodName.toLowerCase(), uniqueWords);
//
//     // Compute TF-IDF vector for the matched word
//     const foodVector = computeTFIDFVector(
//       closestWord.toLowerCase(),
//       vocabulary,
//     );
//     const similarities = vectors.map((vector) =>
//       cosineSimilarity(foodVector, vector),
//     );
//
//     // Sort by similarity score
//     const similarFoods = similarities
//       .map((score, index) => ({ index, score }))
//       .sort((a, b) => b.score - a.score);
//
//     return similarFoods
//       .slice(0, topN)
//       .map((item) => data[item.index]["Food Product"]);
//   }
//   return recommend(mealName, 5);
// }
