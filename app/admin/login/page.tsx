import Hemispheres from "@/components/Hemispheres";

export default function Login({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Hemispheres size={40} />
      <h1 className="mt-5 text-3xl">Panel Neurobalance</h1>
      <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[15px] font-medium">Contraseña</span>
          <input name="password" type="password" required autoFocus className="field" />
        </label>
        {searchParams.error && <p className="text-sm text-nbred-600">La contraseña no es correcta.</p>}
        <button className="btn-primary w-full" type="submit">Entrar</button>
      </form>
    </main>
  );
}
