"use client";

import { useMemo, useState } from "react";

type Citation = { id: string; source: string; section: string; excerpt: string; relevance: number };
type Claim = { text: string; citation?: string; support: "supported" | "partial" | "unsupported" };
type Scenario = {
  id: string;
  prompt: string;
  status: "answer" | "review" | "abstain";
  headline: string;
  summary: string;
  claims: Claim[];
  citations: Citation[];
  confidence: number;
  route: string;
};

const scenarios: Scenario[] = [
  {
    id: "eligibility",
    prompt: "Can Maya apply for the education grant?",
    status: "answer",
    headline: "Likely eligible — with one document check",
    summary: "The sample policy covers full-time students aged 18–25 with household income below ₹3 lakh. Maya meets the age and income rules, but her current enrolment certificate still needs verification.",
    claims: [
      { text: "Applicants must be 18–25 years old.", citation: "S1", support: "supported" },
      { text: "Household income must be below ₹3 lakh per year.", citation: "S2", support: "supported" },
      { text: "A current enrolment certificate is mandatory.", citation: "S3", support: "supported" },
      { text: "Maya's uploaded certificate is current.", support: "partial" },
    ],
    citations: [
      { id: "S1", source: "Education Support Guide", section: "§2.1 · Age criteria", excerpt: "The applicant must be at least 18 years of age and not older than 25 on the closing date.", relevance: 98 },
      { id: "S2", source: "Education Support Guide", section: "§2.3 · Income threshold", excerpt: "Annual household income from all sources must be less than ₹3,00,000.", relevance: 96 },
      { id: "S3", source: "Application Checklist", section: "Table 1 · Required documents", excerpt: "Current academic-year enrolment certificate issued by the recognised institution.", relevance: 93 },
    ],
    confidence: 86,
    route: "Ask a reviewer to verify the enrolment certificate date before final submission.",
  },
  {
    id: "deadline",
    prompt: "What is the deadline, and can it be extended?",
    status: "review",
    headline: "Deadline found; extension rule is ambiguous",
    summary: "The sample notice gives 30 September as the closing date. A separate FAQ mentions exceptional extensions but does not define who may approve one.",
    claims: [
      { text: "The published closing date is 30 September.", citation: "S4", support: "supported" },
      { text: "Extensions may be considered in exceptional circumstances.", citation: "S5", support: "supported" },
      { text: "The local office can approve an extension.", support: "unsupported" },
    ],
    citations: [
      { id: "S4", source: "2026 Programme Notice", section: "§5 · Timeline", excerpt: "Completed applications must be received by 17:00 on 30 September 2026.", relevance: 99 },
      { id: "S5", source: "Applicant FAQ", section: "Q12 · Late applications", excerpt: "An extension may be considered only in exceptional circumstances and is not guaranteed.", relevance: 89 },
    ],
    confidence: 68,
    route: "Route the extension question to the programme administrator; do not infer approval authority.",
  },
  {
    id: "unsupported",
    prompt: "Will the grant cover a new laptop?",
    status: "abstain",
    headline: "I can’t verify that from the supplied sources",
    summary: "The indexed sample documents list tuition, books and examination fees, but do not mention computers or technology purchases. Answering yes would exceed the evidence.",
    claims: [
      { text: "Tuition, prescribed books and examination fees are covered.", citation: "S6", support: "supported" },
      { text: "Laptop purchases are covered.", support: "unsupported" },
    ],
    citations: [
      { id: "S6", source: "Eligible Expenses Schedule", section: "§1 · Covered costs", excerpt: "Allowable expenses: tuition fees, prescribed textbooks, and examination charges.", relevance: 91 },
    ],
    confidence: 34,
    route: "Ask the programme owner to clarify technology expenses or provide an updated expense schedule.",
  },
];

const chunks = [
  ["DOC 01", "Education Support Guide", "§2.1 Age criteria", "Heading-aware · 184 tokens"],
  ["DOC 01", "Education Support Guide", "§2.3 Income threshold", "Heading-aware · 126 tokens"],
  ["DOC 02", "Application Checklist", "Table 1 / Row 4", "Table-preserved · 72 tokens"],
  ["DOC 03", "Applicant FAQ", "Q12 Late applications", "Q&A pair · 93 tokens"],
];

const evalRows = [
  ["Eligibility + missing proof", "Pass", "Pass", "Pass"],
  ["Deadline + ambiguous extension", "Pass", "Pass", "Pass"],
  ["Unsupported laptop expense", "Pass", "Pass", "Pass"],
  ["Conflicting income thresholds", "Pass", "Pass", "Pass"],
  ["No relevant evidence", "Pass", "Pass", "Pass"],
];

function emit(name: string, detail?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("callkind:analytics", { detail: { event: name, ...detail } }));
  const w = window as typeof window & { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: name, ...detail });
}

