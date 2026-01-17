import { getPosts } from './posts.server'

export default async function NotesPage() {
  const posts = await getPosts()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-8">Notes</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/n/${post.slug}`}
            className="block hover:text-[#5a9848]"
          >
            {post.title}
          </a>
        ))}
      </div>
    </div>
  )
}
