import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildCloudinaryUrl, isOwnedCloudinaryAsset } from "@/lib/utils/cloudinary";

describe("buildCloudinaryUrl", () => {
  const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_CLOUDINARY_NAME = "test-cloud";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_CLOUDINARY_NAME = originalCloudName;
  });

  it("returns the default image when src is empty", () => {
    expect(buildCloudinaryUrl("")).toBe("/default.jpg");
  });

  it("returns the src unchanged when it is already an absolute URL", () => {
    const url = "https://example.com/some-image.png";
    expect(buildCloudinaryUrl(url)).toBe(url);
  });

  it("returns http URLs unchanged too (not just https)", () => {
    const url = "http://example.com/some-image.png";
    expect(buildCloudinaryUrl(url)).toBe(url);
  });

  it("builds a cloudinary transformation URL for a bare public id", () => {
    const result = buildCloudinaryUrl("products/abc123", 500, 80);
    expect(result).toBe(
      "https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_80,w_500,h_500,c_fill/products/abc123"
    );
  });

  it("uses the default size (200) and quality (75) when not provided", () => {
    const result = buildCloudinaryUrl("avatars/xyz");
    expect(result).toBe(
      "https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_75,w_200,h_200,c_fill/avatars/xyz"
    );
  });

  it("uses a custom size while keeping the default quality", () => {
    const result = buildCloudinaryUrl("avatars/xyz", 1000);
    expect(result).toBe(
      "https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_75,w_1000,h_1000,c_fill/avatars/xyz"
    );
  });
});

describe("isOwnedCloudinaryAsset", () => {
  const USER_ID = "507f191e810c19729de860ea";

  it("accepts a publicId that lives under the user's own avatar folder", () => {
    expect(
      isOwnedCloudinaryAsset(`artisan-hub/avatars/${USER_ID}/abc123`, "avatars", USER_ID)
    ).toBe(true);
  });

  it("accepts a publicId that lives under the user's own product folder", () => {
    expect(
      isOwnedCloudinaryAsset(`artisan-hub/products/${USER_ID}/abc123`, "products", USER_ID)
    ).toBe(true);
  });

  it("rejects a publicId that belongs to a different user", () => {
    expect(
      isOwnedCloudinaryAsset("artisan-hub/avatars/someone-else-id/abc123", "avatars", USER_ID)
    ).toBe(false);
  });

  it("rejects a publicId of the wrong kind (product asset submitted as an avatar)", () => {
    expect(
      isOwnedCloudinaryAsset(`artisan-hub/products/${USER_ID}/abc123`, "avatars", USER_ID)
    ).toBe(false);
  });

  it("rejects an empty or non-string publicId", () => {
    expect(isOwnedCloudinaryAsset("", "avatars", USER_ID)).toBe(false);
    expect(isOwnedCloudinaryAsset(undefined as unknown as string, "avatars", USER_ID)).toBe(false);
  });

  it("rejects a publicId that merely starts with a similar-looking prefix", () => {
    // Guards against a naive `.includes()`-style check: this string does NOT
    // start with "artisan-hub/avatars/<USER_ID>/" so it must be rejected.
    expect(
      isOwnedCloudinaryAsset(`other/artisan-hub/avatars/${USER_ID}/abc123`, "avatars", USER_ID)
    ).toBe(false);
  });
});
