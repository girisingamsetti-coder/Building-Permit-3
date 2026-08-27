import type {
  Application,
  NotificationRecord,
  NotificationType,
  RoleKey,
  SmsLog,
} from "@/types";

// ============================================================
// NOTIFICATION & SMS SERVICE
// Creates notifications and mock SMS logs for state changes.
// Uses mock SMS — no real API calls.
// ============================================================

let notifCounter = 0;
let smsCounter = 0;

export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${++notifCounter}`;
}

export function createNotification(params: {
  type: NotificationType;
  title: string;
  message: string;
  applicationId?: string;
  applicationNo?: string;
  recipientRole?: RoleKey;
  sendSms?: boolean;
}): { notification: NotificationRecord; smsLog: SmsLog | null } {
  const now = new Date().toISOString();
  const id = uid("notif");

  // Mock SMS: 90% delivered, 5% sent, 5% failed
  let smsStatus: "SENT" | "DELIVERED" | "FAILED" | "PENDING" = "PENDING";
  let smsLog: SmsLog | null = null;

  if (params.sendSms !== false) {
    const rand = Math.random();
    smsStatus = rand > 0.05 ? "DELIVERED" : rand > 0.02 ? "SENT" : "FAILED";
    smsLog = {
      id: `sms-${Date.now()}-${++smsCounter}`,
      notificationId: id,
      recipient: "+91 98XXX XXXXX",
      recipientName: "Applicant",
      message: params.message,
      templateCode: getTemplateCode(params.type),
      status: smsStatus,
      sentAt: now,
      deliveredAt: smsStatus === "DELIVERED" ? now : undefined,
      applicationNo: params.applicationNo,
      isMock: true,
    };
  }

  const notification: NotificationRecord = {
    id,
    type: params.type,
    title: params.title,
    message: params.message,
    timestamp: now,
    read: false,
    applicationId: params.applicationId,
    applicationNo: params.applicationNo,
    smsSent: !!smsLog,
    smsStatus: smsLog ? smsStatus : undefined,
    channel: "IN_APP",
    recipientRole: params.recipientRole,
  };

  return { notification, smsLog };
}

function getTemplateCode(type: NotificationType): string {
  const map: Record<NotificationType, string> = {
    APPLICATION_SUBMITTED: "SMS_APP_SUBMIT",
    SCRUTINY_FAILED: "SMS_SCRUTINY_FAIL",
    SCRUTINY_PASSED: "SMS_SCRUTINY_PASS",
    DOCUMENTS_REQUIRED: "SMS_DOC_REQ",
    DOCUMENT_VERIFIED: "SMS_DOC_VERIFIED",
    FEE_GENERATED: "SMS_FEE_GEN",
    PAYMENT_SUCCESSFUL: "SMS_PAY_OK",
    SHORTFALL_RAISED: "SMS_SHORTFALL",
    SHORTFALL_RESPONDED: "SMS_SF_RESPONDED",
    SHORTFALL_RESOLVED: "SMS_SF_RESOLVED",
    APPLICATION_FORWARDED: "SMS_FORWARD",
    APPLICATION_APPROVED: "SMS_APPROVED",
    APPLICATION_REJECTED: "SMS_REJECTED",
    APPLICATION_RETURNED: "SMS_RETURNED",
    FINAL_DECISION: "SMS_FINAL",
    SYSTEM: "SMS_SYSTEM",
  };
  return map[type] ?? "SMS_SYSTEM";
}

// Pre-built notification factories for common events
export const NotificationFactory = {
  applicationSubmitted(app: Application) {
    return createNotification({
      type: "APPLICATION_SUBMITTED",
      title: "Application Submitted",
      message: `Your application ${app.applicationNo} has been submitted successfully. Upload drawings to begin scrutiny.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  scrutinyFailed(app: Application) {
    return createNotification({
      type: "SCRUTINY_FAILED",
      title: "Drawing Scrutiny Failed",
      message: `Scrutiny of drawing v${app.drawings[app.drawings.length - 1]?.version} for ${app.applicationNo} has failed. Please re-upload corrected drawings.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  scrutinyPassed(app: Application) {
    return createNotification({
      type: "SCRUTINY_PASSED",
      title: "Drawing Scrutiny Passed",
      message: `Scrutiny passed for ${app.applicationNo}. Upload required documents to proceed.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  documentsRequired(app: Application) {
    return createNotification({
      type: "DOCUMENTS_REQUIRED",
      title: "Documents Required",
      message: `Please upload all required documents for ${app.applicationNo}.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  feeGenerated(app: Application) {
    return createNotification({
      type: "FEE_GENERATED",
      title: "Fee Generated",
      message: `Fee of ₹${app.fee?.total.toLocaleString("en-IN")} generated for ${app.applicationNo}. Proceed to payment.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  paymentSuccessful(app: Application) {
    return createNotification({
      type: "PAYMENT_SUCCESSFUL",
      title: "Payment Successful",
      message: `Payment of ₹${app.payment?.amount.toLocaleString("en-IN")} received for ${app.applicationNo}. Receipt ${app.payment?.receiptNo} generated. Approval workflow initiated.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  shortfallRaised(app: Application, title: string) {
    return createNotification({
      type: "SHORTFALL_RAISED",
      title: "Shortfall Raised",
      message: `A shortfall has been raised on ${app.applicationNo}: ${title}. Please respond at the earliest.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  shortfallResponded(app: Application, shortfallId: string) {
    return createNotification({
      type: "SHORTFALL_RESPONDED",
      title: "Shortfall Response Received",
      message: `LTP has responded to shortfall ${shortfallId} on ${app.applicationNo}. Review the response.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "TPA",
    });
  },
  shortfallResolved(app: Application, shortfallId: string) {
    return createNotification({
      type: "SHORTFALL_RESOLVED",
      title: "Shortfall Resolved",
      message: `Shortfall ${shortfallId} on ${app.applicationNo} has been resolved. The application will resume processing.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  applicationForwarded(app: Application, stageLabel: string) {
    return createNotification({
      type: "APPLICATION_FORWARDED",
      title: "Application Forwarded",
      message: `${app.applicationNo} has been forwarded to ${stageLabel}.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  applicationApproved(app: Application) {
    return createNotification({
      type: "APPLICATION_APPROVED",
      title: "Application Approved",
      message: `${app.applicationNo} has been approved. Permit will be issued shortly.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  applicationRejected(app: Application, reason: string) {
    return createNotification({
      type: "APPLICATION_REJECTED",
      title: "Application Rejected",
      message: `${app.applicationNo} has been rejected. Reason: ${reason}`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
  applicationReturned(app: Application, stageLabel: string) {
    return createNotification({
      type: "APPLICATION_RETURNED",
      title: "Application Returned",
      message: `${app.applicationNo} has been returned to ${stageLabel} for correction.`,
      applicationId: app.id,
      applicationNo: app.applicationNo,
      recipientRole: "LTP",
    });
  },
};
