# AI Shopping Copilot — Project Source Document

**Purpose of this document.** This is a complete, factual source description of the
project, written to be handed to an AI assistant as input for generating an
academic report and a presentation. Every number in it was measured from the
running system, not estimated. Emphasis is on the Data Science / AI content,
because the degree being assessed is Data Science & Artificial Intelligence.

**Instruction to whoever generates the report/PPT from this:** do not inflate any
claim. Where this document states a limitation, keep the limitation. Where it
gives a number, use that number. The "Limitations" section is deliberate and
should appear in the report — examiners reward honest evaluation.

---

## 1. Project identity

| | |
| --- | --- |
| **Title** | AI Shopping Copilot — an AI-powered intelligent shopping platform for footwear e-commerce |
| **Brand / product name** | urban-sole |
| **Domain** | E-commerce (footwear retail) |
| **Core disciplines** | Recommender systems, Information retrieval (vector search), Applied Generative AI (LLM agents, RAG), Behavioural analytics |
| **Starting point** | An existing, working full-stack e-commerce application (Express + MongoDB + Next.js) with no AI capability |
| **What was built** | A standalone Python AI service adding 12 AI/ML features, integrated into the existing storefront |

### 1.1 Problem statement

Conventional e-commerce discovery is keyword-driven and identical for every
visitor. Three concrete failures motivated this work:

1. **Keyword search fails on intent.** The original storefront fetched 100
   products and filtered them client-side by substring match on name and brand.
   A query such as *"comfortable office shoes"* returned nothing, because no
   product contains those words, even though relevant products exist.
2. **No personalisation.** Every visitor saw an identical homepage. The platform
   captured no behavioural signal, so it could not have personalised even if
   asked to.
3. **No conversational support.** A shopper with a real question — *"I have flat
   feet, what do you recommend?"*, *"where is my order?"*, *"how long do refunds
   take?"* — had no way to ask it.

### 1.2 Objectives

1. Replace lexical search with **semantic (embedding-based) retrieval**.
2. Build a **hybrid recommender** combining collaborative, content-based,
   association-rule and popularity signals, with explicit cold-start handling.
3. Build a **conversational AI copilot** that understands intent, calls tools
   against real data, remembers preferences, and answers account questions
   (orders, payments, refunds) safely.
4. Ground factual answers in a **retrieval-augmented generation (RAG)** pipeline
   so the system cites policy instead of hallucinating it.
5. Instrument the platform with a **behavioural event pipeline** and analytics.
6. Deliver it as **production-grade engineering**: clean architecture, tests,
   containerisation, security review.

---

## 2. System architecture

### 2.1 Design decision: a separate AI service

The AI capability was built as a **standalone Python service** rather than added
to the existing Node.js backend. Rationale:

| Reason | Detail |
| --- | --- |
| **Ecosystem** | scikit-learn, SentenceTransformers, mlxtend, FP-Growth are first-class in Python and effectively unavailable in Node |
| **Independent scaling** | An LLM turn (~11 s) and a checkout request (~50 ms) have incompatible latency and CPU profiles |
| **Blast-radius isolation** | A model-loading spike or a runaway LLM call cannot take down order processing |
| **Deploy cadence** | Prompt and model iteration ships many times a day without redeploying the transactional core |

This is the **strangler-fig pattern**: capability is added alongside the existing
system rather than by rewriting it. If the AI service is down, the store still
sells — every AI surface degrades to a non-AI fallback.

### 2.2 Tiers

```
Shopper (browser)
      │  HTTPS, single origin
      ▼
Next.js 16 storefront  ──────────────┐
      │                              │  all AI calls go through the BFF,
      ▼                              │  never direct to the AI service
Express 5 BFF  (auth, catalog, cart, orders, payments)
      │  X-Service-Token, private network
      ▼
Python FastAPI AI service  (internal only — no public port)
      ├── MongoDB Atlas   (read-only catalog/orders; owns AI-only collections)
      ├── Qdrant          (vector store: products + knowledge)
      ├── Redis           (rec cache, conversation memory, Celery broker)
      └── LLM gateway     (OpenAI-compatible, MiniMax reasoning models)

Celery worker + beat  →  offline: embedding, training, KB ingestion, rollups
```

### 2.3 The security boundary (important for the report)

The AI service is **never exposed to the internet**. The browser talks only to
Express, which:
1. verifies the user's JWT,
2. derives `userId` server-side,
3. forwards the request to the AI service with a shared service token.

Consequence: **the LLM never receives an identity claim it can manipulate.** A
`userId` appearing in the model's tool arguments is ignored; only the
session-derived id is used. This is the single most important safety property of
the design and is covered by dedicated tests.

### 2.4 Codebase size (measured)

