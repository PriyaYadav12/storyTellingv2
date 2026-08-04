import { internalAction } from "./_generated/server";
import { v } from "convex/values";

async function sendEmail(resendKey: string, payload: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Lalli Fafa <raj@lallifafa.com>",
      ...payload,
    }),
  });
}

const HEADER = `
  <div style="background:#1a1a2e;padding:32px;text-align:center">
    <h1 style="color:#fff;font-size:26px;margin:0;font-weight:800;font-family:'Nunito',Arial,sans-serif">
      Lalli <span style="color:#4ecdc4">Fafa</span>
    </h1>
    <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:6px 0 0;font-family:'Nunito',Arial,sans-serif">
      Personalised AI stories for your little one
    </p>
  </div>`;

const FOOTER = `
  <div style="padding:24px 32px;background:#f9f6ef;text-align:center">
    <p style="color:#aaa;font-size:11px;margin:0;font-family:'Nunito',Arial,sans-serif">
      © ${new Date().getFullYear()} Lalli Fafa ·
      <a href="https://www.lallifafa.com" style="color:#4ecdc4;text-decoration:none">lallifafa.com</a>
    </p>
  </div>`;

export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (_ctx, { email, name }) => {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return;

    const greeting = name ? `Hi ${name.split(" ")[0]}` : "Hi there";

    const html = `
      <div style="font-family:'Nunito',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1.5px solid rgba(0,0,0,0.06)">
        ${HEADER}
        <div style="padding:40px 32px">
          <h2 style="color:#1a1a2e;font-size:24px;font-weight:800;margin:0 0 8px">
            ${greeting}, welcome to Lalli Fafa! 🎉
          </h2>
          <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 28px">
            You've just unlocked a world of magical, personalised bedtime stories for your child — starring <strong>Lalli</strong> (the curious big sister) and <strong>Fafa</strong> (her adventurous little brother).
          </p>

          <!-- Benefit grid -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr>
              <td width="48%" style="vertical-align:top;padding:16px;background:#f5fffe;border-radius:14px;border:1px solid rgba(0,201,167,0.15)">
                <div style="font-size:28px;margin-bottom:8px">👂</div>
                <div style="font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:4px">Listening Skills</div>
                <div style="font-size:12px;color:#666;line-height:1.5">Rich narration and dialogue train children to follow stories with focus and comprehension.</div>
              </td>
              <td width="4%"></td>
              <td width="48%" style="vertical-align:top;padding:16px;background:#fffdf0;border-radius:14px;border:1px solid rgba(249,199,0,0.2)">
                <div style="font-size:28px;margin-bottom:8px">🎯</div>
                <div style="font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:4px">Attention & Focus</div>
                <div style="font-size:12px;color:#666;line-height:1.5">Personalised stories featuring your child's name and interests keep them engaged longer.</div>
              </td>
            </tr>
            <tr><td colspan="3" style="height:12px"></td></tr>
            <tr>
              <td width="48%" style="vertical-align:top;padding:16px;background:#fdf5ff;border-radius:14px;border:1px solid rgba(160,80,200,0.12)">
                <div style="font-size:28px;margin-bottom:8px">🌈</div>
                <div style="font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:4px">Creativity</div>
                <div style="font-size:12px;color:#666;line-height:1.5">Imaginative worlds and characters spark original thinking and a love for storytelling.</div>
              </td>
              <td width="4%"></td>
              <td width="48%" style="vertical-align:top;padding:16px;background:#f0faff;border-radius:14px;border:1px solid rgba(0,150,220,0.12)">
                <div style="font-size:28px;margin-bottom:8px">🧠</div>
                <div style="font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:4px">Cognitive Growth</div>
                <div style="font-size:12px;color:#666;line-height:1.5">Story structure, cause-and-effect, and moral lessons strengthen memory and reasoning.</div>
              </td>
            </tr>
          </table>

          <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 28px">
            Research shows children who have regular story time develop <strong>vocabulary 2–3× faster</strong> and show stronger empathy and social skills. With Lalli Fafa, every story is a little investment in your child's future. 💛
          </p>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:28px">
            <a href="https://www.lallifafa.com/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#f9c700,#ffab00);color:#1a1a2e;text-decoration:none;font-weight:800;font-size:15px;padding:16px 40px;border-radius:50px;box-shadow:0 4px 20px rgba(249,199,0,0.35)">
              ✨ Create your first story →
            </a>
          </div>

          <p style="color:#888;font-size:13px;line-height:1.6;margin:0">
            Your account starts with <strong>200 free credits</strong> — enough for 2 stories to start. Short stories cost 80 credits, longer ones up to 150. Happy storytelling! 🌙
          </p>
        </div>
        ${FOOTER}
      </div>`;

    const text = `${greeting}, welcome to Lalli Fafa!\n\nYou've unlocked personalised bedtime stories for your child, featuring Lalli and Fafa.\n\nOur stories help children:\n- Build listening skills through rich narration\n- Improve attention and focus with personalised content\n- Spark creativity through imaginative worlds\n- Develop cognitive abilities via story structure and moral lessons\n\nYour account starts with 200 free credits. Create your first story at https://www.lallifafa.com/dashboard\n\n— The Lalli Fafa team`;

    try {
      await sendEmail(resendKey, {
        to: [email],
        subject: "Welcome to Lalli Fafa — your child's story journey begins 🌙",
        html,
        text,
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }
  },
});

