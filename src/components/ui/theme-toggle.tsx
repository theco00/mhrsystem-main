import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evita problemas de hidratação
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-lg"
        disabled
      >
        <div className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9 rounded-lg bg-white hover:bg-blue-50 border border-blue-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 dark:border-blue-800/30"
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 text-blue-600 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 text-sky-400 dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

// Componente de toggle switch alternativo com animação mais elaborada
export function ThemeSwitch() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-7 w-14 items-center rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 hover:shadow-lg hover:scale-105 dark:from-blue-800 dark:to-blue-900"
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <span className="sr-only">Alternar tema</span>
      <span
        className={`${
          isDark ? "translate-x-8" : "translate-x-1"
        } inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out`}
      >
        {isDark ? (
          <Moon className="h-5 w-5 p-1 text-blue-900" />
        ) : (
          <Sun className="h-5 w-5 p-1 text-yellow-500" />
        )}
      </span>
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <Sun className="h-4 w-4 text-white/60" />
        <Moon className="h-4 w-4 text-white/60" />
      </div>
    </button>
  )
}
