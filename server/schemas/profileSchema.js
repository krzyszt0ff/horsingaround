import * as z from 'zod';

const genderEnum = z.enum(["male", "female", "other"]);

function normalizeToArray(val) {
  if (Array.isArray(val)) return val;
  else if (typeof val === "string") {
    let arr = []
    arr.push(val);
    return arr
  }
  return undefined;
}

export const profileSchema = z.object({
  name: z.string().min(3).max(30).trim(),
  date_of_birth: z.preprocess(val => {
    const date = new Date(val);
    return isNaN(date) ? undefined : date;
  }, z.date()),
  bio: z.string().max(300).optional().nullable(),
  gender: genderEnum,
  longitude: z.preprocess(val => parseFloat(val), z.number().gte(-180).lte(180)),
  latitude: z.preprocess(val => parseFloat(val), z.number().gte(-90).lte(90)),
  preferred_gender:  z.preprocess(normalizeToArray, z.array(genderEnum).min(1)),
  preferred_min_age: z.preprocess(val => parseInt(val), z.number().gte(18).lte(99)),
  preferred_max_age: z.preprocess(val => parseInt(val), z.number().gte(18).lte(99)),
  preferred_distance: z.preprocess(val => parseFloat(val), z.number().nonnegative().gte(0.1).transform(val => Math.round(val * 10) / 10)),
  images_paths: z.array(z.string()).min(1).optional()
}).refine(
  (profile) => profile.preferred_min_age < profile.preferred_max_age,
  { message: "Minimal age cannot be greater than maximal age" }
).refine(
  (profile) => {
    const uniqueGenders = new Set(profile.preferred_gender);
    return uniqueGenders.size === profile.preferred_gender.length;
  },
  { 
    message: "Preferred genders cannot contain duplicates",
  }
);