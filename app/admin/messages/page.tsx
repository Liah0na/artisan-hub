import { prisma } from "@/lib/prisma";
import MessagesTable from "@/components/layout/admin/MessagesTable";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <p className="text-sm font-medium text-gray-500">Painel administrativo</p>
      <h1 className="mt-1 text-3xl font-bold">Mensagens de contato</h1>

      <MessagesTable
        messages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
      />
    </div>
  );
}
