# Saathi API reference

Base URL in dev: `http://localhost:8787/api` (proxied by Vite from `/api`).

**Interactive Swagger UI:** `http://localhost:8787/api-docs` (also live in the
deployed app at `/api-docs`). Swagger shows every endpoint, lets you send
test requests, and covers GET / POST / PUT / DELETE, auth (HTTP Basic),
validation and error responses. You can also view the raw spec at
`GET /api-docs/spec` (served by Swagger UI) — the source is
`server/src/docs/openapi.ts`.

All JSON. Rate limits are per-IP buckets; exceeded requests get `429`.

---

## System

### `GET /health`
```json
{ "ok": true, "service": "saathi", "demoMode": true, "ts": "…" }
```

### `GET /meta`
Static configuration the client needs up front: districts, concern labels,
user-type labels, assessment questions, income brackets, education levels and
the demo notice.
```json
{
  "demoMode": true,
  "demoNotice": { "en": "…", "ta": "…" },
  "districts": [{ "id": "salem", "name": { "en": "Salem", "ta": "சேலம்" } }],
  "concernLabels": { "job_security": { "id": "job_security", "en": "…", "ta": "…" } },
  "assessmentQuestions": [ { "id": "interests", "type": "multi", "prompt": {…}, "options": […] } ]
}
```

---

## Users

### `POST /users`
Create a counselling session.
```json
// body
{ "userType": "learner | parent | joint", "lang": "en | ta" }
// 201
{ "sessionId": "sess-…", "userType": "joint", "lang": "ta" }
```

### `PUT /users/:sessionId/learner-profile`
```json
{ "age": 18, "gender": "male", "education": "class_12", "academicBackground": "science",
  "interests": ["electronics"], "preferredWorkType": ["hands_on"], "learningPreference": "practical",
  "state": "Tamil Nadu", "district": "salem", "urbanity": "semiurban", "careerGoals": "…" }
```
→ `{ "ok": true, "sessionId": "…" }`

### `PUT /users/:sessionId/parent-profile`
```json
{ "state": "Tamil Nadu", "district": "salem", "incomeBracket": "10000_25000",
  "primaryConcern": "job_security", "maxDistanceKm": 30, "preference": "job_immediate" }
```
→ `{ "ok": true, "sessionId": "…" }`

---

## Assessment

### `POST /assessment`
Produces the **Career Interest Snapshot** (prototype heuristic — **not** a
validated test). `answers` use `questionId`/`value` pairs; multi-select answer
values are comma-separated.
```json
{ "sessionId": "…", "answers": [
  { "questionId": "interests", "value": "electronics,electrical" },
  { "questionId": "workpref", "value": "hands_on,field_work" },
  { "questionId": "learning", "value": "practical" },
  { "questionId": "toolsmanship", "value": "yes" },
  { "questionId": "outdoors", "value": "comfortable" },
  { "questionId": "priority", "value": "learning_skills" } ] }
```
→ `{ "ok": true, "sessionId": "…", "snapshot": { "interestWeights": {}, "workPrefs": [], "learningPref": "practical", "tradeScores": [ { "tradeId": "electrician", "score": 0.71, "reasons": […] } ] } }`

---

## Parent concern

### `POST /parent-concerns`
Accepts English or Tamil text (classifier + language detection).
```json
{ "sessionId": "…", "text": "இந்த course படித்த பிறகு வேலை கிடைக்குமா?" }
```
→
```json
{ "ok": true, "concernId": "…", "category": "job_security",
  "label": { "id": "job_security", "en": "Job security", "ta": "வேலை பாதுகாப்பு" },
  "detectedLang": "ta", "confidence": 0.86, "severity": "high", "rawText": "…" }
```

Categories: `income, job_security, social_perception, safety, career_growth,
further_education, distance, training_quality, placement, other`.

---

## Counselling chat

