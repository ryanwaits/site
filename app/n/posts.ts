export interface Post {
  slug: string;
  title: string;
  date: string;
}

// Posts ordered by date (oldest first)
export const posts: Post[] = [
  { slug: 'codecov-but-for-docs', title: 'Codecov, But for Docs', date: 'October 2025' },
  { slug: 'how-does-this-not-exist', title: 'How Does This Not Exist?', date: 'October 2025' },
  { slug: '2000-to-100', title: 'From 2000 Lines to 100', date: 'December 2025' },
  { slug: 'features-dont-compose', title: "Features Don't Compose", date: 'December 2025' },
  { slug: 'json-schema-contract', title: 'Pick a Standard, Extend Carefully', date: 'December 2025' },
  { slug: 'new-standard-who-dis', title: 'New Standard, Who Dis?', date: 'December 2025' },
];

export function getPostNavigation(currentSlug: string) {
  const index = posts.findIndex(p => p.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}
