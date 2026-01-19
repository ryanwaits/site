import { ImageResponse } from 'next/og';
import { getPage, getPages } from '@/lib/source';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const alt = 'Ryan Waits';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const pages = getPages();
  return pages.map((page: { slugs: string[] }) => ({
    slug: page.slugs[0],
  }));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPage(slug);

  if (!page) {
    return new ImageResponse(
      <div style={{ background: '#1A1F1C', width: '100%', height: '100%' }} />,
      size
    );
  }

  const title = page.data.title;

  // Load fonts from local files (medium weight for better rendering)
  const fontsDir = join(process.cwd(), 'public', 'fonts');
  const [playfairData, jetbrainsData] = await Promise.all([
    readFile(join(fontsDir, 'PlayfairDisplay-Medium.ttf')),
    readFile(join(fontsDir, 'JetBrainsMono-Medium.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          background: '#1A1F1C',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 80px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '24px',
              color: '#8A8680',
              letterSpacing: '0.1em',
            }}
          >
            RYAN WAITS  //  [WRITING]
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: title.length > 30 ? '72px' : '96px',
              color: '#E8E4D9',
              lineHeight: 1.1,
              maxWidth: '100%',
            }}
          >
            {title}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Playfair Display',
          data: playfairData,
          style: 'normal',
          weight: 500,
        },
        {
          name: 'JetBrains Mono',
          data: jetbrainsData,
          style: 'normal',
          weight: 500,
        },
      ],
    }
  );
}
