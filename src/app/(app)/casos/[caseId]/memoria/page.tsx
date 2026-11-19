import { es } from "@/lib/i18n/es";
import { MemoryCategorySection } from "@/modules/memory/components/memory-category";
import { listMemory, listMemoryCategories } from "@/modules/memory/queries";

export default async function CaseMemoryPage({ params }: PageProps<"/casos/[caseId]/memoria">) {
  const { caseId } = await params;
  const [categories, entries] = await Promise.all([listMemoryCategories(), listMemory(caseId)]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-ink-muted">{es.memory.description}</p>
      {categories.map((category) => (
        <MemoryCategorySection
          key={category.id}
          caseId={caseId}
          category={category}
          entries={entries.filter((e) => e.category_id === category.id)}
        />
      ))}
    </div>
  );
}
