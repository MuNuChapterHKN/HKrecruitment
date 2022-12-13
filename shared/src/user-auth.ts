export enum Role {
  None = "none",
  Applicant = "applicant",
  Member = "member",
  Clerk = "clerk",
  Supervisor = "supervisor",
  Admin = "admin",
}

export interface UserAuth {
  sub: string;
  role: Role;
}
