import Quiz from "@/components/Quiz";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Page() {
  const s = await getSettings();
  return <Quiz privacyUrl={s.privacy_url} />;
}
