import { describe, it, expect, vi, beforeEach } from "vitest";

const findUniqueMock = vi.fn();
const findManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

import { getArtisanById, getArtisans } from "../../../services/artisan.service";

const VALID_ID = "507f191e810c19729de860ea";

const PUBLIC_SELECT = {
  id: true,
  name: true,
  avatar: true,
  bio: true,
  phone: true,
  instagram: true,
  location: true,
  createdAt: true,
};

function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: VALID_ID,
    name: "Ana Artesã",
    avatar: { url: "https://res.cloudinary.com/test-cloud/image/upload/artisans/ana.jpg", publicId: "artisan-hub/avatars/507f191e810c19729de860ea/ana" },
    bio: "Ceramista há 10 anos",
    phone: "+55 31 99999-0000",
    instagram: "@ana.ceramica",
    location: "Belo Horizonte, MG",
    createdAt: new Date("2020-05-01T00:00:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_CLOUDINARY_NAME = "test-cloud";
});

describe("getArtisanById", () => {
  it("returns null without querying the database when the id is not a valid ObjectId", async () => {
    const result = await getArtisanById("not-a-valid-id");

    expect(result).toBeNull();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns null when no user is found", async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    const result = await getArtisanById(VALID_ID);

    expect(result).toBeNull();
  });

  it("only selects public fields (never email)", async () => {
    findUniqueMock.mockResolvedValueOnce(makeUser());

    await getArtisanById(VALID_ID);

    expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: VALID_ID }, select: PUBLIC_SELECT });
  });

  it("maps a found user to an Artisan (without email), building an avatar URL from its publicId at size 1000", async () => {
    findUniqueMock.mockResolvedValueOnce(makeUser());

    const result = await getArtisanById(VALID_ID);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(VALID_ID);
    expect(result).not.toHaveProperty("email");
    expect(result!.avatar).toContain("w_1000,h_1000");
    expect(result!.avatar).toContain("artisan-hub/avatars/507f191e810c19729de860ea/ana");
    expect(result!.createdAt).toBe("2020-05-01T00:00:00.000Z");
  });

  it("leaves avatar null when the user has no avatar", async () => {
    findUniqueMock.mockResolvedValueOnce(makeUser({ avatar: null }));

    const result = await getArtisanById(VALID_ID);

    expect(result!.avatar).toBeNull();
  });
});

describe("getArtisans", () => {
  it("queries only users with the artisan role, newest first, selecting only public fields", async () => {
    findManyMock.mockResolvedValueOnce([]);

    await getArtisans();

    expect(findManyMock).toHaveBeenCalledWith({
      where: { role: "artisan" },
      orderBy: { createdAt: "desc" },
      select: PUBLIC_SELECT,
    });
  });

  it("passes a take limit through to Prisma when provided", async () => {
    findManyMock.mockResolvedValueOnce([]);

    await getArtisans(5);

    expect(findManyMock).toHaveBeenCalledWith({
      where: { role: "artisan" },
      orderBy: { createdAt: "desc" },
      select: PUBLIC_SELECT,
      take: 5,
    });
  });

  it("maps returned users to Artisans, building avatar URLs at size 500", async () => {
    findManyMock.mockResolvedValueOnce([makeUser()]);

    const result = await getArtisans();

    expect(result).toHaveLength(1);
    expect(result[0].avatar).toContain("w_500,h_500");
    expect(result[0]).not.toHaveProperty("email");
  });
});
