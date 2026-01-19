import { getPosts } from '@/content/posts.server'

export async function GET() {
  const posts = await getPosts()
  return Response.json(posts)
}
