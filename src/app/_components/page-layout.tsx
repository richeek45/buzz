import type { PropsWithChildren } from "react"

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen flex-col items-center justify-center text-white">
      <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  )
}