const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().min(2),
  displayName: z.string().min(2),
  icon: z.string().min(1),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor hex inválida'),
  isIncome: z.boolean().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

module.exports = { createCategorySchema, updateCategorySchema };
