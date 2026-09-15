import { PageView } from "@/components/site/page-view";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  return buildMetadata("/programas");
}

export default function Page() {
  return <PageView slug="programas" />;
}
