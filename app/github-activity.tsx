'use client';

import { useEffect, useState } from 'react';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionWeek {
  days: ContributionDay[];
}

// Uses CSS variables for theming (--contrib-0 through --contrib-4)
const CONTRIBUTION_LEVELS = [0, 1, 2, 3, 4] as const;

function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

export function GitHubActivity({ username = 'ryanwaits' }: { username?: string }) {
  const [weeks, setWeeks] = useState<ContributionWeek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContributions() {
      try {
        // Fetch from github-contributions-api (reliable third-party service)
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
        );
        const data = await response.json();

        if (data.contributions && Array.isArray(data.contributions)) {
          // API returns array of { date, count, level } objects
          // Group into weeks (7 days each)
          const contributions = data.contributions;
          const weeksData: ContributionWeek[] = [];

          // Take last 52 weeks
          const startIndex = Math.max(0, contributions.length - 364);
          const relevantContributions = contributions.slice(startIndex);

          // Find the first Sunday to align weeks properly
          let firstSundayIndex = 0;
          for (let i = 0; i < relevantContributions.length; i++) {
            const date = new Date(relevantContributions[i].date);
            if (date.getDay() === 0) {
              firstSundayIndex = i;
              break;
            }
          }

          const alignedContributions = relevantContributions.slice(firstSundayIndex);

          for (let i = 0; i < alignedContributions.length; i += 7) {
            const weekDays = alignedContributions.slice(i, i + 7);
            if (weekDays.length === 7) {
              weeksData.push({
                days: weekDays.map((day: { date: string; count: number }) => ({
                  date: day.date,
                  count: day.count,
                  level: getContributionLevel(day.count),
                })),
              });
            }
          }

          // Limit to 52 weeks
          setWeeks(weeksData.slice(-52));
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch GitHub contributions:', error);
        // Fallback: generate empty grid
        const emptyWeeks: ContributionWeek[] = [];
        for (let week = 0; week < 52; week++) {
          const days: ContributionDay[] = [];
          for (let day = 0; day < 7; day++) {
            days.push({ date: '', count: 0, level: 0 });
          }
          emptyWeeks.push({ days });
        }
        setWeeks(emptyWeeks);
        setLoading(false);
      }
    }

    fetchContributions();
  }, [username]);

  const cellSize = 10;
  const cellGap = 3;

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse flex justify-between" style={{ gap: cellGap }}>
          {Array.from({ length: 52 }).map((_, i) => (
            <div key={i} className="flex flex-col" style={{ gap: cellGap }}>
              {Array.from({ length: 7 }).map((_, j) => (
                <div
                  key={j}
                  className="rounded-[2px]"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: 'var(--contrib-0)',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between" style={{ gap: cellGap }}>
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col" style={{ gap: cellGap }}>
            {week.days.map((day, dayIdx) => (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className="rounded-[2px]"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: `var(--contrib-${day.level})`,
                }}
                title={day.date ? `${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}` : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
