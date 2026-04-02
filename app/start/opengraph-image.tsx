import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const alt = 'Workflow Assessment — Find where AI fits in your business';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  const fontsDir = join(process.cwd(), 'public', 'fonts');
  const [playfairData, jetbrainsData] = await Promise.all([
    readFile(join(fontsDir, 'PlayfairDisplay-Regular.ttf')),
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
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Concentric circles */}
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            border: '1px solid rgba(21, 136, 178, 0.12)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            border: '1px solid rgba(21, 136, 178, 0.08)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(21, 136, 178, 0.08) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />

        {/* Eyebrow */}
        <span
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#1588B2',
            marginBottom: '32px',
          }}
        >
          15 min · Conversational · Personalized
        </span>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: '64px',
              fontWeight: 400,
              color: '#E8E4D9',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Find where{' '}
            <span style={{ fontStyle: 'italic', color: '#1588B2' }}>AI</span>
            {' '}fits
          </span>
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: '64px',
              fontWeight: 400,
              color: '#E8E4D9',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            in your business
          </span>
        </div>

        {/* Subtitle */}
        <span
          style={{
            fontSize: '18px',
            color: '#8A8680',
            lineHeight: 1.5,
            maxWidth: '480px',
          }}
        >
          A guided assessment that maps your workflows to real solutions.
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Playfair Display',
          data: playfairData,
          style: 'normal',
          weight: 400,
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
