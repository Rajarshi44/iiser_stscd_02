'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/Authcontext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * A React component that displays a GitHub-style contribution chart showing user activity over time.
 * 
 * Uses GitHub's GraphQL API to fetch authentic contribution data including:
 * - Real contribution counts per day
 * - GitHub's actual intensity colors
 * - Total contributions count
 * - Contribution streaks calculation
 * 
 * Requires GitHub OAuth with 'read:user' scope for GraphQL API access.
 */

interface ContributionDay {
  date: string;
  count: number;
  level: number;
  color?: string; // GitHub's actual color from GraphQL
}

interface ContributionData {
  total_contributions: number;
  contribution_data: ContributionDay[];
  current_streak: number;
  longest_streak: number;
  languages: { [key: string]: number };
  username: string;
}

interface GitHubContributionChartProps {
  className?: string;
  showHeader?: boolean;
  showFilters?: boolean;
  showLegend?: boolean;
}

type ContributionDayWithHover = ContributionDay | null;

const GitHubContributionChart: React.FC<GitHubContributionChartProps> = ({
  className = '',
  showHeader = true,
  showFilters = true,
  showLegend = true
}) => {
  const isMobile = useIsMobile();
  const [selectedPeriod, setSelectedPeriod] = useState('1y');
  const [contributions, setContributions] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
  } | null>(null);
  const { user, getUserContributions } = useAuth();

  const periodMap: { [key: string]: string } = {
    '1y': 'year',
    '6m': '6months',
    '3m': '3months'
  };

  const periodLabels: { [key: string]: string } = {
    '1y': 'Last year',
    '6m': 'Last 6 months', 
    '3m': 'Last 3 months'
  };

  // Auto-set mobile default
  useEffect(() => {
    if (isMobile) {
      setSelectedPeriod('6m');
    }
  }, [isMobile]);

  // Get contribution color with improved purple theme to match chart-area-interactive
  const getContributionColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-purple-900/20 hover:bg-purple-900/30 border-purple-500/20";
      case 1:
        return "bg-purple-600/40 hover:bg-purple-600/50 border-purple-400/30";
      case 2:
        return "bg-purple-500/60 hover:bg-purple-500/70 border-purple-400/40";
      case 3:
        return "bg-purple-400/80 hover:bg-purple-400/90 border-purple-300/50";
      case 4:
        return "bg-purple-300 hover:bg-purple-300/90 border-purple-200/60";
      default:
        return "bg-purple-900/20 hover:bg-purple-900/30 border-purple-500/20";
    }
  };

  // Get style color for legend squares
  const getIntensityStyleColor = (level: number) => {
    switch (level) {
      case 0: return { backgroundColor: 'rgb(88 28 135 / 0.2)' };
      case 1: return { backgroundColor: 'rgb(147 51 234 / 0.4)' };
      case 2: return { backgroundColor: 'rgb(168 85 247 / 0.6)' };
      case 3: return { backgroundColor: 'rgb(196 181 253 / 0.8)' };
      case 4: return { backgroundColor: 'rgb(196 181 253)' };
      default: return { backgroundColor: 'rgb(88 28 135 / 0.2)' };
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group contributions by week (similar to chart-area-interactive)
  const groupByWeeks = (data: ContributionDay[]): (ContributionDay | null)[][] => {
    const weeks: (ContributionDay | null)[][] = [];
    if (!data.length) return weeks;
    
    const startDate = new Date(data[0].date);
    const startDay = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Add empty days at the beginning if the year doesn't start on Sunday
    const week: (ContributionDay | null)[] = Array(7).fill(null);
    let currentWeek = week.slice();

    data.forEach((contribution, index) => {
      const dayOfWeek = (startDay + index) % 7;
      currentWeek[dayOfWeek] = contribution;

      if (dayOfWeek === 6 || index === data.length - 1) {
        weeks.push(currentWeek);
        currentWeek = Array(7).fill(null);
      }
    });

    return weeks;
  };

  const getMonthLabels = (weeks: (ContributionDay | null)[][]) => {
    if (!contributions?.contribution_data || contributions.contribution_data.length === 0) return [];
    
    const labels = [];
    let currentMonth = -1;
    
    weeks.forEach((week, index) => {
      const firstDayOfWeek = week.find(day => day !== null);
      if (firstDayOfWeek) {
        const month = new Date(firstDayOfWeek.date).getMonth();
        if (month !== currentMonth) {
          labels.push({ month: months[month], weekIndex: index });
          currentMonth = month;
        }
      }
    });
    
    return labels;
  };

  const handlePeriodChange = async (period: string) => {
    if (!user) return;
    
    setSelectedPeriod(period);
    setLoading(true);
    
    try {
      const contributionsData = await getUserContributions(user.login, periodMap[period]);
      setContributions(contributionsData);
    } catch (error) {
      console.error('Error fetching contributions for period:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total contributions for the current period
  const totalContributions = contributions?.contribution_data?.reduce(
    (sum, day) => sum + day.count,
    0
  ) || 0;

  useEffect(() => {
    const fetchContributions = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const contributionsData = await getUserContributions(user.login, periodMap[selectedPeriod]);
        setContributions(contributionsData);
      } catch (error) {
        console.error('Error fetching contributions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [user, getUserContributions, selectedPeriod]);

  if (!user) {
    return (
      <Card className={`@container/card ${className}`}>
        <CardContent className="p-6">
          <div className="text-purple-200/60 text-center">Please log in to view contribution chart</div>
        </CardContent>
      </Card>
    );
  }

  const weeks = groupByWeeks(contributions?.contribution_data || []);
  const monthLabels = getMonthLabels(weeks);

  return (
    <Card className={`@container/card ${className}`}>
      {showHeader && (
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-white">GitHub Contributions</CardTitle>
              <CardDescription className="text-purple-200/80">
                <span className="hidden @[540px]/card:block">
                  {totalContributions} contributions in the {periodLabels[selectedPeriod]?.toLowerCase() || 'selected period'}
                </span>
                <span className="@[540px]/card:hidden text-purple-200/80">
                  {totalContributions} contributions
                </span>
              </CardDescription>
            </div>
            
            {showFilters && (
              <div className="flex gap-2">
                <ToggleGroup
                  type="single"
                  value={selectedPeriod}
                  onValueChange={(value) => value && handlePeriodChange(value)}
                  variant="outline"
                  className="hidden @[767px]/card:flex"
                >
                  <ToggleGroupItem value="1y" className="data-[state=on]:bg-purple-500/20 data-[state=on]:border-purple-400">
                    Last year
                  </ToggleGroupItem>
                  <ToggleGroupItem value="6m" className="data-[state=on]:bg-purple-500/20 data-[state=on]:border-purple-400">
                    Last 6 months
                  </ToggleGroupItem>
                  <ToggleGroupItem value="3m" className="data-[state=on]:bg-purple-500/20 data-[state=on]:border-purple-400">
                    Last 3 months
                  </ToggleGroupItem>
                </ToggleGroup>
                
                <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="flex w-40 @[767px]/card:hidden">
                    <SelectValue placeholder="Last year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="1y" className="rounded-lg">Last year</SelectItem>
                    <SelectItem value="6m" className="rounded-lg">Last 6 months</SelectItem>
                    <SelectItem value="3m" className="rounded-lg">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="text-purple-200/60 text-center py-8">Loading contributions...</div>
        ) : !contributions ? (
          <div className="text-purple-200/60 text-center py-8">No contribution data available</div>
        ) : (
          <div className="relative">
            {/* Month labels */}
            <div className="flex mb-2 text-xs text-purple-200/60">
              <div className="w-8"></div>
              {weeks.map((week, weekIndex) => {
                const firstDayOfWeek = week.find((day) => day !== null);
                if (!firstDayOfWeek)
                  return <div key={weekIndex} className="w-3 mx-[1px]"></div>;

                const date = new Date(firstDayOfWeek.date);
                const isFirstWeekOfMonth = date.getDate() <= 7;

                return (
                  <div key={weekIndex} className="w-3 mx-[1px] text-center">
                    {isFirstWeekOfMonth ? months[date.getMonth()] : ""}
                  </div>
                );
              })}
            </div>

            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col text-xs text-purple-200/60 mr-2">
                {days.map((day, index) => (
                  <div
                    key={day}
                    className="h-3 mb-[1px] leading-3 text-right w-6"
                  >
                    {index % 2 === 1 ? day : ""}
                  </div>
                ))}
              </div>

              {/* Contribution grid */}
              <div className="flex flex-wrap">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-3 h-3 mb-[1px] mr-[1px] rounded-sm border transition-colors cursor-pointer ${
                          day ? getContributionColor(day.level) : "bg-transparent"
                        }`}
                        onMouseEnter={() => {
                          if (day) {
                            setHoveredDay({ date: day.date, count: day.count });
                          }
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        title={
                          day
                            ? `${day.count} contributions on ${new Date(
                                day.date
                              ).toLocaleDateString()}`
                            : ""
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            {showLegend && (
              <div className="flex items-center justify-between mt-4 text-xs text-purple-200/60">
                <div>
                  {hoveredDay ? (
                    <span className="text-white">
                      {hoveredDay.count} contribution{hoveredDay.count !== 1 ? "s" : ""} on{" "}
                      {new Date(hoveredDay.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  ) : (
                    <span>Hover over a square to see details</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="w-3 h-3 rounded-sm border border-purple-500/20"
                        style={getIntensityStyleColor(level)}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>
            )}

            {/* Additional Stats */}
            {contributions && (contributions.current_streak > 0 || contributions.longest_streak > 0) && (
              <div className="flex gap-4 mt-4 text-sm">
                {contributions.current_streak > 0 && (
                  <div className="flex items-center gap-2 text-orange-400">
                    <span>🔥</span>
                    <span>{contributions.current_streak} day streak</span>
                  </div>
                )}
                {contributions.longest_streak > 0 && (
                  <div className="flex items-center gap-2 text-purple-400">
                    <span>📈</span>
                    <span>{contributions.longest_streak} longest streak</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GitHubContributionChart;