| Layer | Files | Lines | Responsibility |
| --- | --- | --- | --- |
| `app/services` | 7 | 1,632 | Business logic: search, recommender, copilot, RAG, content, analytics |
| `scripts` | 6 | 769 | Data pipelines: seeding, indexing, training, enrichment |
| `app/ml` | 8 | 492 | ML algorithms and model artifacts |
| `app/repositories` | 6 | 458 | Mongo, Qdrant, Redis, catalog, orders |
| `app/core` | 6 | 404 | Config, logging, exceptions, security, DI container |
| `app/llm` | 4 | 355 | LLM client, prompts, reasoning-strip |
| `app/schemas` | 8 | 309 | Pydantic request/response contracts |
| `app/workers` | 4 | 299 | Celery tasks, catalog indexer |
| `app/rag` | 1 | 255 | Knowledge-base construction |
| `app/api` | 11 | 252 | HTTP routers |
| `app/clients` | 2 | 151 | Pluggable embedding providers |
| `app/analytics` | 1 | 124 | Aggregation pipeline builders |
| **App total** | | **5,578** | |
| **Tests** | 11 | **1,199** | 55 tests, all hermetic |

### 2.5 Clean architecture

Dependency direction is strictly inward:

```
routers → services → repositories / clients → external systems
```

A router never touches a database; a service never knows it is being invoked
over HTTP. All dependencies are constructed once in a **dependency-injection
container** (`app/core/container.py`) at application startup. This is why all 55
tests run with no database, no vector store and no LLM — collaborators are
replaced with fakes.

### 2.6 API surface — 14 versioned endpoints

| Method | Endpoint | Feature |
| --- | --- | --- |
| POST | `/v1/semantic-search` | Embedding-based product search |
| POST | `/v1/similar-products` | Vector k-NN "more like this" |
| POST | `/v1/recommend` | Single personalised section |
| GET | `/v1/home/{user_id}` | Full personalised homepage |
| POST | `/v1/rerank` | Learning-to-rank re-ordering |
| POST | `/v1/chat` | Conversational copilot turn |
| POST | `/v1/extract-filters` | Natural language → structured filters |
| POST | `/v1/bundles` | Association-rule complements |
| POST | `/v1/compare-products` | Structured AI comparison |
| POST | `/v1/summarize-reviews` | Review digest |
| POST | `/v1/ask` | RAG knowledge assistant |
| POST | `/v1/events` | Behavioural event ingestion |
| GET | `/v1/analytics/summary` | Dashboard payload |
| GET | `/v1/analytics/{metric}` | Single metric |

Plus unauthenticated `/health` and `/ready` probes for orchestration.

---

## 3. THE AI / MACHINE LEARNING CORE

> This is the section the report should weight most heavily.

## 3.1 Semantic search (vector retrieval)

### Problem
Lexical search cannot match intent to vocabulary. *"comfortable office shoes"*
shares no tokens with *"PALERMO CLUB VEGAS LEATHER"*, yet that is the correct
result.

### Method
Dense-vector retrieval with approximate nearest-neighbour search.

**Embedding model:** `sentence-transformers/all-MiniLM-L6-v2`
- 6-layer distilled transformer (MiniLM architecture)
- Output dimensionality **384**
- Mean-pooled token embeddings, L2-normalised
- Chosen for the quality/size trade-off: 22 M parameters, ~90 MB, runs on CPU

**Document representation.** Each product is serialised into one canonical
string before embedding (`build_embedding_text`):

```
name . brand . "for {gender}" . colour . colours . tags . attributes . description
```

**Vector store:** Qdrant, cosine distance, **HNSW** index (Hierarchical
Navigable Small World — a graph-based ANN structure giving approximately
logarithmic search complexity instead of the linear scan of exact k-NN).

**Similarity.** With L2-normalised vectors, cosine similarity reduces to the dot
product:

```
sim(q, d) = (q · d) / (‖q‖ ‖d‖)   =   q · d        when ‖q‖ = ‖d‖ = 1
```

**Filtered ANN.** Qdrant stores a filterable payload alongside each vector
(brand, category name, gender, price, colour tokens, stock, rating), so a query
such as *"black sneakers under ₹4000 in stock"* is satisfied by a **single**
filtered vector query rather than retrieve-then-filter.

### Engineering detail worth reporting
Embedding inference is synchronous, CPU-bound work. Executing it inline inside an
async request handler blocks the event loop and therefore every concurrent
request on that worker. It is dispatched to a thread pool:

```python
await asyncio.to_thread(self._embedder.embed_one, text)
```

### Feature engineering: the catalog enrichment pipeline
The imported catalog had an **empty `tags` array** and ~108-character
descriptions, leaving almost no lexical surface to embed. A deterministic,
rule-based enrichment stage (`scripts/enrich_catalog.py`) derives:

- **`useCase`** — running, gym, casual, skate, walking, indoor …
- **`material`** — leather, suede, canvas, knit, croslite foam, engineered mesh
- **`tags`** — union of use-case tags, colour tokens, material, price band, brand
- **`priceBand`** — budget-friendly / mid-range / premium / flagship
- **rewritten description** mentioning audience, material, use case and sizes

Rule-based (regex over name/brand/colourway/price) rather than LLM-generated, so
it is **deterministic and reproducible** — a desirable property for a graded
artifact.

### Measured result (after enrichment)

| Query | Top result | Score |
| --- | --- | --- |
| "leather shoes for office" | PALERMO CLUB VEGAS **LEATHER** | 0.507 |
| "lightweight waterproof slip on" | ONE STAR CC **SLIP** PRO | 0.313 |
| "cushioned shoes for long walks" | SB VERTEBRAE / STRUCTURE 26 | 0.400 |

