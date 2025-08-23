'use client';

import React from 'react';
import GitHubContributionChart from '@/components/GitHubContributionChart';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { SiteHeader } from '@/components/site-header';

export default function ContributionChartPage() {
  return (
    <AuroraBackground className="dark min-h-screen">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">GitHub Contribution Chart</h1>
            <p className="text-gray-400">
              Interactive GitHub-style contribution chart showing your coding activity over time.
            </p>
          </div>

          {/* Full-featured chart */}
          <GitHubContributionChart className="mb-8" />

          {/* Compact version without header */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Compact Version</h2>
            <GitHubContributionChart 
              className="bg-gray-800/50 border-gray-700" 
              showHeader={false}
              showFilters={false}
            />
          </div>

          {/* Minimal version */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Minimal Version</h2>
            <GitHubContributionChart 
              className="bg-gray-800/30 border-gray-600" 
              showHeader={false}
              showFilters={false}
              showLegend={false}
            />
          </div>

          {/* Usage Examples */}
          <div className="mt-12 p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Usage Examples</h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">Basic Usage:</h3>
                <pre className="bg-gray-800 p-3 rounded text-green-400 overflow-x-auto">
{`import GitHubContributionChart from '@/components/GitHubContributionChart';

<GitHubContributionChart />`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">Custom Styling:</h3>
                <pre className="bg-gray-800 p-3 rounded text-green-400 overflow-x-auto">
{`<GitHubContributionChart 
  className="bg-purple-900/20 border-purple-500/30" 
  showHeader={true}
  showFilters={true}
  showLegend={true}
/>`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Minimal Version:</h3>
                <pre className="bg-gray-800 p-3 rounded text-green-400 overflow-x-auto">
{`<GitHubContributionChart 
  className="bg-transparent border-gray-600" 
  showHeader={false}
  showFilters={false}
  showLegend={false}
/>`}
                </pre>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-white mb-2">Props:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3">Prop</th>
                      <th className="text-left py-2 px-3">Type</th>
                      <th className="text-left py-2 px-3">Default</th>
                      <th className="text-left py-2 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-2 px-3 font-mono text-green-400">className</td>
                      <td className="py-2 px-3">string</td>
                      <td className="py-2 px-3">""</td>
                      <td className="py-2 px-3">Additional CSS classes for styling</td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-2 px-3 font-mono text-green-400">showHeader</td>
                      <td className="py-2 px-3">boolean</td>
                      <td className="py-2 px-3">true</td>
                      <td className="py-2 px-3">Show title and contribution count</td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-2 px-3 font-mono text-green-400">showFilters</td>
                      <td className="py-2 px-3">boolean</td>
                      <td className="py-2 px-3">true</td>
                      <td className="py-2 px-3">Show time period filter buttons</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-green-400">showLegend</td>
                      <td className="py-2 px-3">boolean</td>
                      <td className="py-2 px-3">true</td>
                      <td className="py-2 px-3">Show intensity legend and hover text</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
