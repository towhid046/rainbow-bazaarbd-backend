// import B2 from "backblaze-b2";

// const b2 = new B2({
//   applicationKeyId: process.env.B2_KEY_ID!,
//   applicationKey: process.env.B2_APP_KEY!, 
// });

// // Initialize and authorize
// let authorized = false;

// export const initializeB2 = async () => {
//   if (!authorized) {
//     await b2.authorize();
//     authorized = true;
//   }
//   return b2;
// };

// export const bucketName = process.env.B2_BUCKET_NAME!;
// export const bucketId = process.env.B2_BUCKET_ID!; // Get this from B2 dashboard