### `POST /chat`
```json
{ "sessionId": "…", "message": "What can someone earn after electrician training?" }
```
→
```json
{ "ok": true, "reply": "…", "intent": "track_trade",
  "structured": {
    "answer": "…",
    "evidence": ["…"],
    "forFamily": "…",
    "notKnown": ["…"],
    "sources": [ { "name": "Hackathon Demo Dataset …", "url": null, "dataPeriod": "…", "verificationStatus": "DEMO", "nature": "demo" } ],
    "demoNotice": "…" },
  "detectedLang": "en", "escalate": false, "escalateReason": null }
```

### `GET /chat/:sessionId`
→ `{ "messages": [ { "id": "…", "role": "user|assistant", "text": "…", "lang": "en|ta", "structured": {…}?, "createdAt": "…" } ] }`

---

## Trades & providers

### `GET /trades?district=salem`
List of the 5 demo trades with clearly demo earnings/local-availability flags.
→ `{ "demoNotice": {…}, "trades": [ { "id": "electrician", "code": "…", "name": {…}, "oneLine": {…}, "durationMonths": 12, "nsqfEntry": 3, "eligibility": {…}, "roles": […], "earningsDemo": "₹18,000–₹29,000/month", "localOutcome": "yes|no", "providerCountLocal": 1 } ] }`

### `GET /trades/:id`
→ `{ "trade": { …full record including ladder and demo NSQF info… }, "outcomes": […], "providers": […], "source": {…} }`

### `GET /providers?district=salem`
→ `{ "demoNotice": "…", "providers": [ { "id": "…", "name": "…", "type": "govt_iti", "scheme": "nsqf", "nsqfAffiliated": true, "accreditation": {…}, "tradeIds": […], "districtName": {…}, "tradeNames": […], "publicPhone": "…", "centreCode": "…" } ] }`

---

## Comparison, scorecard, pathway

These read the snapshot you pass (or compute an empty one if omitted).

### `POST /compare`
```json
{ "snapshot": {…}, "district": "salem" }
```
→ `{ "header": [ { "tradeId": "…", "name": {…} } ], "rows": [ { "label": {…}, "values": [ { "tradeId": "…", "text": {…}, "source": {…}?, "demo": true } ] } ] }`

### `POST /scorecard`
```json
{ "snapshot": {…}, "concernCategory": "job_security", "district": "salem" }
```
→ per-factor cells (`learnerInterest`, `familyConcerns`, `trainingAccessibility`,
`careerPathwayEvidence`, `localOpportunityEvidence`, `dataConfidence`), each with
`level: HIGH|MEDIUM|LOW|LIMITED|UNAVAILABLE` and explanations, plus `parentConcern`.

### `GET /pathway?tradeId=electrician`
→ `{ "steps": [ { "label": {…}, "detail": {…}, "myNote": {…}? } ], "nsqfVerified": false, "caveat": {…} }`
(`nsqfVerified` is always `false` in the prototype.)

---

## Escalation

### `POST /escalation`
```json
{ "sessionId": "…", "language": "ta", "concernCategory": "job_security",
  "contactMethod": "phone", "preferredTime": "evening", "description": "…" }
```
→ `201 { "ok": true, "escalationId": "…", "message": "Counsellor request submitted.", "note": "…" }`

---

## Admin

Protected by **HTTP Basic** auth (`admin` / `saathi2024` by default).

### `GET /admin/dashboard`
Header: `Authorization: Basic <base64(user:pass)>`
→ `{ "stats": { "totalSessions": 12, "parentSessions": 6, "learnerSessions": 5, "jointSessions": 3, "escalations": 0, "unresolvedConcerns": 3, "concernDistribution": { "income": 1, … }, "byDistrict": [ { "district": "salem", "count": 3, "topConcern": "career_growth" } ], "concernShift": […prototype analytics with explicit caveat…] }, "demoNote": "…" }`

No auth → `401`.

---

## Errors

Errors use `{ "error": "…" }` with the appropriate status code. The global
error handler never returns stack traces to the client.