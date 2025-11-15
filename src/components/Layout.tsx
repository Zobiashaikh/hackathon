import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a1f]">
      <div className="mx-auto max-w-[1600px] px-8 py-8">
        {children}
      </div>
    </div>
  )
}

export default Layout