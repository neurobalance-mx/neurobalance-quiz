import type { Metadata } from "next";
import KidsQuiz from "@/components/KidsQuiz";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Perfil Cerebral Neurobalance · Niños" };

export default async function Page() {
  const s = await getSettings();
  return <KidsQuiz privacyUrl={s.privacy_url} disclaimer={s.kids.disclaimer} />;
}
