import { getCurrentSessionUser } from "@/entities/session/server";
import { getServerTranslations } from "@/shared/i18n/server";
import { AppLayout } from "@/widgets/app-layout";
import { SearchResults } from "@/widgets/search-results";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export async function SearchPage({ searchParams }: SearchPageProps) {
  const [{ q }, currentUser, t] = await Promise.all([
    searchParams,
    getCurrentSessionUser(),
    getServerTranslations(),
  ]);
  const query = q?.trim() ?? "";
  const title = query
    ? t.search.resultsFor.replace("{query}", query)
    : t.search.title;
  const description = currentUser
    ? t.search.signedInEyebrow
    : t.search.guestEyebrow;

  return (
    <AppLayout title={title} description={description}>
      <SearchResults query={query} />
    </AppLayout>
  );
}
