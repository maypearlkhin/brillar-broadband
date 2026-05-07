import Plan from "../../models/planModel.js";
import PlanCategory from "../../models/planCategoryModel.js";

function slugifyCategoryId(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function cleanTitle(value) {
  return String(value).replace(/Â·/g, "·").trim();
}

function serializeCategoryDoc(category) {
  return {
    id: category.id,
    title: cleanTitle(category.title),
    sortOrder: category.sortOrder,
    isActive: category.isActive
  };
}

async function nextSortOrder() {
  const lastCategory = await PlanCategory.findOne().sort({ sortOrder: -1 }).lean();
  return lastCategory ? Number(lastCategory.sortOrder ?? 0) + 1 : 0;
}

export async function listCategories(_req, res) {
  const categories = await PlanCategory.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  return res.json({ categories: categories.map(serializeCategoryDoc) });
}

export async function createCategory(req, res) {
  const title = cleanTitle(req.body.title ?? "");

  if (!title) {
    return res.status(400).json({ message: "Category title is required." });
  }

  const baseId = slugifyCategoryId(req.body.id || title) || `category_${Date.now()}`;
  let id = baseId;
  let suffix = 1;

  while (await PlanCategory.exists({ id })) {
    suffix += 1;
    id = `${baseId}_${suffix}`;
  }

  const category = await PlanCategory.create({
    id,
    title,
    sortOrder: await nextSortOrder(),
    isActive: true
  });

  return res.status(201).json({ category: serializeCategoryDoc(category) });
}

export async function updateCategory(req, res) {
  const category = await PlanCategory.findOne({ id: req.params.categoryId });

  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  const previousActive = category.isActive;

  if (req.body.title !== undefined) {
    category.title = cleanTitle(req.body.title) || category.title;
  }

  if (req.body.isActive !== undefined) {
    category.isActive = Boolean(req.body.isActive);
  }

  await category.save();

  const planUpdate = {
    categoryTitle: category.title,
    categorySortOrder: category.sortOrder
  };

  /* Cascade isActive **both ways** when the flag actually changed:
     - deactivating a category → all its plans go inactive
     - reactivating a category → all its plans come back active */
  if (previousActive !== category.isActive) {
    planUpdate.isActive = category.isActive;
  }

  await Plan.updateMany({ categoryId: category.id }, { $set: planUpdate });

  return res.json({ category: serializeCategoryDoc(category) });
}

export async function deleteCategory(req, res) {
  const category = await PlanCategory.findOneAndUpdate(
    { id: req.params.categoryId },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  await Plan.updateMany({ categoryId: category.id }, { $set: { isActive: false } });

  return res.json({ message: "Category deactivated.", category: serializeCategoryDoc(category) });
}
