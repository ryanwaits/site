'use client'

import { Console } from './console'
import { SiteEffectsProvider, useSiteEffects } from './site-effects'

function ConsoleWithEffects() {
  const { handleCommand } = useSiteEffects()
  return <Console onCommand={handleCommand} hideButton />
}

export function ConsoleWrapper() {
  return (
    <SiteEffectsProvider>
      <ConsoleWithEffects />
    </SiteEffectsProvider>
  )
}