An earlier controlled test on a synthetic 3-product set gave **3/3 correct
top-1** matches for topically distinct queries, plus correct metadata filtering.

---

## 3.2 Hybrid recommender system

Four complementary algorithms are blended. Each is included because it covers a
specific weakness of the others — the central argument of the recommender design.

| Algorithm | Solves | Fails at |
| --- | --- | --- |
| Content-based (embeddings) | Cold **items**, explainability, "similar to X" | Cannot learn taste |
| Collaborative filtering | Taste patterns across users | Cold users and cold items |
| Association rules | Complements / baskets | Needs purchase volume |
| Popularity (time-decayed) | Cold **users**, reliable floor | Not personalised |

### 3.2.1 Interaction matrix construction

Implicit feedback is derived from the behavioural event stream with per-event
intent weights:

| Event | Weight |
| --- | --- |
| view | 1.0 |
| click | 1.5 |
| add_to_cart | 3.0 |
| purchase | 5.0 |
| search | 0.5 |

Cell values are **log-damped**:

```
R[u,i] = log(1 + Σ w_e)     for all events e by user u on item i
```

`log1p` compression prevents a small number of highly active users, or repeated
views of one product, from dominating the similarity computation — a standard
treatment for implicit-feedback data.

### 3.2.2 Item-item collaborative filtering

Similarity between items is the cosine similarity of their **columns** in the
interaction matrix (co-interaction pattern across users):

```
sim(i,j) = (R_i · R_j) / (‖R_i‖ ‖R_j‖)
```

Implementation notes:
- `sklearn.metrics.pairwise.cosine_similarity` on `Rᵀ`
- Self-similarity zeroed (`fill_diagonal(0)`)
- Only the **top-K = 50** neighbours retained per item, selected with
  `np.argpartition` (O(n) selection rather than O(n log n) full sort)

**Why item-item rather than matrix factorisation?** It is transparent
("customers who interacted with A also interacted with B"), needs no training
loop or hyperparameter search, is trivially incremental, and — decisively for
serving — reduces to a precomputed neighbour dictionary, so inference requires
no numerical library at all. Matrix factorisation (LightFM/ALS) remains a drop-in
replacement behind the same interface.

**Scoring a user.** For a user's interaction set:

```
score(i) = Σ_{j ∈ interacted}  w_j · sim(j, i)          i ∉ interacted
```

**Measured on the trained model:** 30/30 items have neighbours, average 29.0
neighbours per item, top similarities in the range 0.57–0.63.

### 3.2.3 Association rule mining (market-basket analysis)

**Algorithm: FP-Growth** (`mlxtend`), over order baskets.

FP-Growth was chosen over Apriori because it compresses the transaction database
into an **FP-tree** and mines frequent itemsets by recursive conditional-tree
projection, avoiding Apriori's repeated full-database scans and explicit
candidate generation. This scales considerably better as basket volume grows.

Standard metrics, for a rule *X → Y*:

```
support(X)      = P(X)                        fraction of baskets containing X
confidence(X→Y) = P(Y | X) = supp(X∪Y)/supp(X)
lift(X→Y)       = P(Y | X) / P(Y)  =  confidence / support(Y)
```

**Lift is the ranking metric.** Confidence alone favours globally popular items
(a rule *anything → bestseller* has high confidence but no information). Lift > 1
means X and Y co-occur **more than independence predicts**, i.e. a genuine
association.

Hyperparameters: `min_support = 0.02`, `min_lift = 1.0`. Only single-item
antecedents are retained, for O(1) per-product lookup at serving time.

**Robustness.** If mlxtend is unavailable, or the data is too sparse for the
support threshold to yield any itemset, the implementation falls back to raw
co-occurrence counting so the feature still returns sensible complements rather
than failing.

**Measured on the trained model:**
- Method actually used: **fpgrowth**
- 12 antecedent products, **18 rules**
- **Lift range 1.62 – 4.44** — all well above 1, confirming the mined rules
  capture real associations rather than noise

### 3.2.4 Popularity and trending with exponential time decay

Recency-weighted popularity:

```
popularity(i) = Σ_e  w_e · 0.5 ^ (age_days(e) / H)
```

with **half-life H = 14 days**. An event contributes half as much after 14 days,
a quarter after 28, and so on. "Trending" applies the same formula over a
**7-day window** with a shorter half-life, making it responsive to current
momentum rather than all-time totals.

Both are min-max normalised to [0,1] so they are commensurable in the blend.

**Measured:** popularity and trending produce **different rankings** — only 2 of
the top 8 positions coincide (6 of 8 products overlap but in different order),
confirming the time-decay term is doing real work rather than reproducing raw
counts.

### 3.2.5 Hybrid ranking function

Candidates from all sources are pooled, de-duplicated, and scored:

```
score(u,i) = 0.40 · cf(u,i)
           + 0.20 · content(u,i)
           + 0.20 · popularity(i)
           + 0.10 · trending(i)
           + 0.10 · affinity(u,i)
```

