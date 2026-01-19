// Types - safe for client and server
export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
}

// Navigation helper - works with any posts array
export function getPostNavigation(posts: Post[], currentSlug: string) {
  const index = posts.findIndex(p => p.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}
