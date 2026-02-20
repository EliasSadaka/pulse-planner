export type AttendanceStatus = "attending" | "maybe" | "declined";

export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";

export type EventRecord = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};
