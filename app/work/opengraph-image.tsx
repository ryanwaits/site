import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { PROJECTS } from '@/lib/projects';

export const alt = 'Work - Ryan Waits';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
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
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '20px',
              color: '#8A8680',
              letterSpacing: '0.1em',
            }}
          >
            RYAN WAITS
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '20px',
              color: '#8A8680',
            }}
          >
            //
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '20px',
              color: '#F6833B',
              letterSpacing: '0.1em',
            }}
          >
            [WORK]
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '40px',
          }}
        >
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: '80px',
              color: '#E8E4D9',
              lineHeight: 1.1,
            }}
          >
            Work
          </span>

          {/* Directory tree */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontFamily: 'JetBrains Mono',
              fontSize: '24px',
            }}
          >
            {PROJECTS.map((project, i) => (
              <div key={project.slug} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#8A8680' }}>{i === PROJECTS.length - 1 ? '└─' : '├─'}</span>
                <span style={{ color: '#E8E4D9' }}>{project.name}</span>
                <span style={{ color: '#8A8680', fontSize: '18px' }}>{project.tagline}</span>
              </div>
            ))}
          </div>
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
