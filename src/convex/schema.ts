import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      phone: v.optional(v.string()),
      dateOfBirth: v.optional(v.string()),
      notes: v.optional(v.string()),
    }).index("email", ["email"]),

    // ─── Procedures (CMS-managed) ───
    procedures: defineTable({
      slug: v.string(),
      titleAr: v.string(),
      titleEn: v.string(),
      descriptionAr: v.string(),
      descriptionEn: v.string(),
      longDescriptionAr: v.string(),
      longDescriptionEn: v.string(),
      icon: v.string(),
      category: v.string(),
      duration: v.string(),
      recovery: v.string(),
      price: v.optional(v.string()),
      image: v.optional(v.string()),
      gallery: v.optional(v.array(v.string())),
      beforeImage: v.optional(v.string()),
      afterImage: v.optional(v.string()),
      seoTitleAr: v.optional(v.string()),
      seoTitleEn: v.optional(v.string()),
      seoDescriptionAr: v.optional(v.string()),
      seoDescriptionEn: v.optional(v.string()),
      ogImage: v.optional(v.string()),
      isActive: v.boolean(),
      isFeatured: v.optional(v.boolean()),
      order: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_category", ["category"])
      .index("by_order", ["order"]),

    // ─── Before & After Cases ───
    beforeAfter: defineTable({
      titleAr: v.string(),
      titleEn: v.string(),
      procedureType: v.string(),
      beforeImage: v.string(),
      afterImage: v.string(),
      descriptionAr: v.optional(v.string()),
      descriptionEn: v.optional(v.string()),
      patientAge: v.optional(v.number()),
      isActive: v.boolean(),
      order: v.number(),
    })
      .index("by_procedure", ["procedureType"])
      .index("by_order", ["order"]),

    // ─── Testimonials ───
    testimonials: defineTable({
      nameAr: v.string(),
      nameEn: v.string(),
      textAr: v.string(),
      textEn: v.string(),
      rating: v.number(),
      procedureType: v.optional(v.string()),
      avatar: v.optional(v.string()),
      isActive: v.boolean(),
      order: v.number(),
    }).index("by_order", ["order"]),

    // ─── FAQ ───
    faq: defineTable({
      questionAr: v.string(),
      questionEn: v.string(),
      answerAr: v.string(),
      answerEn: v.string(),
      category: v.optional(v.string()),
      isActive: v.boolean(),
      order: v.number(),
    })
      .index("by_order", ["order"])
      .index("by_category", ["category"]),    // ─── Media Library ───
    media: defineTable({
      storageId: v.string(),
      url: v.string(),
      name: v.string(),
      type: v.string(),
      size: v.number(),
      uploadedBy: v.optional(v.string()),
    }).index("by_storageId", ["storageId"]),

    // ─── Site Settings (CMS) ───
    siteSettings: defineTable({
      key: v.string(),
      value: v.any(),
    }).index("by_key", ["key"]),

  },
  {
    schemaValidation: false,
  },
);

export default schema;
