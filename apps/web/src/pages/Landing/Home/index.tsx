// Guardado en una constante como flecha, tal como lo solicitaste
export const Home: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          {/* Un logo minimalista usando solo Tailwind */}
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 shadow-sm shadow-indigo-500/30">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Swift<span className="text-indigo-600">Board</span>
          </span>
        </div>

        {/* Enlaces de acceso rápido */}
        <nav className="flex items-center space-x-4">
          <a
            href="/login"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Iniciar Sesión
          </a>
          <a
            href="/SignUp"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/10 transition-colors duration-100 hover:bg-indigo-700 active:scale-95"
          >
            Registrarse
          </a>
        </nav>
      </header>

      {/* Sección Principal (Hero) */}
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:py-24">
        {/* Badge superior */}
        <span className="animate-fade-in mb-6 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-700 uppercase">
          🚀 Diseñado para Estudiantes
        </span>

        {/* Título Principal de Impacto */}
        <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Organiza tus proyectos escolares <br className="hidden sm:block" />
          <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            en segundos, sin el caos.
          </span>
        </h1>

        {/* Descripción de tu Propuesta de Valor */}
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-slate-600">
          La metodología Kanban simplificada al máximo. Olvídate de
          configuraciones aburridas, integraciones pesadas y plataformas masivas
          como Jira. Entra, crea tu tablero y saca esa entrega adelante.
        </p>

        {/* Botones de Acción Clave */}
        <div className="flex w-full flex-col space-y-3 sm:w-auto sm:flex-row sm:space-y-0 sm:space-x-4">
          <a
            href="/signup"
            className="w-full rounded-lg bg-indigo-600 px-8 py-3 text-center font-medium text-white shadow-md transition-all duration-150 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] sm:w-auto"
          >
            Empezar Gratis
          </a>
          <a
            href="/login"
            className="w-full rounded-lg border border-slate-200 bg-white px-8 py-3 text-center font-medium text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50 active:scale-[0.98] sm:w-auto"
          >
            Ver mi Tablero
          </a>
        </div>
      </main>

      {/* Pie de Página (Footer) */}
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 sm:flex-row">
        <div>
          &copy; {new Date().getFullYear()} SwiftBoard. Todos los derechos
          reservados.
        </div>
        <div className="flex space-x-4">
          <span className="text-slate-400">
            Hecho por estudiantes, para estudiantes.
          </span>
        </div>
      </footer>
    </div>
  )
}
