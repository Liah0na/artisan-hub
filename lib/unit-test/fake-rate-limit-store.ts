// In-memory stand-in for prisma.rateLimitBucket, so tests can assert
// behaviour across a sequence of hits instead of individual Prisma calls.
// Use with: vi.mock("@/lib/prisma", async () => (await import(<this file>)).fakePrismaModule)

type Row = { id: string; count: number; resetAt: Date };

export const rows = new Map<string, Row>();
let conflictOnNextCreate: Omit<Row, "id"> | null = null;

export function resetFakeStore() {
  rows.clear();
  conflictOnNextCreate = null;
}

// Simulates a concurrent request creating the bucket between our delete and
// create: the row appears with the given state and create fails with P2002.
export function failNextCreateWithConflict(row: Omit<Row, "id">) {
  conflictOnNextCreate = row;
}

type CountUpdate = { increment?: number; decrement?: number };

const rateLimitBucket = {
  updateMany: async ({ where, data }: { where: { id: string; resetAt?: { gt: Date }; count?: { gt: number } }; data: { count: CountUpdate } }) => {
    const row = rows.get(where.id);
    if (!row) return { count: 0 };
    if (where.resetAt && row.resetAt <= where.resetAt.gt) return { count: 0 };
    if (where.count && row.count <= where.count.gt) return { count: 0 };
    row.count += (data.count.increment ?? 0) - (data.count.decrement ?? 0);
    return { count: 1 };
  },
  deleteMany: async ({ where }: { where: { id?: string; resetAt?: { lte: Date } } }) => {
    let count = 0;
    for (const row of [...rows.values()]) {
      if (where.id && row.id !== where.id) continue;
      if (where.resetAt && row.resetAt > where.resetAt.lte) continue;
      rows.delete(row.id);
      count += 1;
    }
    return { count };
  },
  create: async ({ data }: { data: Row }) => {
    if (conflictOnNextCreate) {
      rows.set(data.id, { ...conflictOnNextCreate, id: data.id });
      conflictOnNextCreate = null;
      throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
    }
    if (rows.has(data.id)) throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
    rows.set(data.id, { ...data });
  },
  findUnique: async ({ where }: { where: { id: string } }) => {
    const row = rows.get(where.id);
    return row ? { ...row } : null;
  },
};

export const fakePrismaModule = { prisma: { rateLimitBucket } };
