declare module 'expo-haptics' {
  export enum ImpactFeedbackStyle {
    Light = 0,
    Medium = 1,
    Heavy = 2,
  }
  export enum NotificationFeedbackType {
    Success = 1,
    Warning = 2,
    Error = 3,
  }
  export function impactAsync(style: ImpactFeedbackStyle): Promise<void>;
  export function notificationAsync(type: NotificationFeedbackType): Promise<void>;
}