then post-processed with business rules: out-of-stock items are **demoted**
(× 0.4) rather than removed, so they remain discoverable; already-purchased items
are excluded.

Weights are currently hand-tuned. The interface accepts learned weights — the
natural next step is logistic learning-to-rank trained on click/purchase labels
from the event stream, which the platform now collects.

### 3.2.6 Cold-start strategy

A four-level ladder, so no user or item is ever unserved:

| Situation | Strategy |
| --- | --- |
| New user, no history | Time-decayed popularity + trending + new arrivals |
| Few interactions | Content-based from viewed items + item-item neighbours |
| Rich history | Full hybrid, CF weighted highest |
| **New product** | Content/embedding similarity places it immediately; CF picks it up after first interactions |

The new-item case is exactly why content-based filtering is retained despite CF
performing better on established products.

### 3.2.7 Personalised homepage — eight dynamic sections

`Recommended For You`, `Continue Shopping`, `Frequently Bought Together`,
`Customers Also Bought`, `Trending Shoes`, `Recently Viewed`,
`Based On Your Style`, `New Arrivals`.

Every section has a fallback path to the popularity floor, so the homepage is
never empty regardless of model or user state.

---

## 3.3 Generative AI: the conversational copilot

### 3.3.1 Architecture — an agent, not a chatbot

The copilot is an **LLM agent with tool use**. It does not query the database and
does not generate SQL. It emits *tool calls*; validated Python executes them.

**Model:** MiniMax-M2.5 via an OpenAI-compatible gateway. These are **reasoning
models** — significant to the implementation (§3.3.5).

**Turn pipeline:**

```
1. Load session state (Redis)            → history + preference slots
2. Extract preferences from the message  → structured tool call, low-latency model
3. Agent loop, ≤ 3 steps:
       LLM → tool_calls? → execute against real data → feed results back
4. If no prose was produced: forced answer with tools disabled
5. Align returned products to the reply text
6. Persist session (Redis hot copy + MongoDB durable copy)
```

### 3.3.2 Function calling — six tools

| Tool | Backed by |
| --- | --- |
| `search_products` | Semantic search + metadata filters |
| `get_recommendations` | Hybrid recommender |
| `compare_products` | Structured comparison service |
| `get_my_orders` | Order repository (user-scoped) |
| `get_order_details` | Order repository (user-scoped) |
| `answer_from_policy` | RAG pipeline |

Arguments are parsed and validated before use; unknown tools return an error
object rather than raising.

### 3.3.3 Conversation memory and preference slot-filling

Two-part memory in Redis (24 h TTL):

1. **Rolling message window** — last 8 turns, bounding token cost.
2. **Preference slots** — `size`, `gender`, `brand`, `colour`, `category`,
   `minPrice`, `maxPrice`.

Slots are populated by a **structured-output extraction call** on every user
message, then injected as a system message on subsequent turns and merged into
tool arguments.

**Demonstrated behaviour (real transcript):**
> User: *"I usually wear size 9"* → "Got it! I'll keep your size 9 in mind."
> User: *"now show me something from New Balance"* → returns 9060 / 1000 / 471
> **"(size 9)"** — the remembered slot was applied without being restated.

### 3.3.4 Natural language → structured filters

A dedicated `set_filters` tool schema converts free text to a validated Pydantic
object:

```
"I want black sneakers under ₹4000"
        ↓
{ "colour": "black", "category": "sneakers", "maxPrice": 4000 }
        ↓
deterministic filtered vector query
```

Extraction runs on the low-latency model variant because it sits on the critical
path of every message.

### 3.3.5 Handling reasoning models — a genuine implementation finding

The MiniMax models interleave chain-of-thought inside `message.content`:

```
<think>the user wants running shoes, I should search...</think>Here are some options...
```

Two distinct problems, both encountered in practice:

1. **Leakage.** Raw reasoning must never reach the shopper. A regex strips
   closed `<think>…</think>` blocks.
2. **Truncation.** If the model hits its token limit *mid-thought*, there is no
   closing tag. A second regex removes an unclosed block — which correctly
   yields an **empty** visible answer. This caused a real observed bug: replies
   came back blank, and the service fell through to a generic fallback line. The
   fix was to raise answer budgets to **1500 tokens** and log the empty-answer
   case explicitly.

This is a good, concrete "lessons learned" item for the report: reasoning models
require materially larger token budgets than instruct models for the same
visible output length.

### 3.3.6 Two behavioural failures found and fixed by live testing

**(a) Over-cautious permission-asking.** Asked for trekking shoes — which the
catalog does not stock — the model replied *"I don't have hiking boots. Would you
like me to search for running shoes instead?"* and returned **zero** products,
wasting a full turn. Fixed with an explicit prompt directive plus tool-result
instructions:

> Before: *"Sorry, I don't have hiking boots… Would you like me to search…?"* (0 products)
> After: *"For outdoor activities these cushioned trainers are your best bet: **STRUCTURE 26** — ₹11,895 … **One note:** these aren't dedicated hiking boots."* (6 products)

