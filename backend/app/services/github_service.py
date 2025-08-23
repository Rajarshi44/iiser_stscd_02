from github import Github
import requests

class GitHubIntegration:
    def __init__(self, client_id, client_secret, redirect_uri):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
    
    def get_oauth_url(self, state=None):
        scopes = "repo,user:email,read:user"
        url = f"https://github.com/login/oauth/authorize?"
        url += f"client_id={self.client_id}&redirect_uri={self.redirect_uri}&scope={scopes}"
        if state:
            url += f"&state={state}"
        
        # Debug logging
        print(f"🔗 Generated OAuth URL:")
        print(f"   Client ID: {self.client_id}")
        print(f"   Redirect URI: {self.redirect_uri}")
        print(f"   Scopes: {scopes}")
        print(f"   State: {state}")
        print(f"   Full URL: {url}")
        
        return url
    
    def exchange_code_for_token(self, code):
        res = requests.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "redirect_uri": self.redirect_uri,
            },
            headers={"Accept": "application/json"}
        )
        return res.json()

    def get_user_info(self, access_token):
        """Get authenticated user information from GitHub"""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        response = requests.get("https://api.github.com/user", headers=headers)
        if response.status_code == 200:
            return response.json()
        return None

    def get_user_repositories(self, access_token):
        """Get user's repositories from GitHub"""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        response = requests.get("https://api.github.com/user/repos", headers=headers)
        if response.status_code == 200:
            repos = response.json()
            # Return simplified repo data
            return [{
                "id": repo["id"],
                "name": repo["name"],
                "full_name": repo["full_name"],
                "description": repo["description"],
                "html_url": repo["html_url"],
                "clone_url": repo["clone_url"],
                "language": repo["language"],
                "stargazers_count": repo["stargazers_count"],
                "forks_count": repo["forks_count"],
                "updated_at": repo["updated_at"],
                "private": repo["private"]
            } for repo in repos]
        return []

    def get_repository_details(self, access_token, owner, repo_name):
        """Get detailed information about a specific repository"""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        response = requests.get(f"https://api.github.com/repos/{owner}/{repo_name}", headers=headers)
        if response.status_code == 200:
            return response.json()
        return None

    def create_repository(self, access_token, name, description="", private=False):
        """Create a new repository on GitHub"""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        data = {
            "name": name,
            "description": description,
            "private": private,
            "auto_init": True
        }
        
        response = requests.post("https://api.github.com/user/repos", headers=headers, json=data)
        if response.status_code == 201:
            return response.json()
        return None
