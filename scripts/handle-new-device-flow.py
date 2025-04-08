import os
import sys
import re
import subprocess
import time
from github import Github, GithubException, UnknownObjectException

def parse_issue_body(body):
    device_id = ''
    brand = ''
    current_field = None
    
    if not body:
        print("::error::Issue body is empty")
        sys.exit(1)

    print("Parsing issue body...")
    lines = body.split('\n')
    
    for line in lines:
        line = line.strip()
        if line.startswith('### Device ID'):
            current_field = 'id'
            continue
        elif line.startswith('### Brand'):
            current_field = 'brand'
            continue
            
        if current_field == 'id' and line and not line.startswith('###'):
            device_id = line
            current_field = None
        elif current_field == 'brand' and line and not line.startswith('###'):
            brand = line
            current_field = None
            
        if device_id and brand:
            break
            
    if not device_id or not brand:
        print(f"::error::Failed to extract device ID or brand from issue body. Found ID: '{device_id}', Brand: '{brand}'")
        print(f"Issue Body (first 500 chars):\n{body[:500]}") 
        sys.exit(1)
        
    print(f"Extracted device ID: {device_id}, Brand: {brand}")
    return device_id.lower(), brand.lower()

def run_process_script(issue_body_path):
    print(f"Running process-new-machine.py with {issue_body_path}...")
    try:
        script_path = os.path.join(os.path.dirname(__file__), 'process-new-machine.py')
        process = subprocess.run(
            [sys.executable, script_path, issue_body_path],
            check=True,
            capture_output=True,
            text=True
        )
        print(f"process-new-machine.py output:\n{process.stdout}")
    except subprocess.CalledProcessError as e:
        print(f"::error::process-new-machine.py failed: {e}")
        print(f"Stderr:\n{e.stderr}")
        print(f"Stdout:\n{e.stdout}")
        sys.exit(1)
    except FileNotFoundError:
        print(f"::error::Could not find script at {script_path}. Ensure it's in the scripts/ directory.")
        sys.exit(1)


