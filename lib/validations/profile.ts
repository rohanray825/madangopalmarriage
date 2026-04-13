import { z } from "zod";
import { REGULATIVE_PRINCIPLES } from "@/lib/constants";

const genderEnum = z.enum(["male", "female"]);
const binaryEnum = z.enum(["yes", "no"]);
const homeCategoryEnum = z.enum(["owned", "rented"]);
const parentChantingEnum = z.enum(["both", "one", "none"]);

const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

const optionalDraftText = z.string().trim().optional().or(z.literal(""));
const optionalDraftPhone = z.string().trim().regex(/^$|^\d{10}$/, "Phone number must be exactly 10 digits").optional();

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getBirthDateValidationMessage(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "Birth date is required";
  }

  const [yearString, monthString, dayString] = value.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  if (!year || month < 1 || month > 12 || day < 1) {
    return "Please enter a valid birth date";
  }

  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (day > daysInMonth[month - 1]) {
    if (month === 2) {
      return isLeapYear(year)
        ? "February allows only up to 29 days in a leap year"
        : "February allows only up to 28 days unless it is a leap year";
    }

    return "Please enter a valid calendar date";
  }

  return null;
}

const questionnaireObject = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("A valid email is required"),
  gender: genderEnum,
  isInitiated: binaryEnum,
  initiatedName: z.string().trim().optional().default(""),
  birthDate: z.string().trim().min(1, "Birth date is required"),
  birthTime: z.string().trim().min(1, "Birth time is required"),
  birthPlace: z.string().trim().min(2, "Birth place is required"),
  caste: z.string().trim().min(2, "Caste is required"),
  height: z.string().trim().min(2, "Height is required"),
  weight: z.string().trim().min(1, "Weight is required"),
  languages: z.string().trim().min(2, "Languages are required"),
  education: z.string().trim().min(2, "Education is required"),
  working: binaryEnum,
  profession: z.string().trim().optional().default(""),
  jobLocation: z.string().trim().optional().default(""),
  salary: z.string().trim().optional().default(""),
  widow: binaryEnum,
  divorced: binaryEnum,
  relocate: binaryEnum,
  phone: phoneSchema,
  familyPhone: phoneSchema,
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  address: z.string().trim().min(3, "Current address is required"),
  counsellor: z.string().trim().min(2, "Counsellor name is required"),
  counsellorPhone: phoneSchema,
  rounds: z.string().trim().min(1, "Rounds are required"),
  regs: z
    .array(z.enum(REGULATIVE_PRINCIPLES.map((item) => item.value) as [string, ...string[]]))
    .min(1, "Select at least one regulative principle"),
  familyMembers: z.string().trim().min(1, "Family members count is required"),
  homeAddress: z.string().trim().min(3, "Original home address is required"),
  homeCategory: homeCategoryEnum,
  father: z.string().trim().min(2, "Father's name is required"),
  mother: z.string().trim().min(2, "Mother's name is required"),
  sibling: z.string().trim().min(2, "Sibling name is required"),
  parentsChanting: parentChantingEnum,
  aboutYou: z.string().trim().min(1, "Please describe yourself").max(1000).default(""),
  expectations: z.string().trim().min(1, "Please describe your expectations").max(1000).default(""),
  photoUrl: z.string().trim().min(1, "Please upload a profile picture"),
  photoKey: z.string().optional().or(z.literal("")),
});

export const questionnaireSchema = questionnaireObject
  .superRefine((data, ctx) => {
    const birthDateMessage = getBirthDateValidationMessage(data.birthDate);
    if (birthDateMessage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDate"],
        message: birthDateMessage,
      });
    }

    if (data.isInitiated === "yes" && (!data.initiatedName || data.initiatedName.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["initiatedName"],
        message: "Initiated name is required for initiated devotees",
      });
    }

    if (data.working === "yes") {
      if (!data.profession || data.profession.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["profession"],
          message: "Profession is required if you are working currently",
        });
      }

      if (!data.jobLocation || data.jobLocation.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["jobLocation"],
          message: "Job location is required if you are working currently",
        });
      }

      if (!data.salary || data.salary.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salary"],
          message: "Salary is required if you are working currently",
        });
      }
    }
  });

export const draftQuestionnaireSchema = z.object({
  name: optionalDraftText,
  email: z.string().trim().email("A valid email is required").optional().or(z.literal("")),
  gender: genderEnum.optional(),
  isInitiated: binaryEnum.optional(),
  initiatedName: optionalDraftText,
  birthDate: optionalDraftText,
  birthTime: optionalDraftText,
  birthPlace: optionalDraftText,
  caste: optionalDraftText,
  height: optionalDraftText,
  weight: optionalDraftText,
  languages: optionalDraftText,
  education: optionalDraftText,
  working: binaryEnum.optional(),
  profession: optionalDraftText,
  jobLocation: optionalDraftText,
  salary: optionalDraftText,
  widow: binaryEnum.optional(),
  divorced: binaryEnum.optional(),
  relocate: binaryEnum.optional(),
  phone: optionalDraftPhone,
  familyPhone: optionalDraftPhone,
  city: optionalDraftText,
  state: optionalDraftText,
  address: optionalDraftText,
  counsellor: optionalDraftText,
  counsellorPhone: optionalDraftPhone,
  rounds: optionalDraftText,
  regs: z.array(z.enum(REGULATIVE_PRINCIPLES.map((item) => item.value) as [string, ...string[]])).optional(),
  familyMembers: optionalDraftText,
  homeAddress: optionalDraftText,
  homeCategory: homeCategoryEnum.optional(),
  father: optionalDraftText,
  mother: optionalDraftText,
  sibling: optionalDraftText,
  parentsChanting: parentChantingEnum.optional(),
  aboutYou: optionalDraftText,
  expectations: optionalDraftText,
  photoUrl: optionalDraftText,
  photoKey: optionalDraftText,
});

export type QuestionnaireValues = z.infer<typeof questionnaireSchema>;

export const adminRecommendationSchema = z.object({
  candidateUserId: z.string().min(1),
  messageForRecipient: z.string().min(20).max(1500),
  recommendedByAdminName: z.string().min(2),
  sendEmail: z.boolean().default(true),
});

export type AdminRecommendationValues = z.infer<typeof adminRecommendationSchema>;
