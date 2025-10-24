export interface DriveFolder {
  id: string;
  name: string;
  parents?: string[];
}

export interface DriveFile {
  id: string;
  name: string;
  parents?: string[];
  mimeType: string;
}
