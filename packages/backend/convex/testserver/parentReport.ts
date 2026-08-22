// TESTSERVER — Parent report (Functional Spec v1.1 §5.7, §6.3). Weekly,
// this-child-vs-their-own-past-self only, no aggregate/peer comparison ever.
// Isolated folder — delete along with the rest of convex/testserver/* and
// apps/web/src/app/testserver/* if no longer needed.

import { action, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { assertAdmin, assertAdminInAction, PILLARS, PILLAR_LABELS, type Pillar } from "./_shared";

const DAY_MS = 24 * 60 * 60 * 1000;

const TIPS: Record<Pillar, string> = {
  listening: "Ask them to retell tonight's story in their own words before bed.",
  attention: "Play \"I spy\" with three details from today's story illustrations.",
  emotional: "Ask what three things they'd pack for a trip like the one in the story.",
  cognitive: "Ask \"what do you think happens next?\" halfway through tomorrow's story.",
};

function formatRange(start: number, end: number) {
  const s = new Date(start);
  const e = new Date(end);
  const day = (d: Date) => d.getDate();
  const month = (d: Date) => d.toLocaleDateString("en-IN", { month: "long" });
  if (month(s) === month(e)) return `${day(s)} to ${day(e)} ${month(e)}`;
  return `${day(s)} ${month(s)} to ${day(e)} ${month(e)}`;
}

async function computeReport(ctx: any, userId: string) {
  const now = Date.now();
  const all = await ctx.db
    .query("testserver_challenges")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();
  const completed = all.filter((r: any) => r.status === "completed" && r.completedAt);

  const currentWindow = completed.filter((r: any) => r.completedAt >= now - 7 * DAY_MS);
  const prevWindow = completed.filter(
    (r: any) => r.completedAt < now - 7 * DAY_MS && r.completedAt >= now - 14 * DAY_MS
  );

  function pillarRate(rows: any[], pillar: Pillar) {
    let correct = 0, total = 0;
    for (const r of rows) {
      const bucket = r.score?.perPillar?.find((p: any) => p.pillar === pillar);
      if (bucket) { correct += bucket.correct; total += bucket.total; }
    }
    return total > 0 ? correct / total : null;
  }

  const trend = PILLARS.map((pillar) => {
    const cur = pillarRate(currentWindow, pillar);
    const prev = pillarRate(prevWindow, pillar);
    return {
      pillar,
      label: PILLAR_LABELS[pillar],
      thisWeek: cur === null ? null : Math.round(cur * 10),
      lastWeek: prev === null ? null : Math.round(prev * 10),
    };
  });

  const withData = trend.filter((t) => t.thisWeek !== null);
  const weakest = withData.length > 0
    ? withData.reduce((worst, t) => (t.thisWeek! < worst.thisWeek! ? t : worst))
    : null;

  const latest = [...completed].sort((a: any, b: any) => b.completedAt - a.completedAt)[0];
  const childName = latest?.childName ?? "Your child";

  return {
    childName,
    rangeLabel: formatRange(now - 7 * DAY_MS, now),
    trend,
    tip: weakest ? TIPS[weakest.pillar as Pillar] : "Complete a Story Challenge this week to unlock a tailored tip.",
    growingInPillar: weakest?.pillar ?? null,
    storiesThisWeek: currentWindow.length,
    nextStoryStoryId: latest?.storyId ?? null,
  };
}

export const getWeeklyReport = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await assertAdmin(ctx);
    return await computeReport(ctx, userId);
  },
});

async function sendResendEmail(payload: { to: string[]; subject: string; html: string; text: string }) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("RESEND_API_KEY not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Lalli Fafa <raj@lallifafa.com>", ...payload }),
  });
  if (!res.ok) throw new Error(`Resend error: ${res.status} ${await res.text()}`);
}

// Admin-triggered manual send, for reviewing the report on /testserver before
// the real weekly schedule is wired up as part of promotion to production.
export const sendReportEmail = action({
  args: {},
  handler: async (ctx): Promise<{ sentTo: string }> => {
    const { email } = await assertAdminInAction(ctx);
    if (!email) throw new Error("No email on the signed-in admin account");

    const report = await ctx.runQuery(api["testserver/parentReport"].getWeeklyReport, {});

    const rows = report.trend
      .map(
        (t) => `<tr>
          <td style="padding:6px 0;color:#555;font-size:13px">${t.label}</td>
          <td style="padding:6px 0;text-align:right;font-weight:800;color:#1a1a2e">
            ${t.thisWeek === null ? "—" : `${t.thisWeek}/10`}
            ${t.lastWeek !== null && t.thisWeek !== null ? `<span style="color:#999;font-weight:400;font-size:12px"> (was ${t.lastWeek})</span>` : ""}
          </td>
        </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:'Nunito',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1.5px solid rgba(0,0,0,0.06)">
        <div style="background:#1a1a2e;padding:28px;text-align:center">
          <h1 style="color:#fff;font-size:22px;margin:0;font-weight:800">Lalli <span style="color:#4ecdc4">Fafa</span></h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 4px">${report.childName}'s week with Lalli and Fafa</h2>
          <p style="color:#888;font-size:13px;margin:0 0 24px">${report.rangeLabel}</p>
          <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          <div style="margin-top:24px;padding:16px;background:#f5fffe;border-radius:14px;border:1px solid rgba(0,201,167,0.15)">
            <p style="margin:0;font-size:13px;color:#1a1a2e"><strong>Try this together:</strong> ${report.tip}</p>
          </div>
          <p style="margin:24px 0 0;text-align:center">
            <a href="https://www.lallifafa.com/testserver" style="display:inline-block;background:#f9c700;color:#1a1a2e;text-decoration:none;font-weight:800;font-size:14px;padding:12px 28px;border-radius:50px">Open ${report.childName}'s next story</a>
          </p>
        </div>
      </div>`;
    const text = `${report.childName}'s week with Lalli and Fafa — ${report.rangeLabel}\n\n` +
      report.trend.map((t) => `${t.label}: ${t.thisWeek === null ? "no data" : `${t.thisWeek}/10`}`).join("\n") +
      `\n\nTry this together: ${report.tip}`;

    await sendResendEmail({
      to: [email],
      subject: `${report.childName}'s week with Lalli and Fafa`,
      html,
      text,
    });

    return { sentTo: email };
  },
});
