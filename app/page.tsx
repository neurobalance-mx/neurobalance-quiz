import Link from "next/link";

// Página de entrada: el usuario elige el cuestionario. Los parámetros UTM se conservan al elegir.
export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const qs = new URLSearchParams(
    Object.entries(searchParams).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : []))
  ).toString();
  const href = (path: string) => (qs ? `${path}?${qs}` : path);

  return (
    <main className="mx-auto flex min-h-screen max-w-[720px] flex-col px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
      <header className="py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Neurobalance" width={165} height={28} className="h-7 w-auto" />
      </header>

      <section className="flex flex-1 flex-col justify-center py-10">
        <h1 className="text-[2.1rem] leading-[1.12] sm:text-5xl">Perfil Cerebral Neurobalance</h1>
        <p className="mt-4 max-w-[34rem] text-lg text-ink-700">
          Descubre qué hemisferio predomina y cómo se refleja en el cuerpo, las emociones, la conducta y el aprendizaje.
        </p>

        <h2 className="mt-10 font-sans text-[15px] font-semibold text-ink-900">¿Para quién vas a contestar?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Choice
            href={href("/ninos")}
            title="Para un niño"
            text="Lo contesta mamá, papá o cuidador. De 2 a 17 años."
            meta="48 conductas · unos 8 minutos"
          />
          <Choice
            href={href("/adultos")}
            title="Para un adulto"
            text="Sobre ti o sobre otro adulto que conoces bien."
            meta="42 preguntas · unos 10 minutos"
          />
        </div>
      </section>

      <p className="text-sm text-ink-500">Este ejercicio ayuda a comprender un perfil hemisférico. No es un diagnóstico ni una recomendación médica.</p>
    </main>
  );
}

function Choice({ href, title, text, meta }: { href: string; title: string; text: string; meta: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl bg-white p-6 ring-1 ring-ink-100 transition-shadow hover:ring-2 hover:ring-ink-900 focus-visible:ring-2 focus-visible:ring-ink-900"
    >
      <span className="font-display text-2xl text-ink-900">{title}</span>
      <span className="mt-2 text-[16px] leading-relaxed text-ink-700">{text}</span>
      <span className="mt-5 flex items-center justify-between text-sm text-ink-500">
        {meta}
        <span className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Empezar</span>
      </span>
    </Link>
  );
}
