import { google } from 'googleapis';
import { Result, ok, err, fromPromise } from 'neverthrow';

export type GoogleAuth = InstanceType<typeof google.auth.OAuth2>;

export class GoogleService {
  static scopes = ['https://www.googleapis.com/auth/drive.file'];
  private oauth2Client: GoogleAuth | null = null;
  private lastRefreshTime: number | null = null;
  private readonly TOKEN_EXPIRY_HOURS = 12;

  constructor(
    private clientId: string | undefined,
    private clientSecret: string | undefined,
    private refreshToken: string | undefined
  ) {}

  private async initialize(): Promise<Result<string, Error>> {
    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      return err(
        new Error(
          'Missing required OAuth credentials: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN'
        )
      );
    }

    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret
    );

    this.oauth2Client.setCredentials({
      refresh_token: this.refreshToken,
    });

    return await this.refresh();
  }

  async refresh(): Promise<Result<string, Error>> {
    return fromPromise(this.oauth2Client!.refreshAccessToken(), (error) =>
      error instanceof Error
        ? error
        : new Error(`Failed to refresh access token: ${error}`)
    ).andThen(({ credentials }) => {
      this.oauth2Client!.setCredentials(credentials);
      if (!credentials.access_token) {
        return err(new Error('No access token received'));
      }
      this.lastRefreshTime = Date.now();
      return ok(credentials.access_token);
    });
  }

  private isTokenExpired(): boolean {
    if (!this.lastRefreshTime) {
      return true;
    }
    const hoursInMs = this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
    return Date.now() - this.lastRefreshTime > hoursInMs;
  }

  async getAuth(): Promise<Result<GoogleAuth, Error>> {
    if (!this.oauth2Client) await this.initialize();

    if (this.isTokenExpired()) {
      const refreshResult = await this.refresh();
      if (refreshResult.isErr()) {
        return err(refreshResult.error);
      }
    }

    return ok(this.oauth2Client!);
  }
}

export const service = new GoogleService(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REFRESH_TOKEN
);
