import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import type { Post } from './posts';

// Parse YYYY-MM-DD date string into sortable timestamp
function parseDate(dateStr: string): number {
  return new Date(dateStr).getTime();
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

      // Extract metadata from frontmatter (handles unquoted YAML values)
      const titleMatch = content.match(/title:\s*(.+)/);
      const descMatch = content.match(/description:\s*(.+)/);
      const dateMatch = content.match(/date:\s*(.+)/);

      if (titleMatch && descMatch && dateMatch) {
        posts.push({
          slug: entry.name,
          title: titleMatch[1].trim(),
          description: descMatch[1].trim(),
          date: dateMatch[1].trim(),
        });
      }
    } catch {
      // Skip if file doesn't exist or can't be read
    }
  }

  // Sort by date (newest first)
  return posts.sort((a, b) => parseDate(b.date) - parseDate(a.date));
}
