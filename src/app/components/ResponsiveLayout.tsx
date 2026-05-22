'use client'

import { useEffect, useState } from 'react'
import {
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

const MOBILE_BREAKPOINT = 700

export default function ResponsiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile === null) return null

  if (isMobile) {
    return (
      <ResizablePanelGroup direction="vertical" style={{ height: '100vh' }}>
        <ResizablePanel defaultSize={10}><Header /></ResizablePanel>
        <ResizablePanel defaultSize={55}>{children}</ResizablePanel>
        <ResizablePanel defaultSize={28}><Sidebar /></ResizablePanel>
        <ResizablePanel defaultSize={7}><Footer /></ResizablePanel>
      </ResizablePanelGroup>
    )
  }

  return (
    <ResizablePanelGroup direction="vertical" style={{ height: '100vh' }}>
      <ResizablePanel defaultSize={10}><Header /></ResizablePanel>
      <ResizablePanel defaultSize={85}>
        <ResizablePanelGroup direction="horizontal" style={{ flex: 1 }}>
          <ResizablePanel defaultSize={20}><Sidebar /></ResizablePanel>
          <ResizablePanel defaultSize={80}>{children}</ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizablePanel defaultSize={7}><Footer /></ResizablePanel>
    </ResizablePanelGroup>
  )
}
