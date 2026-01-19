import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getProject, getProjectSlugs } from '@/lib/projects';

export const alt = 'Ryan Waits';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return new ImageResponse(
      <div style={{ background: '#1A1F1C', width: '100%', height: '100%' }} />,
      size
    );
  }

  const fontsDir = join(process.cwd(), 'public', 'fonts');
  const [playfairData, jetbrainsData] = await Promise.all([
    readFile(join(fontsDir, 'PlayfairDisplay-Medium.ttf')),
    readFile(join(fontsDir, 'JetBrainsMono-Medium.ttf')),
  ]);

  // Different visual for each project
  if (slug === 'doccov') {
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
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                [WORK/{slug.toUpperCase()}]
              </span>
            </div>
            {/* Status badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: project.statusColor,
                }}
              />
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '16px',
                  color: project.statusColor,
                  letterSpacing: '0.1em',
                }}
              >
                {project.status}
              </span>
            </div>
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
                fontFamily: 'JetBrains Mono',
                fontSize: '64px',
                color: '#E8E4D9',
                lineHeight: 1.1,
              }}
            >
              {project.name}
            </span>
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '24px',
                color: '#8A8680',
              }}
            >
              {project.tagline}
            </span>

            {/* Coverage bar visualization */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                {/* Progress bar */}
                <div
                  style={{
                    display: 'flex',
                    width: '400px',
                    height: '24px',
                    background: '#2A2F2C',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '42%',
                      height: '100%',
                      background: '#F6833B',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '24px',
                    color: '#E8E4D9',
                  }}
                >
                  42%
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '18px',
                  color: '#8A8680',
                }}
              >
                23 exports need documentation
              </span>
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

  // Secondlayer design with TypeScript interface hint
  if (slug === 'secondlayer') {
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
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  color: '#73DACA',
                  letterSpacing: '0.1em',
                }}
              >
                [WORK/{slug.toUpperCase()}]
              </span>
            </div>
            {/* Status badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: project.statusColor,
                }}
              />
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '16px',
                  color: project.statusColor,
                  letterSpacing: '0.1em',
                }}
              >
                {project.status}
              </span>
            </div>
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
                fontFamily: 'JetBrains Mono',
                fontSize: '64px',
                color: '#E8E4D9',
                lineHeight: 1.1,
              }}
            >
              {project.name}
            </span>
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '24px',
                color: '#8A8680',
              }}
            >
              {project.tagline}
            </span>

            {/* TypeScript interface snippet */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '24px',
                padding: '20px 24px',
                background: '#121714',
                borderRadius: '8px',
                border: '1px solid #2A2F2C',
                gap: '4px',
              }}
            >
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '18px',
                }}
              >
                <span style={{ color: '#BB9AF7' }}>interface</span>
                <span style={{ color: '#E8E4D9' }}> NftTrait </span>
                <span style={{ color: '#8A8680' }}>{'{'}</span>
              </span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '18px',
                  paddingLeft: '24px',
                }}
              >
                <span style={{ color: '#7DCFFF' }}>transfer</span>
                <span style={{ color: '#8A8680' }}>(</span>
                <span style={{ color: '#E8E4D9' }}>id</span>
                <span style={{ color: '#8A8680' }}>: </span>
                <span style={{ color: '#73DACA' }}>uint</span>
                <span style={{ color: '#8A8680' }}>): </span>
                <span style={{ color: '#73DACA' }}>Response</span>
                <span style={{ color: '#8A8680' }}>;</span>
              </span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '18px',
                }}
              >
                <span style={{ color: '#8A8680' }}>{'}'}</span>
              </span>
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

  // OpenPKG design with JSON hint
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
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              [WORK/{slug.toUpperCase()}]
            </span>
          </div>
          {/* Status badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: project.statusColor,
              }}
            />
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '16px',
                color: project.statusColor,
                letterSpacing: '0.1em',
              }}
            >
              {project.status}
            </span>
          </div>
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
              fontFamily: 'JetBrains Mono',
              fontSize: '64px',
              color: '#E8E4D9',
              lineHeight: 1.1,
            }}
          >
            {project.name}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '24px',
              color: '#8A8680',
            }}
          >
            {project.tagline}
          </span>

          {/* JSON snippet hint */}
          <div
            style={{
              display: 'flex',
              marginTop: '24px',
              padding: '20px 24px',
              background: '#121714',
              borderRadius: '8px',
              border: '1px solid #2A2F2C',
            }}
          >
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '20px',
                color: '#8A8680',
              }}
            >
              <span style={{ color: '#8A8680' }}>{'{ '}</span>
              <span style={{ color: '#9ECE6A' }}>"exports"</span>
              <span style={{ color: '#8A8680' }}>: </span>
              <span style={{ color: '#F6833B' }}>156</span>
              <span style={{ color: '#8A8680' }}>, </span>
              <span style={{ color: '#9ECE6A' }}>"types"</span>
              <span style={{ color: '#8A8680' }}>: </span>
              <span style={{ color: '#F6833B' }}>34</span>
              <span style={{ color: '#8A8680' }}>, </span>
              <span style={{ color: '#9ECE6A' }}>"interfaces"</span>
              <span style={{ color: '#8A8680' }}>: </span>
              <span style={{ color: '#F6833B' }}>23</span>
              <span style={{ color: '#8A8680' }}>{' }'}</span>
            </span>
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
