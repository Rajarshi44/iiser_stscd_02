import { IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
        <CardHeader>
          <CardDescription className="text-purple-200/80">
            Profile Views
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white">
            45,678
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-green-500/30 bg-green-500/10 text-green-300"
            >
              <IconTrendingUp />
              +18.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-green-300">
            Trending up this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-purple-200/60">All time profile views</div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
        <CardHeader>
          <CardDescription className="text-purple-200/80">
            Total Commits
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white">
            2,847
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-green-500/30 bg-green-500/10 text-green-300"
            >
              <IconTrendingUp />
              +15.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-green-300">
            Active development this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-purple-200/60">
            All time commits across repositories
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
        <CardHeader>
          <CardDescription className="text-purple-200/80">
            Total Contributions
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white">
            1,847
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-green-500/30 bg-green-500/10 text-green-300"
            >
              <IconTrendingUp />
              +22.4%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-green-300">
            Consistent daily activity <IconTrendingUp className="size-4" />
          </div>
          <div className="text-purple-200/60">
            This year&apos;s contributions
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
        <CardHeader>
          <CardDescription className="text-purple-200/80">
            Total PRs
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white">
            127
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-green-500/30 bg-green-500/10 text-green-300"
            >
              <IconTrendingUp />
              +8.7%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-green-300">
            Active collaboration this month{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-purple-200/60">Pull requests created</div>
        </CardFooter>
      </Card>
    </div>
  );
}
