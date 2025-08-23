#!/usr/bin/env python3
"""
Test script for GitHub GraphQL contributions API

This script demonstrates how to fetch contribution data using GitHub's GraphQL API.
It can be used to test the endpoint before integrating with the frontend.

Usage:
    python test_graphql_contributions.py <github_token> <username>

Example:
    python test_graphql_contributions.py ghp_xxxxxxxxxxxx octocat

Requirements:
    - GitHub personal access token with 'read:user' scope
    - Python requests library
"""

import sys
import json
import requests
from datetime import datetime, timedelta

def test_graphql_contributions(token, username):
    """Test GitHub GraphQL contributions API"""
    
    # GraphQL query (same as used in the backend)
    query = """
    query($userName: String!) { 
      user(login: $userName){
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
        repositories(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}, ownerAffiliations: OWNER) {
          nodes {
            primaryLanguage {
              name
            }
          }
        }
      }
    }
    """
    
    variables = {"userName": username}
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    payload = {
        "query": query,
        "variables": variables
    }
    
    print(f"🔍 Testing GitHub GraphQL API for user: {username}")
    print(f"🔗 Endpoint: https://api.github.com/graphql")
    print(f"🔑 Token: {token[:8]}..." + "*" * (len(token) - 8))
    print()
    
    try:
        response = requests.post(
            "https://api.github.com/graphql",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Request failed: {response.text}")
            return False
        
        data = response.json()
        
        if "errors" in data:
            print(f"❌ GraphQL errors: {data['errors']}")
            return False
        
        # Extract and analyze data
        contribution_calendar = data["data"]["user"]["contributionsCollection"]["contributionCalendar"]
        total_contributions = contribution_calendar["totalContributions"]
        weeks_data = contribution_calendar["weeks"]
        
        print(f"✅ Successfully fetched contribution data!")
        print(f"📈 Total contributions: {total_contributions}")
        print(f"📅 Weeks of data: {len(weeks_data)}")
        
        # Count days with contributions
        days_with_contributions = 0
        total_days = 0
        contribution_counts = {}
        
        for week in weeks_data:
            for day in week["contributionDays"]:
                total_days += 1
                count = day["contributionCount"]
                if count > 0:
                    days_with_contributions += 1
                
                # Track contribution level distribution
                if count == 0:
                    level = "None"
                elif count <= 2:
                    level = "Low (1-2)"
                elif count <= 4:
                    level = "Medium (3-4)"
                elif count <= 6:
                    level = "High (5-6)"
                else:
                    level = "Very High (7+)"
                
                contribution_counts[level] = contribution_counts.get(level, 0) + 1
        
        print(f"📊 Activity summary:")
        print(f"   - Total days: {total_days}")
        print(f"   - Days with contributions: {days_with_contributions}")
        print(f"   - Activity percentage: {(days_with_contributions/total_days)*100:.1f}%")
        
        print(f"📊 Contribution level distribution:")
        for level, count in contribution_counts.items():
            percentage = (count/total_days)*100
            print(f"   - {level}: {count} days ({percentage:.1f}%)")
        
        # Language analysis
        repositories = data["data"]["user"]["repositories"]["nodes"]
        languages = {}
        for repo in repositories:
            if repo["primaryLanguage"]:
                lang = repo["primaryLanguage"]["name"]
                languages[lang] = languages.get(lang, 0) + 1
        
        print(f"💻 Top languages (from recent 20 repos):")
        for lang, count in sorted(languages.items(), key=lambda x: x[1], reverse=True):
            print(f"   - {lang}: {count} repositories")
        
        # Sample recent days
        print(f"📅 Sample recent contribution days:")
        recent_days = []
        for week in weeks_data[-4:]:  # Last 4 weeks
            for day in week["contributionDays"]:
                if day["contributionCount"] > 0:
                    recent_days.append(day)
        
        recent_days.sort(key=lambda x: x["date"], reverse=True)
        for day in recent_days[:10]:  # Show last 10 active days
            print(f"   - {day['date']}: {day['contributionCount']} contributions (color: {day['color']})")
        
        print(f"✅ GraphQL test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    if len(sys.argv) != 3:
        print("Usage: python test_graphql_contributions.py <github_token> <username>")
        print()
        print("Example: python test_graphql_contributions.py ghp_xxxxxxxxxxxx octocat")
        print()
        print("Note: GitHub token must have 'read:user' scope for GraphQL API access")
        sys.exit(1)
    
    token = sys.argv[1]
    username = sys.argv[2]
    
    success = test_graphql_contributions(token, username)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
