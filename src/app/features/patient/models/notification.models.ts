export interface TeleSehaNotificationDto {
  type: string;
  title: string;
  message: string;
  data?: unknown;
}


export interface TeleSehaNotificationLivePayload {
  eventType?: string;
  event?: string;
  data?: unknown;
}

export type TeleSehaNotificationListItem = TeleSehaNotificationDto & {
  _clientId?: string;
};
