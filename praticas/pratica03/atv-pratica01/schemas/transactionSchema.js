const { z } = require('zod');

const createTransactionSchema = z.object({
  description: z.string().min(1),
  value: z.number().positive(),
  date: z.coerce.date(),
  categoryId: z.string().min(1),
});

const updateTransactionSchema = createTransactionSchema.partial();

module.exports = { createTransactionSchema, updateTransactionSchema };
