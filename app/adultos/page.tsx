import type { Metadata } from "next";
import Quiz from "@/components/Quiz";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Perfil Cerebral Neurobalance · Adultos" };

export default async function Page() {
  const s = await getSettings();
  return <Quiz privacyUrl={s.privacy_url} />;
}
