import { PERSONAS_MAP } from "@/lib/personas";
import { ChatRoom } from "@/components/chat-room";
import { notFound } from "next/navigation";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ personaId: string }>;
}) {
  const { personaId } = await params;
  const persona = PERSONAS_MAP[personaId];

  if (!persona) notFound();

  return <ChatRoom persona={persona} />;
}
