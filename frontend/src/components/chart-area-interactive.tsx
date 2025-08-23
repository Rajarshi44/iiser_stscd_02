"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "A GitHub-style contribution graph";

// Generate GitHub-style contribution data for the past year
const generateContributionData = () => {
  const contributions: Array<{
    date: string;
    count: number;
    level: number;
  }> = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 365);

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Generate random contribution count (0-10)
    const count = Math.floor(Math.random() * 11);

    contributions.push({
      date: date.toISOString().split("T")[0],
      count,
      level:
        count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4,
    });
  }

  return contributions;
};

const contributionData = generateContributionData();

type ContributionDay = {
  date: string;
  count: number;
  level: number;
} | null;

// Group contributions by week
const groupByWeeks = (data: typeof contributionData): ContributionDay[][] => {
  const weeks: ContributionDay[][] = [];
  const startDate = new Date(data[0].date);
  const startDay = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Add empty days at the beginning if the year doesn't start on Sunday
  const week: ContributionDay[] = Array(7).fill(null);
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

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("1y");
  const [hoveredDay, setHoveredDay] = React.useState<{
    date: string;
    count: number;
  } | null>(null);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("6m");
    }
  }, [isMobile]);

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

  const filteredData = React.useMemo(() => {
    const now = new Date();
    const monthsToShow = timeRange === "1y" ? 12 : timeRange === "6m" ? 6 : 3;
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - monthsToShow);

    return contributionData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [timeRange]);

  const filteredWeeklyData = React.useMemo(() => {
    return groupByWeeks(filteredData);
  }, [filteredData]);

  const totalContributions = filteredData.reduce(
    (sum, day) => sum + day.count,
    0
  );

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="@container/card bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white">GitHub Contributions</CardTitle>
        <CardDescription className="text-purple-200/80">
          <span className="hidden @[540px]/card:block">
            {totalContributions} contributions in the last{" "}
            {timeRange === "1y"
              ? "year"
              : timeRange === "6m"
              ? "6 months"
              : "3 months"}
          </span>
          <span className="@[540px]/card:hidden text-purple-200/80">
            {totalContributions} contributions
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="1y">Last year</ToggleGroupItem>
            <ToggleGroupItem value="6m">Last 6 months</ToggleGroupItem>
            <ToggleGroupItem value="3m">Last 3 months</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="1y" className="rounded-lg">
                Last year
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                Last 6 months
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                Last 3 months
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="relative">
          {/* Month labels */}
          <div className="flex mb-2 text-xs text-purple-200/60">
            <div className="w-8"></div>
            {filteredWeeklyData.map((week, weekIndex) => {
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
              {filteredWeeklyData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 mb-[1px] mr-[1px] rounded-sm border transition-colors ${
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
          <div className="flex items-center justify-between mt-4 text-xs text-purple-200/60">
            <div>
              {hoveredDay ? (
                <span className="text-white">
                  {hoveredDay.count} contribution
                  {hoveredDay.count !== 1 ? "s" : ""} on{" "}
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
                    className={`w-3 h-3 rounded-sm ${getContributionColor(
                      level
                    )}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
