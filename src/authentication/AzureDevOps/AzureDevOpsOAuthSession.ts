import { AuthenticationSession, AuthenticationSessionAccountInformation } from 'vscode';

export class AzureDevOpsOAuthSession implements AuthenticationSession {
  id: string;
  account: AuthenticationSessionAccountInformation;
  scopes: readonly string[];
  accessToken: string;
  organization: string;

  constructor(token: string, organization: string, userId?: string) {
    this.id = 'azuredevopsoauth';
    this.accessToken = token;
    this.organization = organization;
    this.account = { 
      id: userId || 'azure-devops-user', 
      label: `Azure DevOps (${organization})` 
    };
    this.scopes = ['vso.build', 'vso.code', 'vso.graph', 'vso.project'];
  }
}