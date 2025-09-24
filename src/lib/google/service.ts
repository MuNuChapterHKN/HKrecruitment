import { google } from "googleapis";

export class GoogleService {
  static scopes = ["https://www.googleapis.com/auth/drive.file"];
  private credentials: any;
  private _auth: InstanceType<typeof google.auth.GoogleAuth>;

  constructor(private serviceAccountKey: string | undefined) {
    if (!this.serviceAccountKey)
      process.exit('No Google Service account provided');

    this.credentials = JSON.parse(this.serviceAccountKey);

    this._auth = new google.auth.GoogleAuth({
      credentials: this.credentials,
      scopes: GoogleService.scopes
    });
  }

  get auth() {
    return this._auth;
  }
}

export const service = new GoogleService(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
