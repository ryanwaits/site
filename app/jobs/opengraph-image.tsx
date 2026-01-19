import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { JOBS } from '@/lib/jobs';

export const alt = 'Jobs - Ryan Waits';
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
            [JOBS]
          </span>
        </div>

        {/* Main content - Git log style */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '20px',
          }}
        >
          {JOBS.map((job, i) => (
            <div
              key={job.hash}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                position: 'relative',
              }}
            >
              {/* Graph line and dot */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginRight: '24px',
                  position: 'relative',
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: i === 0 ? '#F6833B' : '#8A8680',
                    marginTop: '6px',
                  }}
                />
                {/* Line */}
                {i < JOBS.length - 1 && (
                  <div
                    style={{
                      width: '2px',
                      height: '48px',
                      background: '#2A2F2C',
                      marginTop: '4px',
                    }}
                  />
                )}
              </div>

              {/* Job info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontFamily: 'JetBrains Mono',
                  paddingBottom: i < JOBS.length - 1 ? '36px' : '0',
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    color: '#F6833B',
                  }}
                >
                  {job.hash}
                </span>
                <span
                  style={{
                    fontSize: '24px',
                    color: '#E8E4D9',
                  }}
                >
                  {job.company}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#8A8680',
                  }}
                >
                  {job.period}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '16px',
              color: '#8A8680',
            }}
          >
            git log --oneline
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
