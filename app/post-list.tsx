import { Link } from 'next-view-transitions';

interface Post {
  date: string;
  title: string;
  description: string;
  href: string;
}

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div className="divide-y divide-[#0b0d0b]/10 -mx-8">
      {posts.map((post) => (
        <Link
          key={post.href}
          href={post.href}
          className="grid grid-cols-[180px_1fr] items-start gap-8 py-8 px-8 no-underline hover:bg-[#0b0d0b]/5 transition-colors"
        >
          <time className="text-right pt-2 tracking-wider">{post.date}</time>
          <div>
            <h3 className="font-serif text-2xl italic font-normal m-0">{post.title}</h3>
            <p className="text-base text-[#595959] line-clamp-2 mt-2 mb-0">
              {post.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
