import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { es } from "@/lib/i18n/es";
import { deleteConversation } from "@/modules/conversations/actions";
import { Chat } from "@/modules/conversations/components/chat";
import { DeleteConversation } from "@/modules/conversations/components/delete-conversation";
import { getConversation } from "@/modules/conversations/queries";
import { resolveTargets } from "@/modules/clinical-work/targets";
import { listMemoryCategories } from "@/modules/memory/queries";

export default async function ConversationPage({
  params,
}: PageProps<"/casos/[caseId]/conversaciones/[conversationId]">) {
  const { caseId, conversationId } = await params;
  const [conversation, categories] = await Promise.all([
    getConversation(caseId, conversationId),
    listMemoryCategories(),
  ]);
  if (!conversation) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href={`/casos/${caseId}/conversaciones`} className="text-label text-ink-muted hover:text-ink">
            ← {es.conversations.back}
          </Link>
          <h2 className="mt-2 text-heading text-ink">{conversation.assistant_name}</h2>
          {conversation.title ? <p className="text-body-sm text-ink-muted">{conversation.title}</p> : null}
        </div>
        <DeleteConversation action={deleteConversation.bind(null, caseId, conversation.id)} />
      </div>
      {!conversation.assistant_active ? <Alert tone="warning">{es.conversations.inactive}</Alert> : null}
      <Chat
        caseId={caseId}
        targets={resolveTargets(conversation.assistant_save_targets, categories)}
        usageTips={conversation.assistant_usage_tips}
        starters={conversation.assistant_starters}
        conversationId={conversation.id}
        assistantName={conversation.assistant_name}
        initialMessages={conversation.messages}
        disabled={!conversation.assistant_active}
      />
    </div>
  );
}
