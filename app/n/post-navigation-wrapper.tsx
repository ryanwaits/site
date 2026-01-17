'use client';

import { usePathname } from 'next/navigation';
import { PostNavigation } from './post-navigation';
import { getPostNavigation, type Post } from './posts';

interface PostNavigationWrapperProps {
  posts: Post[];
}

export function PostNavigationWrapper({ posts }: PostNavigationWrapperProps) {
  const pathname = usePathname();
  const slug = pathname?.replace('/n/', '') || '';
  const { prev, next } = getPostNavigation(posts, slug);

  return <PostNavigation prev={prev} next={next} />;
}