**(b) Product cards contradicting the reply.** The agent accumulates hits from
*every* tool call in the loop, including a generic recommendations call. Rendering
those directly produced a reply recommending running shoes displayed beside
**Crocs clogs**. Fixed by making the reply the source of truth:
`_align_with_reply()` retains only products the reply actually names, in the
order named, with a fallback to the unfiltered list when the reply names none.

Both are examples of agent behaviour that unit tests pass but live use exposes —
worth stating in an evaluation section.

---

## 3.4 Retrieval-Augmented Generation (RAG)

### Pipeline

```
Knowledge sources  →  chunk  →  embed  →  Qdrant "knowledge" collection
                                              ↓
question → embed → top-k retrieval (+ metadata filter) → grounded prompt → LLM
                                              ↓
                                answer + citations + grounded flag
```

### Knowledge base construction (`app/rag/`, 255 lines)

Two document families, **106 chunks total**:

**Per-product (3 chunks each)** — derived from catalog fields:
- *profile* — brand, gender, colourway, price, rating
- *sizing* — available sizes, fit guidance
- *use* — best-suited activities, description

**Global policy/FAQ (13 documents)** — return policy, refund timelines, shipping,
size & fit guide, shoe care, authenticity guarantee, order-status meanings,
payment methods & failed payments, delivery tracking, exchanges, damaged/wrong
items, invoices & GST, support contact.

**Chunking strategy:** greedy sentence-boundary packing to a 380-character
target. Sentence boundaries are respected so no chunk begins or ends mid-clause,
which would degrade embedding quality.

### Grounding and refusal

The prompt instructs the model to answer **only** from numbered context, and to
return the exact string *"I don't have that information."* with empty citations
when unsupported. The response carries a boolean `grounded` flag, true only when
citations exist **and** the answer is not the refusal string.

**Citation integrity — a subtle bug found and fixed.** Context blocks were
numbered by their index among *all* retrieved hits, but only non-empty chunks
were appended to the reference list. A skipped chunk therefore shifted every
later citation by one, so citing `[2]` resolved to **the wrong source document**.
Fixed by numbering from the position in the kept-references list. A regression
test pins this.

### Measured behaviour

| Question | Answer |
| --- | --- |
| *"How long do refunds take?"* | *"5–7 business days for card and UPI, up to 10 for net banking… initiated within 2 business days"* — quoted from policy |
| *"What is your return policy?"* | Correct 30-day policy, cited to *Return Policy* |
| *"What is the meaning of life?"* | Refused, `grounded = false` |

---

## 3.5 Account intelligence — orders, payments, refunds

The copilot answers *"where is my order"*, *"did my payment go through"*, *"when
will I get my refund"* from the shopper's real account.

### Security design (the most important part of this feature)

Purchase history is personal data, so scoping is enforced structurally:

1. **Every** repository method requires a `user_id` and filters on it **inside
   the query**, not as a check afterwards:

   ```python
   order = await orders.find_one({
       "_id": ObjectId(order_id),
       "userId": {"$in": _id_variants(user_id)},   # owner is part of the query
   })
   ```
   A mismatched owner returns nothing naturally — there is no branch to forget.

2. **There is deliberately no fetch-by-order-id method.** The unsafe operation
   does not exist in the codebase.

3. **Identity comes from the verified session**, never from the conversation. A
   `userId` in the model's arguments is ignored.

4. **Data minimisation** — only the last 10 characters of a payment reference are
   exposed.

5. **Guests** receive an explicit not-signed-in signal, so the model cannot
   invent orders.

**Tested adversarially:** a test asks for another user's order *while the model
claims to be that user*; the session identity wins and the lookup returns
not-found. Cross-user access is verified denied in both directions.

### Derived refund state
Refunds are not stored. A cancelled order whose payment succeeded is money owed
back — computed at read time and paired with the real timeline from policy.

### Measured behaviour (real account data)

| Question | Answer |
| --- | --- |
| *"Where is my order?"* | Lists 3 real orders with status, ₹ totals, item counts, dates |
| *"Did my payment go through for that one?"* | *"Yes… ₹23,294 · Stripe · Paid 8 July · Reference 65nuler44z"* — resolved *"that one"* from the prior turn |
| *"Where is my order?"* (signed out) | *"I can't see your orders because you're not signed in."* |

---

## 3.6 AI content generation

**Product comparison** — structured multi-document generation producing, per
product: pros, cons, comfort, durability, value-for-money, best-for, plus a
cross-product recommendation. Emitted via a tool schema so the output is typed
rather than parsed from prose.

**Review summarisation** — condenses reviews into most-loved features, common
complaints, overall sentiment, and a should-you-buy verdict. Products with more
than 60 reviews are **evenly sampled** so the model sees a representative slice
within the context budget. Results are cached in MongoDB, keyed on the review
count, and invalidated when new reviews arrive.

**Prompt-injection defence.** Review text is public user input flowing into a
prompt whose output is shown to every shopper — a genuine injection vector.
Mitigations: angle brackets are neutralised so review text cannot forge the
`<reviews>` fence; newlines collapsed; each review truncated to 240 characters;
and the system prompt explicitly states the fenced content is untrusted data
whose instructions must never be followed.

