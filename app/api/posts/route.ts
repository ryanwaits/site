import { getPosts } from '@/app/n/posts.server'

export async function GET() {
  const posts = await getPosts()
  return Response.json(posts)
}
