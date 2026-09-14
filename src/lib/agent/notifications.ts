export type AgentNotification = {
  id: string;
  title: string;
  message?: string;
  body?: string;
  createdAt?: string;
  isRead?: boolean;
  actionHref?: string;
};
