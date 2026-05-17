// import { Schema, model } from "mongoose";

//   const sheetOrderSchema = new Schema(
//     {
//       name: { type: String, required: true },
//       phone: { type: String, required: true },
//       address: { type: String, required: true },
//       department: { type: String },
//       year: { type: String },
//       semester: { type: String },
//       lectureSheets: [
//         {
//           name: { type: String, required: true },
//         },
//       ],
//       pdfFiles: [
//         {
//           url:       { type: String, required: true },
//           printType: { type: String, required: true },
//           copies:    { type: Number, min: 1, required: true },
//         },
//       ],
//     },
//     { timestamps: true }
//   );
  
// export const SheetOrder = model("SheetOrder", sheetOrderSchema);
  

  // models/PhotocopyOrder.model.ts
import { Schema, model } from "mongoose";

const sheetOrderSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    department: { type: String },
    year: { type: String },
    semester: { type: String },
    lectureSheets: [
      {
        name: { type: String, required: true },
      },
    ],
    pdfFiles: [
      {
        url:       { type: String, required: true },
        public_id: { type: String, required: true },    // ← add this
        printType: { type: String, required: true },
        copies:    { type: Number, min: 1, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const SheetOrder = model("SheetOrder", sheetOrderSchema);
