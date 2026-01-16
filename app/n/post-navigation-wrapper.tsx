'use client';

import { usePathname } from 'next/navigation';
import { PostNavigation } from './post-navigation';
import { getPostNavigation } from './posts';

export function PostNavigationWrapper() {
  const pathname = usePathname();
  const slug = pathname?.replace('/n/', '') || '';
  const { prev, next } = getPostNavigation(slug);

  return <PostNavigation prev={prev} next={next} />;
}
