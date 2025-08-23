# GitHubContributionChart Component

A React component that displays a GitHub-style contribution chart showing user activity over time using GitHub's GraphQL API.

## Features

- ✅ **Authentic GitHub Design**: Uses real GitHub contribution colors and layout
- ✅ **GraphQL Integration**: Fetches data using GitHub's official GraphQL API
- ✅ **Real GitHub Colors**: Uses actual colors returned by GitHub's API
- ✅ **Interactive Time Filters**: Last year, 6 months, and 3 months views
- ✅ **Exact Contribution Data**: Shows real contribution counts per day
- ✅ **Auto-scroll**: Automatically scrolls to current month
- ✅ **Hover Tooltips**: Shows contribution count and date on hover
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Customizable**: Multiple props for different use cases
- ✅ **TypeScript Support**: Fully typed with TypeScript

## Usage

### Basic Usage

```tsx
import GitHubContributionChart from '@/components/GitHubContributionChart';

function MyPage() {
  return (
    <div>
      <GitHubContributionChart />
    </div>
  );
}
```

### Custom Styling

```tsx
<GitHubContributionChart 
  className="bg-purple-900/20 border-purple-500/30" 
  showHeader={true}
  showFilters={true}
  showLegend={true}
/>
```

### Minimal Version

```tsx
<GitHubContributionChart 
  className="bg-transparent border-gray-600" 
  showHeader={false}
  showFilters={false}
  showLegend={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional CSS classes for styling |
| `showHeader` | `boolean` | `true` | Show title and contribution count |
| `showFilters` | `boolean` | `true` | Show time period filter buttons |
| `showLegend` | `boolean` | `true` | Show intensity legend and hover text |

## Data Source

The component fetches data from the backend API endpoint using GitHub's GraphQL API:
- **Endpoint**: `/demo/api/contributions/<username>?period=<period>`
- **GraphQL Query**: `contributionsCollection.contributionCalendar`
- **Authentication**: Uses GitHub OAuth token with `read:user` scope
- **Data**: Authentic GitHub contribution data with exact counts and colors
- **Features**: Total contributions, daily counts, contribution colors, language stats

## Dependencies

- React 18+
- Next.js 13+
- Tailwind CSS
- GitHub OAuth authentication (via AuthContext)

## Authentication

The component requires a logged-in user with GitHub OAuth including the `read:user` scope for GraphQL API access. It will show:
- Login prompt if user is not authenticated
- Loading state while fetching data
- Error state if data cannot be fetched or if the token lacks proper scopes

## Color Scheme

Uses GitHub's official contribution colors directly from their GraphQL API:
- Colors are dynamically fetched from GitHub's `contributionCalendar` data
- Fallback mapping for older data or edge cases:
  - `#0d1117` - No contributions (0)
  - `#0e4429` - Low activity (1-2)
  - `#006d32` - Medium-low activity (3-4)
  - `#26a641` - Medium-high activity (5-6)
  - `#39d353` - High activity (7+)

## Auto-scroll Behavior

The chart automatically scrolls to show the current month based on:
- January-May: 0% scroll
- June-July: 30% scroll
- August-October: 40% scroll
- November: 45% scroll
- December: 100% scroll

## Performance

- Optimized rendering with proper React patterns
- Efficient data processing for large datasets
- Responsive layout that adapts to container size
- Smooth animations and transitions

## Examples

The component is used in:
1. **Main Dashboard** (`/dashboard`) - Integrated into GitHub profile section
2. **Standalone Page** (`/contribution-chart`) - Dedicated page with examples
3. **Custom Implementations** - Can be embedded anywhere in the app

## Development

To modify the component:
1. Edit `src/components/GitHubContributionChart.tsx`
2. Test with different prop combinations
3. Ensure TypeScript types are updated
4. Test responsive behavior across devices
