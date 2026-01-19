import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import type { Post } from './posts';

// Parse date string like "January 2026" into sortable timestamp
function parseDate(dateStr: string): number {
  const months: Record<string, number> = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
  };
  const [month, year] = dateStr.split(' ');
  return new Date(parseInt(year), months[month] || 0).getTime();
}

export async function getPosts(): Promise<Post[]> {
  const notesDir = path.join(process.cwd(), 'content');
  const entries = await fs.readdir(notesDir, { withFileTypes: true });

  const posts: Post[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const mdxPath = path.join(notesDir, entry.name, 'index.mdx');
    try {
      const content = await fs.readFile(mdxPath, 'utf-8');

      // Extract metadata (use backreference to match same quote type)
      const titleMatch = content.match(/title:\s*(['"])(.+?)\1/);
      const descMatch = content.match(/description:\s*(['"])(.+?)\1/);
      const dateMatch = content.match(/<AnimatedName\s+date=['"](.+?)['"]/);

      if (titleMatch && descMatch && dateMatch) {
        posts.push({
          slug: entry.name,
          title: titleMatch[2],
          description: descMatch[2],
          date: dateMatch[1],
        });
      }
    } catch {
      // Skip if file doesn't exist or can't be read
    }
  }

  // Sort by date (newest first)
  return posts.sort((a, b) => parseDate(b.date) - parseDate(a.date));
}