def main():
    token = os.environ.get("GITHUB_TOKEN")
    issue_number = int(os.environ.get("ISSUE_NUMBER"))
    repo_name = os.environ.get("GITHUB_REPOSITORY")

    if not token:
        print("::error::GITHUB_TOKEN not set")
        sys.exit(1)
    if not issue_number:
        print("::error::ISSUE_NUMBER not set")
        sys.exit(1)
    if not repo_name:
         print("::error::GITHUB_REPOSITORY not set")
         sys.exit(1)

    g = Github(token)
    
    try:
        print(f"Fetching repository {repo_name}")
        repo = g.get_repo(repo_name)
        print(f"Fetching issue #{issue_number}")
        issue = repo.get_issue(issue_number)
    except GithubException as e:
        print(f"::error::Failed to fetch repo or issue: {e}")
        sys.exit(1)

    issue_body = issue.body
    device_id, brand = parse_issue_body(issue_body)
    
    issue_body_file = "issue_body_temp.txt"
    with open(issue_body_file, "w") as f:
        f.write(issue_body)
        
    run_process_script(issue_body_file)
    
    os.remove(issue_body_file)

    branch_name = f"new-device/{device_id}"
    file_path = f"data/devices/{brand}/{device_id}.yaml"
    commit_message = f"Add device data for {brand} {device_id}"
    pr_title = f"Add Device: {brand} {device_id}"
    pr_body = f"Adds data for **{brand} {device_id}** based on issue #{issue_number}.\n\nCloses #{issue_number}"
    
    print(f"Generated file path: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            yaml_content = f.read()
    except FileNotFoundError:
        print(f"::error::Generated YAML file not found at {file_path} after running process-new-machine.py")
        sys.exit(1)
        
    try:
        print("Getting main branch SHA...")
        source_branch = repo.get_branch("main")
        source_sha = source_branch.commit.sha
        print(f"Got main branch SHA: {source_sha}")
        
        branch_exists = False
        try:
            print(f"Checking if branch '{branch_name}' exists...")
            repo.get_branch(branch_name)
            print(f"Branch '{branch_name}' already exists.")
            branch_exists = True
        except GithubException as e:
            if e.status == 404:
                print(f"Branch '{branch_name}' not found (GithubException Status 404), proceeding with creation.")
                branch_exists = False
            else:
                print(f"::error::Unexpected GitHub error checking for branch '{branch_name}': {e}")
                print(f"Status: {e.status}, Data: {e.data}")
                sys.exit(1)
        except Exception as e:
            print(f"::error::Non-GitHub error checking for branch '{branch_name}': {e}")
            sys.exit(1)
            
        if not branch_exists:
            try:
                print(f"Attempting to create ref 'refs/heads/{branch_name}' from sha {source_sha}...")
                repo.create_git_ref(ref=f"refs/heads/{branch_name}", sha=source_sha)
                print("Branch ref creation initiated. Verifying availability...")
            except GithubException as create_error:
                print(f"::error::Failed to create branch '{branch_name}' directly: {create_error}")
                print(f"Status: {create_error.status}")
                print(f"Data: {create_error.data}")
                sys.exit(1) 

            max_retries = 5
            retry_delay = 3 
            verified = False
            for attempt in range(max_retries):
                try:
                    time.sleep(retry_delay)
                    repo.get_branch(branch_name)
                    print(f"Branch '{branch_name}' confirmed available.")
                    verified = True
                    break 
                except GithubException as verify_error:
                    if verify_error.status == 404 and attempt < max_retries - 1:
                        print(f"Branch not yet available (404), retrying ({attempt + 1}/{max_retries})...")
                    elif attempt < max_retries - 1:
                         print(f"::warning::Error verifying branch '{branch_name}' ({verify_error.status}), retrying ({attempt + 1}/{max_retries})...")
                    else:
                        print(f"::error::Branch '{branch_name}' verification failed after multiple retries: {verify_error}")
                        sys.exit(1) 
                except Exception as verify_e:
                    print(f"::error::Unexpected error during branch verification loop: {verify_e}")
                    sys.exit(1)

            if not verified:
                print(f"::error::Could not verify branch '{branch_name}' creation after retries.")
                sys.exit(1)

        try:
            print(f"Checking for existing file '{file_path}' on branch '{branch_name}'...")
            existing_file_content = repo.get_contents(file_path, ref=branch_name)
            existing_file_sha = existing_file_content.sha
            print(f"File exists (SHA: {existing_file_sha}). Will update.")
            print("File update logic using Git Data API is not implemented in this refactor yet.")
            print("Proceeding assuming creation path...")
            existing_file_sha = None
        except UnknownObjectException:
            print("File does not exist. Will create using Git Data API.")
            existing_file_sha = None
            
        try:
            print(f"--- Preparing Git Data operations for {file_path} on {branch_name} ---")
            
            print("Creating git blob...")
            blob = repo.create_git_blob(yaml_content, "utf-8")
            print(f"Blob created: {blob.sha}")

            print("Getting latest commit on branch...")
            branch_ref = repo.get_git_ref(f"heads/{branch_name}")
            latest_commit_sha = branch_ref.object.sha
            latest_commit = repo.get_git_commit(latest_commit_sha)
            print(f"Latest commit SHA: {latest_commit_sha}")

            base_tree_sha = latest_commit.tree.sha
            print(f"Base tree SHA: {base_tree_sha}")

            element = {
                'path': file_path,
                'mode': '100644',
                'type': 'blob',
                'sha': blob.sha
            }

            print("Creating new git tree...")
            new_tree = repo.create_git_tree([element], base_tree=base_tree_sha) 
            print(f"New tree SHA: {new_tree.sha}")

            print("Creating new git commit...")
            new_commit = repo.create_git_commit(
                message=commit_message,
                tree=new_tree,
                parents=[latest_commit]
            )
            print(f"New commit SHA: {new_commit.sha}")

            print(f"Updating branch reference '{branch_name}' to {new_commit.sha}...")
            branch_ref.edit(sha=new_commit.sha)
            print(f"Branch reference updated successfully.")
            update_result = {'commit': new_commit}

        except GithubException as git_data_error:
            print(f"::error::GitHub error during Git Data operations: {git_data_error}")
            print(f"Status: {git_data_error.status}, Data: {git_data_error.data}")
            sys.exit(1)
        except Exception as git_data_e:
            print(f"::error::Unexpected error during Git Data operations: {type(git_data_e).__name__}")
            print(f"Error details: {repr(git_data_e)}")
            sys.exit(1)

        time.sleep(3) 

        print(f"Checking for existing PRs for head branch '{branch_name}'...")
        pulls = repo.get_pulls(state='open', head=f'{repo.owner.login}:{branch_name}', base='main')
        
        pr = None
        if pulls.totalCount > 0:
            pr = pulls[0]
            print(f"PR #{pr.number} already exists for this branch.")
        else:
            print("Creating Pull Request...")
            pr = repo.create_pull(
                title=pr_title,
                body=pr_body,
                head=branch_name,
                base="main",
                maintainer_can_modify=True
            )
            print(f"Created PR #{pr.number}")

            print("Adding 'automated-pr' label...")
            pr.add_to_labels('automated-pr')
            print("Label added.")
        
    except GithubException as e:
        print(f"::error::Outer GitHub API error: {e}")
        print(f"Status: {e.status}")
        print(f"Data: {e.data}")
        sys.exit(1)
    except Exception as e:
        print(f"::error::Outer unexpected error: {type(e).__name__} - {repr(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 