---

## 3.7 Behavioural analytics

Five event types (`view`, `click`, `add_to_cart`, `purchase`, `search`) are
ingested from the storefront and aggregated with MongoDB aggregation pipelines
kept as **pure builder functions**, separately unit-testable from the service.

Derived metrics:

```
CTR        = clicks      / views
cart rate  = add_to_cart / views
conversion = purchases   / views
```

Dashboard surfaces: funnel counts, the three rates, intent-weighted top products,
daily time series, most-frequent search queries, unique users/sessions, copilot
usage, and the **model version** that produced the recommendations being measured.

**A data-engineering detail worth reporting:** grouping keys are cast with
`{"$toString": "$productId"}`. The seeder writes ObjectIds while the live
ingestion endpoint writes strings; grouping on the raw value silently split one
product into two under-counted rows.

---

## 4. Data

### 4.1 Real catalog

30 products · 8 brands (Nike, Jordan, adidas Originals, New Balance, Converse,
Puma, Crocs, Vans) · 2 categories.

### 4.2 Synthetic behavioural data — methodology

Collaborative filtering, association rules and analytics all require interaction
history that did not exist. A generator (`scripts/seed_interactions.py`, 488
lines) produces **learnable structure rather than uniform noise** — this is a
methodological contribution worth describing in the report.

| Mechanism | Purpose |
| --- | --- |
| **Latent taste profiles** — each shopper has preferred gender, 1–3 brands, a category, a budget with tolerance, a shoe size, an activity level | Creates genuine user-user and item-item structure for CF to recover |
| **Affinity function** — Gaussian preference around budget × brand/gender/category multipliers | Interactions are sampled from preference, not uniformly |
| **Realistic funnel** — view → click → add_to_cart → purchase with decreasing, affinity-scaled probabilities | Produces plausible conversion rates |
| **Complementary-product graph** — a hidden affinity graph makes certain products co-occur in baskets | Gives FP-Growth real lift to find instead of noise |
| **Temporal shape** — 120 days of history, weekend peaks, recency ramp | Makes time-decayed popularity differ from raw counts |
| **Aspect-based reviews** — 10 aspects (comfort, sizing, durability, style, value, delivery, grip, weight, breathability, authenticity), positive and negative variants | Gives review summarisation genuine themes to discover |
| **Order lifecycle** — payment records with consistent statuses, multi-step status timelines with plausible gaps | Enables order/payment/refund question answering |

All generated documents are tagged `synthetic: true` and removable with a single
`--reset` flag, so they never contaminate organic data.

### 4.3 Dataset scale (measured)

| Collection | Count |
| --- | --- |
| products | 30 |
| users | 933 (900 synthetic) |
| **events** | **30,100** |
| orders | 847 |
| order items | 1,290 |
| payments | 805 |
| order status transitions | 2,902 |
| reviews | 670 (22.3 per product, mean rating 3.91) |
| knowledge-base chunks | 106 |
| product vectors | 30 × 384-dim |

### 4.4 Generated funnel realism

| Event | Count | Share |
| --- | --- | --- |
| view | 19,409 | 64.5% |
| click | 5,067 | 16.8% |
| search | 2,318 | 7.7% |
| add_to_cart | 2,017 | 6.7% |
| purchase | 1,289 | 4.3% |

Derived rates: **CTR 26.1%**, **cart rate 10.4%**, **conversion 6.6%** — a
monotonically narrowing funnel, consistent with observed e-commerce behaviour.

Order status distribution: delivered 561, shipped 103, paid 93, cancelled 68,
pending 22.

### 4.5 AI-owned data model

New collections added alongside the existing commerce schema:

| Collection | Purpose |
| --- | --- |
| `events` | Behavioural stream — the fuel for CF, ranking, analytics |
| `recommendations` | Precomputed per-user section cache |
| `chatsessions` | Durable conversation transcripts + preference slots |
| `reviewsummaries` | Cached LLM review digests with invalidation key |
| `analyticsrollups` | Daily metric snapshots |

Vectors live in Qdrant (`products`, `knowledge`), not MongoDB — a documented
migration: embeddings were originally stored as a 768-dimension array on a Mongo
document, which cannot support fast filtered ANN.

---

## 5. Evaluation and results

### 5.1 Model diagnostics (from the trained artifact)

| Metric | Value |
| --- | --- |
| Artifact version | `20260726193544` |
| Training events | 30,100 |
| Baskets mined | 805 |
| Users / items | 900 / 30 |
| ARM method actually used | **fpgrowth** |
| Items with CF neighbours | 30/30 |
| Mean neighbours per item | 29.0 |
| Top item-item similarities | 0.57 – 0.63 |
| Association rules | 18 (12 antecedents) |
| **Lift range** | **1.62 – 4.44** |
| Popularity vs trending top-8 positional overlap | 2/8 (rankings genuinely differ) |

### 5.2 Functional verification (live, end-to-end)

