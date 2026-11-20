import Link from "next/link";
import { notFound } from "next/navigation";
import { es } from "@/lib/i18n/es";
import { formatDate } from "@/modules/cases/format";
import { deleteResource, updateResource } from "@/modules/resources/actions";
import { ResourceView } from "@/modules/resources/components/resource-view";
import { getResource } from "@/modules/resources/queries";

export default async function ResourcePage({ params }: PageProps<"/casos/[caseId]/recursos/[resourceId]">) {
  const { caseId, resourceId } = await params;
  const resource = await getResource(caseId, resourceId);
  if (!resource) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/casos/${caseId}/recursos`} className="text-label text-ink-muted hover:text-ink print:hidden">
        ← {es.resources.back}
      </Link>
      <ResourceView
        title={resource.title}
        content={resource.content}
        createdLabel={es.resources.created(formatDate(resource.created_at))}
        updateAction={updateResource.bind(null, caseId, resource.id)}
        deleteAction={deleteResource.bind(null, caseId, resource.id)}
      />
    </div>
  );
}
