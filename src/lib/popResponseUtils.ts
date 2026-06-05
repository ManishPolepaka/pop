export interface ActivePopLike {
  id: string;
  popId?: string;
  popContent?: string;
  message?: string;
  name?: string;
  type?: "schedule" | "recurring";
}

export interface PopResponsePayload {
  reminderId: string;
  popId?: string;
  question: string;
  answer: string;
  status: "answered" | "skipped";
  reminderName?: string;
  reminderType?: "schedule" | "recurring";
}

export const buildPopResponsePayload = (
  notification: ActivePopLike,
  answerText?: unknown
): PopResponsePayload => {
  const trimmed = typeof answerText === "string" ? answerText.trim() : "";

  return {
    reminderId: notification.id,
    question:
      notification.popContent ||
      notification.message ||
      "Take a moment to relax and reflect",
    answer: trimmed || "Not answered",
    status: trimmed ? "answered" : "skipped",
    ...(notification.popId ? { popId: notification.popId } : {}),
    ...(notification.name ? { reminderName: notification.name } : {}),
    ...(notification.type ? { reminderType: notification.type } : {}),
  };
};
