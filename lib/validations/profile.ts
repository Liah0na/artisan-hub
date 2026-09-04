import { isOwnedCloudinaryAsset } from "@/lib/utils/cloudinary";

export type ProfileAvatarInput = { url: string; publicId: string } | null;

export type ValidatedProfile = {
  name: string;
  bio: string | null;
  phone: string | null;
  instagram: string | null;
  location: string | null;
  // `undefined` means "leave the current avatar untouched" (the field
  // wasn't present in the request body at all) — distinct from `null`,
  // which means "remove the avatar".
  avatar?: ProfileAvatarInput;
};

export const PROFILE_VALIDATION_ERROR =
  "Informe um nome válido (2 a 100 caracteres). Biografia, telefone, Instagram e localização têm limites de tamanho — confira os campos preenchidos.";

const NAME_MIN = 2;
const NAME_MAX = 100;
const BIO_MAX = 1000;
const PHONE_MAX = 30;
const INSTAGRAM_MAX = 50;
const LOCATION_MAX = 120;
// Loose on purpose: phone numbers vary a lot by country/format. Just keep
// out anything that clearly isn't phone-number-shaped input.
const PHONE_RE = /^[0-9()+\-.\s]+$/;

function optionalText(value: unknown, maxLength: number): string | null | typeof INVALID {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return INVALID;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) return INVALID;
  return trimmed;
}

const INVALID = Symbol("invalid");

export function validateProfile(data: Record<string, unknown>, userId: string): ValidatedProfile | null {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name || name.length < NAME_MIN || name.length > NAME_MAX) return null;

  const bio = optionalText(data.bio, BIO_MAX);
  if (bio === INVALID) return null;

  const phone = optionalText(data.phone, PHONE_MAX);
  if (phone === INVALID || (typeof phone === "string" && !PHONE_RE.test(phone))) return null;

  const instagram = optionalText(data.instagram, INSTAGRAM_MAX);
  if (instagram === INVALID) return null;

  const location = optionalText(data.location, LOCATION_MAX);
  if (location === INVALID) return null;

  const profile: ValidatedProfile = {
    name,
    bio: bio as string | null,
    phone: phone as string | null,
    instagram: instagram as string | null,
    location: location as string | null,
  };

  if ("avatar" in data) {
    const rawAvatar = data.avatar;
    if (rawAvatar === null) {
      profile.avatar = null;
    } else if (
      rawAvatar &&
      typeof rawAvatar === "object" &&
      typeof (rawAvatar as { url?: unknown }).url === "string" &&
      typeof (rawAvatar as { publicId?: unknown }).publicId === "string" &&
      (rawAvatar as { url: string }).url.trim() &&
      (rawAvatar as { publicId: string }).publicId.trim()
    ) {
      const url = (rawAvatar as { url: string }).url.trim();
      const publicId = (rawAvatar as { publicId: string }).publicId.trim();
      // Item #12: the submitted avatar must belong to this user's own
      // Cloudinary folder.
      if (!isOwnedCloudinaryAsset(publicId, "avatars", userId)) return null;
      profile.avatar = { url, publicId };
    } else {
      return null;
    }
  }

  return profile;
}
