import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const alt = 'Ryan Waits';
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
              color: '#8A8680',
              letterSpacing: '0.1em',
            }}
          >
            [AUSTIN, TX]
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: '96px',
              color: '#E8E4D9',
              lineHeight: 1.1,
            }}
          >
            Ryan Waits
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontFamily: 'JetBrains Mono',
              fontSize: '24px',
              color: '#8A8680',
            }}
          >
            <span>Designer building developer tools</span>
            <span>for when agents are the user</span>
          </div>
        </div>

        {/* Cursor hint */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '32px',
              color: '#F6833B',
            }}
          >
            _
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