| Capability | Evidence |
| --- | --- |
| Semantic search | 3/3 correct top-1 on topically distinct queries; metadata filter correct |
| Recommendations | All homepage sections populated; model version reported |
| Bundles | FP-Growth complements with lift up to 4.44 |
| Copilot | Tool call → grounded reply; memory carried across turns |
| RAG | Correct policy timelines quoted; out-of-scope question refused |
| Order/payment | Real orders, statuses, payment references returned |
| PII scoping | Cross-user access denied in both directions |

### 5.3 Performance

| Measurement | Value |
| --- | --- |
| Copilot turn (warm) | ~11 s (3 LLM round-trips: extraction, tool call, answer) |
| Semantic search | sub-second after model warm-up |
| Embedding model memory | **463 MB** resident (measured, not estimated) |
| Serving-only dependency footprint | **295 MB** |
| Full ML/training footprint | **871 MB** (torch alone 490 MB) |

The memory measurement changed a deployment decision: an initial estimate of
1.5–2.5 GB led to an 8 GB / $48-per-month recommendation; measuring the true
463 MB reduced this to a 2 GB / $12-per-month host — a **4× cost reduction**
attributable to measuring rather than estimating.

### 5.4 Testing

**55 tests, 1,199 lines, all hermetic** — the hash embedder and fake
collaborators mean no MongoDB, Qdrant, Redis or LLM gateway is required.

| Area | Coverage |
| --- | --- |
| ML algorithms | CF genuinely learns co-occurrence; FP-Growth finds complements; time decay favours recent; ranking demotes out-of-stock; artifact round-trip |
| Copilot | Agent loop, memory persistence, preference slot-filling, card/reply alignment |
| RAG | Grounded answer with citations; refusal on empty citations; citation index alignment |
| Orders | 8 tests — cross-user denial both directions, malformed ids, reference redaction, guest gating, model-supplied-identity attack |
| Analytics | Rate arithmetic, pipeline well-formedness, summary assembly |
| API | Endpoint surface, service-token rejection, health/readiness |

### 5.5 Independent code audit

A structured multi-agent review was run over the whole change set: **9 parallel
reviewers** across correctness, ML, security, async/resource, cross-layer
contracts and test quality, with **two independent adversarial verifiers** per
finding.

| | |
| --- | --- |
| Raw findings | 65 |
| Confirmed after adversarial verification | **19** |
| Refuted as false positives | 8 |

**The dominant defect class was contracts that silently disagree across a
boundary** — nothing crashed; the system returned plausible but wrong results.
Representative confirmed defects:

1. **Vector filter type mismatch** — the category filter compared a
   human-readable word against a stringified ObjectId, so *every* categorised
   search silently returned zero results.
2. **Unshared model artifact** — the training worker and the serving API each
   had their own container directory, so the API never loaded the trained model
   and every recommendation silently fell back to popularity, permanently and
   without error.
3. **Citation index misalignment** — a skipped knowledge chunk shifted all later
   citations, attributing answers to the wrong document.
4. **Auth status leakage** — an internal service-token failure was forwarded to
   the browser as a 401, which the client interpreted as an expired session and
   redirected every visitor to login.
5. **Structurally-zero metrics** — only `view` and `add_to_cart` events were ever
   emitted, so CTR and conversion could never be non-zero.

All 19 were fixed and pinned with regression tests that fail against the pre-fix
code.

---

## 6. Deployment

Containerised with Docker Compose behind NGINX, single-host topology.

| Property | Implementation |
| --- | --- |
| Public surface | **NGINX only** (80/443). AI service, Qdrant and Redis are internal-network only |
| Single origin | `/` → Next.js, `/api/v1/` → Express, so no cross-origin requests |
| Shared state | Named volume for model artifacts, shared by trainer and API |
| TLS | Let's Encrypt with automated renewal; HTTP-only config for first boot |
| Secrets | Environment-only, gitignored; production refuses to boot with the placeholder service token |
| Scheduling | Celery beat, or cron one-shot containers on memory-constrained hosts |

Sized from the measured footprint: a 2 GB host runs the full stack at
approximately $12/month.

---

## 7. Technology stack

| Layer | Technology |
| --- | --- |
| **AI service** | Python 3.11+, FastAPI, Uvicorn/Gunicorn, Pydantic v2 |
| **ML** | scikit-learn (cosine similarity), NumPy, pandas, mlxtend (FP-Growth) |
| **Embeddings** | sentence-transformers `all-MiniLM-L6-v2` (384-d), PyTorch CPU |
| **Vector DB** | Qdrant (HNSW, cosine, payload filtering) |
| **LLM** | MiniMax-M2.5 via OpenAI-compatible gateway; function calling, structured outputs |
| **Cache / memory** | Redis |
| **Jobs** | Celery + beat |
| **Database** | MongoDB (Motor async driver), MongoDB Atlas |
| **BFF** | Node.js, Express 5, TypeScript, Zod |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Testing** | pytest, pytest-asyncio |
| **Ops** | Docker, Docker Compose, NGINX, Let's Encrypt |

---

## 8. Limitations (state these honestly)

1. **Catalog breadth is the binding constraint.** 30 products, almost all
   sneakers and clogs. Queries for categories the store does not stock (trekking
   boots, formal shoes) cannot be satisfied. The copilot handles this correctly
   by stating the limitation and offering the closest alternatives, but no
   algorithm can retrieve what is absent.
