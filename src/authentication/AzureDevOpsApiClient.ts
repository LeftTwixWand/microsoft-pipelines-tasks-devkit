import * as azdev from 'azure-devops-node-api';
import * as vscode from 'vscode';

export class AzureDevOpsApiClient {
  private connection: azdev.WebApi;

  constructor(accessToken: string, organization: string) {
    // Initialize the connection
    this.connection = new azdev.WebApi(
      `https://dev.azure.com/${organization}`,
      azdev.getBearerHandler(accessToken)
    );
  }

  /**
   * Get the Build API client
   */
  public async getBuildApi() {
    return this.connection.getBuildApi();
  }

  /**
   * Get the Git API client
   */
  public async getGitApi() {
    return this.connection.getGitApi();
  }

  /**
   * Get the Core API client
   */
  public async getCoreApi() {
    return this.connection.getCoreApi();
  }

  /**
   * Get the Task API client
   */
  public async getTaskApi() {
    return this.connection.getTaskApi();
  }

  /**
   * Get the Task Agent API client
   */
  public async getTaskAgentApi() {
    return this.connection.getTaskAgentApi();
  }

  /**
   * Create an instance of AzureDevOpsApiClient from the current auth session
   */
  public static async fromSession(): Promise<AzureDevOpsApiClient | undefined> {
    try {
      // Try to get existing OAuth session first
      let session = await vscode.authentication.getSession('azuredevopsoauth', [], { createIfNone: false });
      
      if (!session) {
        return undefined;
      }
      
      const organization = (session as any).organization || '';
      
      if (!organization) {
        // If organization is not available in the session for PAT, ask the user
        const orgName = await vscode.window.showInputBox({
          prompt: 'Enter your Azure DevOps organization name',
          placeHolder: 'organization',
          ignoreFocusOut: true,
        });
        
        if (!orgName) {
          return undefined;
        }
        
        return new AzureDevOpsApiClient(session.accessToken, orgName);
      }
      
      return new AzureDevOpsApiClient(session.accessToken, organization);
    } catch (error) {
      console.error('Failed to create API client from session:', error);
      return undefined;
    }
  }
}