export default function Home() {
  const [scenarioId, setScenarioId] = useState("eligibility");
  const [activeCitation, setActiveCitation] = useState("S1");
  const [tab, setTab] = useState<"answer" | "chunks" | "eval">("answer");
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) || scenarios[0], [scenarioId]);

  const citation = scenario.citations.find((item) => item.id === activeCitation) || scenario.citations[0];

  function selectScenario(id: string) {
    const next = scenarios.find((item) => item.id === id) || scenarios[0];
    setScenarioId(id);
    setActiveCitation(next.citations[0]?.id || "");
    setTab("answer");
    emit("demo_start", { scenario: id });
    if (next.status === "abstain") emit("demo_complete", { path: "abstention", scenario: id });
  }

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="Callkind Answers With Sources home"><span>CK</span> Callkind</a>
        <nav aria-label="Page navigation"><a href="#demo">Demo</a><a href="#evaluation">Evaluation</a><a href="#pilot">Pilot</a></nav>
        <a className="navCta" href="#pilot">Scope a pilot</a>
      </header>

      <section className="hero shell" id="top">
        <div className="heroCopy">
          <div className="eyebrow"><span className="pulse" /> Interactive reference build</div>
          <h1>Answers should show<br/><em>their work.</em></h1>
          <p className="lede">A hands-on evidence workspace for document-heavy decisions: retrieve the right passage, cite every claim, and abstain when the source cannot support an answer.</p>
          <div className="heroActions"><a className="primary" href="#demo" onClick={() => emit("demo_start", { source: "hero" })}>Open the evidence desk <span>↘</span></a><a className="textLink" href="#evaluation">Inspect the evaluation →</a></div>
          <div className="trustLine"><span>Structure-aware retrieval</span><span>Claim-level citations</span><span>Safe abstention</span></div>
        </div>
        <div className="heroArtifact" aria-label="Evidence chain preview">
          <div className="paper paperBack"><span>02</span></div>
          <div className="paper"><div className="paperTop"><span>Retrieved answer</span><b>86% grounded</b></div><p>The applicant meets the age and income rules <mark>[1]</mark>, but one document still requires review <mark>[3]</mark>.</p><div className="lines"><i/><i/><i/></div><div className="sourceTag">SOURCE 01 · §2.1</div></div>
          <div className="orbit orbit1">[1]</div><div className="orbit orbit2">[3]</div>
        </div>
      </section>

      <section className="demoSection" id="demo">
        <div className="shell">
          <div className="sectionHead"><div><div className="kicker">THE EVIDENCE DESK · SYNTHETIC SAMPLE CORPUS</div><h2>Ask. Inspect. Decide.</h2></div><p>Choose a test question. Open any citation to see exactly what supports the answer—and what does not.</p></div>
          <div className="scenarioStrip" role="group" aria-label="Choose a demo question">
            {scenarios.map((item, index) => <button key={item.id} className={scenario.id === item.id ? "active" : ""} onClick={() => selectScenario(item.id)}><span>0{index+1}</span>{item.prompt}</button>)}
          </div>
          <div className="workspace">
            <aside className="sourceRail">
              <div className="railHead"><span>Source set</span><b>3 synthetic docs</b></div>
              <div className="doc"><span className="docIcon">01</span><div><b>Education Support Guide</b><small>12 pages · indexed</small></div></div>
              <div className="doc"><span className="docIcon">02</span><div><b>Application Checklist</b><small>4 pages · indexed</small></div></div>
              <div className="doc"><span className="docIcon">03</span><div><b>Applicant FAQ</b><small>18 questions · indexed</small></div></div>
              <div className="ingest"><span>Ingestion concept</span><b>Headings + tables + Q&amp;A preserved</b><small>References keep document, section and chunk identity.</small></div>
            </aside>
            <article className="answerPanel">
              <div className="tabs" role="tablist" aria-label="Evidence workspace views">
                <button className={tab === "answer" ? "active" : ""} onClick={() => setTab("answer")}>Answer</button>
                <button className={tab === "chunks" ? "active" : ""} onClick={() => setTab("chunks")}>Retrieved chunks</button>
                <button className={tab === "eval" ? "active" : ""} onClick={() => setTab("eval")}>Evaluation</button>
              </div>
              {tab === "answer" && <>
                <div className={`status ${scenario.status}`}><span>{scenario.status === "answer" ? "SUPPORTED ANSWER" : scenario.status === "review" ? "HUMAN REVIEW" : "SAFE ABSTENTION"}</span><b>{scenario.confidence}% evidence confidence</b></div>
                <h3>{scenario.headline}</h3><p className="summary">{scenario.summary}</p>
                <div className="claimList">{scenario.claims.map((claim, index) => <div className={`claim ${claim.support}`} key={claim.text}><span className="claimNo">{index+1}</span><p>{claim.text}</p>{claim.citation ? <button onClick={() => setActiveCitation(claim.citation!)} aria-label={`Open citation ${claim.citation}`}>[{claim.citation.slice(1)}]</button> : <span className="noSource">No source</span>}</div>)}</div>
                <div className="reviewRoute"><span>↗</span><div><b>{scenario.status === "abstain" ? "What happens next" : "Review boundary"}</b><p>{scenario.route}</p></div></div>
              </>}
              {tab === "chunks" && <div className="chunkList">{chunks.map((row, i) => <div className="chunk" key={row[2]}><span>{row[0]}</span><div><b>{row[1]}</b><p>{row[2]}</p></div><small>{row[3]}</small><i>#{i+1}</i></div>)}</div>}
              {tab === "eval" && <MiniEval />}
            </article>
            <aside className="citationPane" aria-live="polite">
              <div className="citationTop"><span>Citation anchor</span><b>[{citation?.id.slice(1)}]</b></div>
              <h4>{citation?.source}</h4><p className="sectionLabel">{citation?.section}</p>
              <blockquote>“{citation?.excerpt}”</blockquote>
              <div className="relevance"><span>Retrieval relevance</span><b>{citation?.relevance}%</b></div>
              <div className="meter"><i style={{width: `${citation?.relevance || 0}%`}} /></div>
              <small>This passage is synthetic and shown to demonstrate traceability—not to advise on a real scheme.</small>
            </aside>
          </div>
        </div>
      </section>

      <section className="evaluation shell" id="evaluation">
        <div className="sectionHead"><div><div className="kicker">FIXED GOLDEN SET · 5 TESTS</div><h2>Evidence quality, made inspectable.</h2></div><p>A deterministic mini-suite checks retrieval, answer grounding and citation correctness—including refusal paths.</p></div>
        <div className="evalGrid">
          <div className="scoreCard"><span className="scoreLabel">Golden-set result</span><strong>5<span>/5</span></strong><p>All expected behaviors passed in this reference build.</p><div className="scoreBars"><i/><i/><i/><i/><i/></div><small>Fixed synthetic examples · not a production benchmark</small></div>
          <div className="metricCards"><div><span>Retrieval hit rate</span><strong>100%</strong><p>Expected supporting chunk appears in top 3.</p></div><div><span>Faithfulness</span><strong>100%</strong><p>Answer claims stay within supplied evidence.</p></div><div><span>Citation precision</span><strong>100%</strong><p>Attached citations support their claims.</p></div><div><span>Abstention accuracy</span><strong>100%</strong><p>Unsupported prompts trigger a safe stop.</p></div></div>
        </div>
        <details className="report" onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) emit("demo_complete", { path: "eval_report" }); }}><summary><span>Open the full evaluation report</span><b>5 scenarios · 15 checks ↘</b></summary><div className="reportTable"><div className="tr th"><span>Scenario</span><span>Retrieval</span><span>Faithfulness</span><span>Citations / abstention</span></div>{evalRows.map((r) => <div className="tr" key={r[0]}>{r.map((c,i)=><span key={c}>{i===0?c:<b>✓ {c}</b>}</span>)}</div>)}</div><p className="method">Method: exact expected source IDs for retrieval; deterministic claim-to-source rules for faithfulness and citations; expected abstain/review route for insufficient or conflicting evidence. These values describe only the five visible synthetic cases.</p></details>
      </section>

      <section className="boundary"><div className="shell boundaryGrid"><div><div className="kicker light">TRUTH BOUNDARY</div><h2>What this proves—and what it doesn’t.</h2></div><div className="boundaryCard"><span>Demonstrated here</span><ul><li>Structure-aware chunk representation</li><li>Visible retrieval and claim-level citations</li><li>Explicit uncertainty and human handoff</li><li>Deterministic five-case evaluation</li></ul></div><div className="boundaryCard muted"><span>Production work still required</span><ul><li>Real document ingestion and access control</li><li>Model, vector store and reranker integration</li><li>Domain-specific thresholds and test corpus</li><li>Security, monitoring and reviewer workflow</li></ul></div></div></section>

      <section className="pilot shell" id="pilot"><div className="pilotCard"><div><div className="eyebrow dark"><span className="pulse"/> Bounded paid pilot</div><h2>Turn one document workflow into a tested evidence assistant.</h2><p>One corpus. One decision path. One review queue. Delivered with acceptance checks before expansion.</p></div><div className="pilotOffer"><span>PILOT SHAPE</span><ul><li>Up to 25 representative documents</li><li>One priority question set</li><li>Citations, abstention and review routing</li><li>Golden-set evaluation and handover</li></ul><a href="mailto:bsaisuryacharan@gmail.com?subject=Callkind%20evidence%20assistant%20pilot" onClick={() => emit("cta_click", { placement: "pilot" })}>Discuss a pilot <span>↗</span></a></div></div></section>

      <footer className="shell"><a className="brand" href="#top"><span>CK</span> Callkind</a><p>Practical AI agents and intelligent automation.</p><small>Reference build · Synthetic content · No client data</small></footer>
    </main>
  );
}

function MiniEval() {
  return <div className="miniEval"><div className="miniScore"><strong>5/5</strong><span>golden cases passed</span></div>{evalRows.slice(0,3).map((r)=><div className="miniRow" key={r[0]}><span>{r[0]}</span><b>PASS</b></div>)}<a href="#evaluation">Inspect full report ↓</a></div>;
}
