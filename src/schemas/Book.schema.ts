import { z } from "zod";

export const editionZodSchema = z.object({
    condition: z.enum(['New', 'Used']),
    price: z.number().positive(),
    stockCount: z.number().int().nonnegative(),
});

export const bookZodSchema = z.object({
    image: z.string().min(1),
    title: z.string().min(1),
    author: z.string().min(1),
    location: z.string().min(1),
    editions: z.array(editionZodSchema)
        .min(1, "Book must have at least one edition")
});
