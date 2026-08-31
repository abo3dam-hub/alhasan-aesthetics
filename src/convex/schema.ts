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

    // ─── Procedures ───
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
      isActive: v.boolean(),
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
    })
      .index("by_order", ["order"]),

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
      .index("by_category", ["category"]),

    // ─── Bookings ───
    bookings: defineTable({
      userId: v.id("users"),
      patientName: v.string(),
      patientEmail: v.string(),
      patientPhone: v.string(),
      procedureType: v.string(),
      preferredDate: v.string(),
      preferredTime: v.string(),
      message: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("cancelled"),
        v.literal("completed"),
      ),
      notes: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"]),

    // ─── Consultation Requests ───
    consultations: defineTable({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      subject: v.string(),
      message: v.string(),
      userId: v.optional(v.id("users")),
      status: v.union(
        v.literal("new"),
        v.literal("read"),
        v.literal("replied"),
        v.literal("archived"),
      ),
      reply: v.optional(v.string()),
    })
      .index("by_status", ["status"])
      .index("by_user", ["userId"]),

    // ─── Notifications ───
    notifications: defineTable({
      userId: v.id("users"),
      title: v.string(),
      message: v.string(),
      type: v.union(
        v.literal("booking"),
        v.literal("consultation"),
        v.literal("general"),
      ),
      isRead: v.boolean(),
      link: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_unread", ["userId", "isRead"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
