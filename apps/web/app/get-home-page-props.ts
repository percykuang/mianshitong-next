import { getCurrentAuthUserProfile } from '@/server/auth'

import { HOME_PAGE_CONTENT } from './home-page.data'

export interface HomePageProps {
  content: typeof HOME_PAGE_CONTENT
  userEmail: string | null
}

export async function getHomePageProps(): Promise<HomePageProps> {
  const currentUser = await getCurrentAuthUserProfile()

  return {
    content: HOME_PAGE_CONTENT,
    userEmail: currentUser?.email ?? null,
  }
}