2. **Interaction data is synthetic.** It is *structured* rather than random and
   the models demonstrably learn from it, but it is generated from a known
   process. Offline accuracy metrics computed on it would measure recovery of
   that process, not real user behaviour — which is why this report presents
   model diagnostics (lift, similarity distributions, coverage) rather than
   claiming precision/recall figures against real ground truth.
3. **Ranking weights are hand-tuned**, not learned. Learning-to-rank requires
   real click/purchase labels; the collection pipeline now exists but the data
   does not yet.
4. **No online evaluation.** No A/B test or interleaving experiment has been run;
   claims are functional and diagnostic, not causal uplift.
5. **Copilot latency ~11 s** per turn, dominated by three sequential LLM
   round-trips on a reasoning model. Streaming responses and merging the
   extraction step would materially improve perceived speed.
6. **Single-node deployment.** Horizontally scalable by design (stateless
   workers, shared Redis/Qdrant) but not yet demonstrated under load.

---

## 9. Future work

| Priority | Item |
| --- | --- |
| High | **Learning-to-rank** — logistic/GBDT ranker trained on collected click and purchase labels, replacing hand-tuned weights |
| High | **Matrix factorisation** — LightFM (WARP loss) behind the existing CF interface; benchmark against item-item on Recall@K and NDCG |
| High | **Offline evaluation harness** — temporal train/test split with Recall@K, NDCG@K, MAP and catalog coverage/diversity metrics |
| Medium | **Streaming responses** for the copilot (SSE) to cut perceived latency |
| Medium | **Two-stage ranking** — cheap ANN candidate generation followed by a cross-encoder re-ranker |
| Medium | **Session-based recommendation** — GRU4Rec / transformer sequence model for within-session intent |
| Medium | **A/B testing framework** to measure real CTR and conversion uplift |
| Lower | Multimodal search (CLIP image embeddings), multilingual embeddings, personalised RAG |

---

## 10. Suggested report structure

1. Introduction — domain, problem, objectives, scope
2. Literature review — recommender systems (content/collaborative/hybrid), vector
   retrieval and ANN, LLM agents and function calling, RAG
3. System analysis and design — architecture, why a separate AI service, data model, API design
4. **Methodology (largest chapter)** — §3 of this document, one section per
   algorithm with formulation and justification
5. Data — real catalog, synthetic generation methodology, enrichment pipeline
6. Implementation — clean architecture, DI, offline/online split, security model
7. Results and evaluation — §5: model diagnostics, functional verification,
   performance measurements, testing, audit findings
8. Discussion — engineering findings (reasoning-model token budgets, contract
   mismatches, measurement vs estimation)
9. Limitations and future work — §8 and §9
10. Conclusion
11. References — MiniLM, HNSW, FP-Growth, implicit-feedback CF, RAG
12. Appendices — API reference, hyperparameters, sample transcripts

## 11. Suggested presentation outline (~15 slides)

| # | Slide | Content |
| --- | --- | --- |
| 1 | Title | Project, name, degree, guide |
| 2 | Problem | The three failures in §1.1, with the failing search example |
| 3 | Objectives | Six objectives |
| 4 | Architecture | The tier diagram; why a separate AI service |
| 5 | AI feature map | 12 features grouped: retrieval, recommendation, conversation, content, analytics |
| 6 | Semantic search | MiniLM → 384-d → Qdrant HNSW; cosine formula; before/after example |
| 7 | Feature engineering | Catalog enrichment; "leather shoes for office" → 0.507 result |
| 8 | Recommender I | Why hybrid — the four-algorithm weakness table |
| 9 | Recommender II | Item-item CF maths + measured similarities; FP-Growth lift 1.62–4.44 |
| 10 | Recommender III | Time-decay formula; blend equation; cold-start ladder |
| 11 | Copilot | Agent loop diagram, six tools, memory demo ("size 9" carried forward) |
| 12 | RAG | Pipeline diagram, grounding + refusal, citation-integrity fix |
| 13 | Safety | LLM-never-queries-DB, session-derived identity, prompt-injection fencing, cross-user denial test |
| 14 | Results | Dataset scale, funnel rates, model diagnostics, 55 tests, audit 65→19 |
| 15 | Limitations & future work | Honest limits; LTR, LightFM, offline eval harness |

### Strongest talking points for a viva

- **Lift 1.62–4.44** proves the mined association rules are real, not artefacts.
- **Measuring beat estimating**: 463 MB vs a 1.5–2.5 GB guess → 4× cheaper deployment.
- **Reasoning models need larger token budgets** — truncated `<think>` blocks strip
  to empty answers; a concrete, non-obvious GenAI engineering finding.
- **Security is structural, not procedural** — the unsafe fetch-by-order-id
  operation does not exist; adversarial identity test included.
- **19 confirmed defects from 65 candidates** shows verification discipline, and
  the dominant class (silently disagreeing contracts) is a genuine insight.
- **Every AI path has a non-AI fallback** — popularity floor, hash embedder,
  refusal string. The store never breaks because the AI is unavailable.
