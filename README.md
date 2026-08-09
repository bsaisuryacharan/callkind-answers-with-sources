# Callkind — Answers With Sources

An interactive reference build demonstrating how a document-grounded assistant can expose claim-level citations, abstain when evidence is insufficient, route uncertainty to human review, and make a small deterministic evaluation visible.

## What is demonstrated

- A synthetic three-document corpus with heading-, table-, and Q&A-aware chunk representations
- Three answer paths: supported, ambiguous/human review, and safe abstention
- Retrieval excerpts with document and section anchors
- Claim-level support states and citation inspection
- A fixed five-case golden set covering retrieval, faithfulness, citation precision, and abstention behavior
- Analytics hooks emitted as `callkind:analytics` custom events and `dataLayer` entries: `demo_start`, `demo_complete`, and `cta_click`

## Truth boundary

This is a deterministic front-end reference build using entirely synthetic policy text and sample facts. It is not connected to a language model, vector database, live welfare-scheme source, client system, or production ingestion pipeline. The displayed metrics describe only the five visible synthetic cases and are not production performance claims.

A production pilot would still require approved source ingestion, access controls, domain-specific chunking and retrieval, model/reranker selection, a representative evaluation set, calibrated thresholds, security review, monitoring, and an operational human-review queue.

## Local development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
```

Built by Callkind as a public, credential-free proof of approach. No client branding, confidential data, deployments, or results are implied.
