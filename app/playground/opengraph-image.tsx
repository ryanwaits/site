import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { EXPERIMENTS, COMING_SOON } from '@/lib/experiments';

export const alt = 'Playground - Ryan Waits';
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
            [PLAYGROUND]
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '32px',
          }}
        >
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: '72px',
              color: '#E8E4D9',
              lineHeight: 1.1,
            }}
          >
            Playground
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '22px',
              color: '#8A8680',
            }}
          >
            Side projects and experiments
          </span>

          {/* Terminal prompt style list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '16px',
              fontFamily: 'JetBrains Mono',
              fontSize: '20px',
            }}
          >
            {EXPERIMENTS.map((exp, i) => (
              <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: i === 0 ? '#F6833B' : '#8A8680' }}>{'>'}</span>
                <span style={{ color: '#E8E4D9' }}>{exp.name.toLowerCase()}</span>
                <span style={{ color: '#8A8680', fontSize: '16px' }}>— {exp.tagline}</span>
              </div>
            ))}
            {COMING_SOON.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#8A8680' }}>{'>'}</span>
                <span style={{ color: '#8A8680' }}>{item.name}</span>
                <span style={{ color: '#5A615B', fontSize: '16px' }}>(coming soon)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Blinking cursor */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '20px',
              color: '#8A8680',
            }}
          >
            {'> '}
            <span style={{ color: '#F6833B' }}>_</span>
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
