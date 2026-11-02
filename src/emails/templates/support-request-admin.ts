import type { SupportRequestEmail } from '@/types'

export const supportRequestAdminTemplate = ({
  email,
  comment
}: SupportRequestEmail) => {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#0b0f14;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;">

    <div style="max-width:600px;margin:0 auto;padding:32px 24px;color:#e5e7eb;">

      <div style="font-size:12px;letter-spacing:2px;color:#6b7280;margin-bottom:16px;">
        TASKPRO • SUPPORT SYSTEM
      </div>

      <div style="font-size:28px;font-weight:600;color:#ffffff;margin-bottom:6px;">
        New Help Request
      </div>

      <hr style="border:0;border-top:1px solid #1f2937;margin:24px 0;" />

      <div style="margin-bottom:18px;">
        <div style="font-size:11px;letter-spacing:1.5px;color:#6b7280;margin-bottom:6px;">FROM</div>
        <div style="font-size:14px;color:#e5e7eb;">${email}</div>
      </div>

      <div style="margin-bottom:18px;">
        <div style="font-size:11px;letter-spacing:1.5px;color:#6b7280;margin-bottom:6px;">MESSAGE</div>
        <div style="font-size:14px;color:#d1d5db;">
          ${comment}
        </div>
      </div>

      <hr style="border:0;border-top:1px solid #1f2937;margin:24px 0;" />

      <a href="mailto:${email}"
         style="display:inline-block;background:#111827;color:#fff;text-decoration:none;
                padding:10px 14px;border-radius:6px;font-size:12px;border:1px solid #1f2937;">
        REPLY TO USER
      </a>

      <div style="margin-top:32px;font-size:11px;color:#6b7280;">
        Automated message from TaskPro Support
      </div>

    </div>

  </body>
</html>
`
}
