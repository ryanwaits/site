import { notFound } from 'next/navigation';
import { getPage, getPages } from '@/lib/source';
import { components as mdxComponents } from '@/mdx-components';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params;
  const page = getPage(slug);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;

  return <MDX components={mdxComponents} />;
}

export async function generateStaticParams() {
  const pages = getPages();
  return pages.map((page: { slugs: string[] }) => ({
    slug: page.slugs[0],
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = getPage(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
