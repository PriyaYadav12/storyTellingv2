"use client";

// TESTSERVER screen 7 — Parent report (Functional Spec v1.1 §5.7).
// Every number is this-child-vs-their-own-past-self, never a peer or
// aggregate comparison. Cadence is weekly in production; here the admin can
// also trigger a one-off send to review the actual email via Resend before
// a real cron schedule is wired up as part of promotion (§8).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { PILLAR_COLORS, PILLAR_EMOJI, type Pillar } from "../_lib/pillars";

export default function ParentReportScreen() {
  const router = useRouter();
  const report = useQuery(api["testserver/parentReport"].getWeeklyReport, {});
  const sendReportEmail = useAction(api["testserver/parentReport"].sendReportEmail);
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);
    try {
      const { sentTo } = await sendReportEmail({});
      toast.success(`Report sent to ${sentTo}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the report");
    } finally {
      setSending(false);
    }
  }

  if (!report) {
    return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" size={28} color="var(--lf-teal)" /></div>;
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20, maxWidth: 460, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 20 }}>📬</span>
        <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--lf-dark)", margin: 0 }}>
          {report.childName}&apos;s week with Lalli and Fafa
        </h1>
      </div>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: "rgba(14,10,31,0.5)", margin: "0 0 16px 28px" }}>{report.rangeLabel}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, background: "#fff", borderRadius: 18, padding: 14, border: "1px solid rgba(14,10,31,0.06)" }}>
        {report.trend.map((t: any) => (
          <div key={t.pillar}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, fontWeight: 800, color: "var(--lf-dark)" }}>
                {PILLAR_EMOJI[t.pillar as Pillar]} {t.label}
              </span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(14,10,31,0.5)", fontWeight: 700 }}>
                {t.thisWeek === null ? "No data yet" : `${t.thisWeek}/10${t.lastWeek !== null ? `, up from ${t.lastWeek}` : ""}`}
              </span>
            </div>
            <div style={{ height: 9, borderRadius: 999, background: "rgba(14,10,31,0.06)" }}>
              <div style={{ height: 9, borderRadius: 999, width: `${((t.thisWeek ?? 0) / 10) * 100}%`, background: PILLAR_COLORS[t.pillar as Pillar], transition: "width 0.4s ease" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "linear-gradient(135deg,#f5fffe,#eefcfa)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 16, padding: 14, marginBottom: 14 }}>
        <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "#00806c", textTransform: "uppercase", letterSpacing: "0.04em" }}>💡 Try this together</p>
        <p style={{ margin: "4px 0 0", fontFamily: "'Nunito', sans-serif", fontSize: 13.5, color: "var(--lf-dark)", lineHeight: 1.5 }}>{report.tip}</p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <ChannelTag label="Email" active />
        <ChannelTag label="Push" />
        <ChannelTag label="In app" />
      </div>

      <div style={{ flex: 1 }} />

      <button onClick={() => router.push("/testserver")} className="btn-primary" style={{ justifyContent: "center", width: "100%", marginBottom: 10, fontSize: 15 }}>
        ✨ Open {report.childName}&apos;s next story
      </button>
      <button
        onClick={handleSend}
        disabled={sending}
        className="btn-ghost"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }}
      >
        {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={15} />}
        Send this report to my email now
      </button>
    </div>
  );
}

function ChannelTag({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "'Nunito', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        color: active ? "#fff" : "rgba(14,10,31,0.45)",
        background: active ? "var(--lf-teal)" : "rgba(14,10,31,0.06)",
        borderRadius: 999,
        padding: "5px 10px",
      }}
    >
      {label === "Email" && <Mail size={11} />}
      {label}{!active && " · soon"}
    </span>
  );
}