export const sendCreditAddedEmail = internalAction({
  args: {
    email: v.string(),
    credits: v.number(),
    newBalance: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (_ctx, { email, credits, newBalance, note }) => {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return;

    const html = `
      <div style="font-family:'Nunito',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1.5px solid rgba(0,0,0,0.06)">
        ${HEADER}
        <div style="padding:40px 32px">
          <h2 style="color:#1a1a2e;font-size:24px;font-weight:800;margin:0 0 12px">
            ✨ You've got more stories!
          </h2>
          <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px">
            Great news — <strong>${credits} credits</strong> have just been added to your Lalli Fafa account.${note ? `<br/><br/><em style="color:#777">Note from the team: ${note}</em>` : ""}
          </p>

          <!-- Balance card -->
          <div style="background:linear-gradient(135deg,#1a1a2e,#2d2b50);border-radius:16px;padding:24px;margin-bottom:28px;text-align:center">
            <p style="color:rgba(255,255,255,0.55);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px">New credit balance</p>
            <p style="color:#f9c700;font-size:48px;font-weight:800;margin:0;line-height:1">
              ${newBalance}
            </p>
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:8px 0 0">
              Each story costs 80 credits · ${Math.floor(newBalance / 80)} stor${Math.floor(newBalance / 80) === 1 ? "y" : "ies"} available
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:28px">
            <a href="https://www.lallifafa.com/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#f9c700,#ffab00);color:#1a1a2e;text-decoration:none;font-weight:800;font-size:15px;padding:16px 40px;border-radius:50px;box-shadow:0 4px 20px rgba(249,199,0,0.35)">
              Create a new story →
            </a>
          </div>

          <p style="color:#aaa;font-size:12px;text-align:center;margin:0">
            Questions? Reply to this email or visit <a href="https://www.lallifafa.com" style="color:#4ecdc4">lallifafa.com</a>
          </p>
        </div>
        ${FOOTER}
      </div>`;

    const text = `Great news! ${credits} credits have been added to your Lalli Fafa account.${note ? `\n\nNote from the team: ${note}` : ""}\n\nNew balance: ${newBalance} credits (${Math.floor(newBalance / 80)} stories available)\n\nCreate your next story at https://www.lallifafa.com/dashboard`;

    try {
      await sendEmail(resendKey, {
        to: [email],
        subject: `✨ ${credits} credits added to your Lalli Fafa account`,
        html,
        text,
      });
    } catch (err) {
      console.error("Failed to send credit email:", err);
    }
  },
});
