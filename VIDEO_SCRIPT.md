# 15-Minute Project Video — Script & Speaker Notes

**How to use this.** Each section has three parts:

- **[SHOW]** — what should be on screen
- **SAY** — the words to speak (written to be spoken, not read)
- **💡 UNDERSTAND** — the reasoning behind those words, so you can answer
  follow-up questions instead of only reciting

### Timing — measured, not guessed

Total spoken content is **2,224 words**, which is **15 min 53 s at 140 words per
minute**, plus roughly 60–90 s of demo pauses (waiting for results to render).
So delivered as written it lands at **≈17 minutes**.

To hit 15:00 exactly, pick one:

| Option | Effect |
| --- | --- |
| **Speak at ~150 wpm** (a normal confident pace) | 14 m 50 s + pauses ≈ 16 min |
| **Cut Section 8 entirely** (Analytics & engineering, 180 words) | 14 m 36 s + pauses ≈ 15.5 min |
| **Do both** | comfortably inside 15 min |

Per-section budget:

| Section | Words | Speaking time |
| --- | --- | --- |
| 1 Introduction | 177 | 1:16 |
| 2 Architecture | 169 | 1:12 |
| 3 Semantic search | 307 | 2:12 |
| 4 Why hybrid | 166 | 1:11 |
| 5 Algorithms | 332 | 2:22 |
| 6 Copilot | 335 | 2:24 |
| 7 RAG & safety | 322 | 2:18 |
| 8 Analytics *(cut first if long)* | 180 | 1:17 |
| 9 Results & close | 236 | 1:41 |

**Never cut** Sections 3, 5, 6 or 7 — they carry the AI content and therefore the
marks. Section 8 is the safe sacrifice; Section 4 can be compressed to two
sentences if desperate.

**Before recording:** have the app running (AI service on 8001, backend on 5000,
frontend on 3000), the copilot signed in as a user with real orders, and a
terminal ready with the test suite.

---

## Section 1 — Introduction & Problem (0:00 – 1:15)

**[SHOW]** The storefront homepage.

> **SAY:**
> "Hello, I'm Aadhaar. This project is an AI Shopping Copilot — I took a
> working shoe e-commerce platform and rebuilt its discovery layer around
> machine learning and generative AI.
>
> Let me start with the problem, because it's concrete. The original site had a
> search box. That search fetched a hundred products and filtered them by
> checking whether the product name contained your typed text. So if a shopper
> searched for 'comfortable office shoes', they got nothing — because no product
> has those words in its name. The shoes existed. The search just couldn't find
> them.
>
> Second problem: every visitor saw an identical homepage. The platform recorded
> no behaviour at all, so it couldn't personalise anything even if we asked it to.
>
> Third: a shopper with a genuine question — 'I have flat feet, what do you
> recommend?' or 'where is my order?' — had nowhere to ask it.
>
> So I set out to solve three things: search that understands meaning,
> recommendations that adapt to the individual, and a conversational assistant
> that can actually act on real data."

**💡 UNDERSTAND**
Opening with a *specific failure* is far stronger than listing features. The
"comfortable office shoes" example proves you understand the difference between
**lexical** matching (comparing characters) and **semantic** matching (comparing
meaning). That distinction is the intellectual foundation of the whole project —
establish it in the first minute and everything after it lands.

---

## Section 2 — Architecture (1:15 – 2:45)

**[SHOW]** The architecture diagram (draw one, or use the blueprint artifact).

> **SAY:**
> "Here's the architecture — three tiers. A Next.js storefront. The existing
> Express and MongoDB backend, which still owns auth, catalog, cart and orders.
> And one new tier I added: a standalone Python FastAPI service that owns
> everything AI.
>
> Why separate? Three reasons. Ecosystem — scikit-learn, sentence-transformers
> and FP-Growth are Python; they don't meaningfully exist in Node. Latency
> profile — an LLM turn takes eleven seconds, a checkout takes fifty
> milliseconds; those don't belong in one process. And blast radius — a model
> loading shouldn't be able to take down order processing.
>
> This is the strangler-fig pattern: capability added alongside the old system
> rather than a rewrite. With a real consequence — if the AI service dies
> entirely, the shop still sells. Every AI feature has a non-AI fallback.
>
> One detail I'll pay off later: the AI service has no public port. The browser
> never reaches it. It talks to Express, which verifies your login, derives your
> user ID server-side, and forwards over a private network with a service token."

**💡 UNDERSTAND**
- **Strangler fig** — a migration pattern where new capability grows around a
  legacy system until it can take over, rather than a risky big-bang rewrite.
- The "no public port" point is worth planting early because you'll pay it off
  in Section 7. Examiners like it when a claim made early is proven later.
- If asked *"why not just use Node?"* — the honest answer is the ML library
  ecosystem. There is no usable FP-Growth or sentence-transformers in Node.

---

## Section 3 — Semantic Search (2:45 – 5:15)

**[SHOW]** Type "comfortable office shoes" in the search bar → results appear.

> **SAY:**
> "Let's start with search. Watch this — I type 'comfortable office shoes', and
> I get a leather Palermo. Those exact words appear nowhere in that product. So
> how did it match?
>
> Instead of comparing text, I convert both the query and every product into a
> vector — a list of 384 numbers that represents meaning. I use a model called
> all-MiniLM-L6-v2, which is a six-layer distilled transformer. It produces
> embeddings where semantically similar text ends up close together in that
> 384-dimensional space.
>
> Then similarity is just geometry. I normalise every vector to unit length,
> which means cosine similarity reduces to a simple dot product. Higher dot
> product, more similar meaning.
>
> Those vectors live in Qdrant, a vector database. Qdrant uses an HNSW index —
> Hierarchical Navigable Small World. Rather than comparing my query against
> every product, it walks a navigable graph, which gives roughly logarithmic
> search time instead of linear. And critically, Qdrant stores filterable
> metadata next to each vector, so a query like 'black sneakers under four
> thousand rupees, in stock' is one single filtered vector search — not search
> then filter.
>
> Now the most important lesson I learned here. Initially search quality was
> poor — and the reason wasn't the model, it was my data. Every product had an
> empty tags field and a hundred-character description. There was almost nothing
> to embed.
>
> So I built a feature-engineering step that derives structured attributes from
> the fields that did exist — material, use case, price band, colour tokens — and
> rewrites descriptions to say who the shoe suits and what it's for. All
> rule-based with regular expressions, so it's deterministic and reproducible.
>
> After that, 'leather shoes for office' returns the leather Palermo at 0.507.
> Same model, same code, better input. In a retrieval system, how you represent
> your documents matters more than how sophisticated your model is."

**💡 UNDERSTAND**
- **Embedding** — a learned mapping from text to a fixed-length numeric vector
  where distance encodes semantic relatedness.
- **Why normalise?** Cosine similarity is `(a·b)/(‖a‖‖b‖)`. If both vectors have
  length 1, the denominator is 1, so it's just `a·b` — cheaper to compute.
- **HNSW** — a multi-layer proximity graph. Search enters at a sparse top layer,
  greedily hops toward the query, then descends. Approximate, but orders of
  magnitude faster than exhaustive comparison.
- **Why rule-based, not LLM-generated descriptions?** Determinism. A graded
  artifact should produce the same output every run. Say this if asked — it shows
  you chose, rather than defaulted.

---

## Section 4 — Recommender: why hybrid (5:15 – 6:30)

**[SHOW]** The homepage AI rails — "Recommended For You", "Trending".

> **SAY:**
> "Next, recommendations. These homepage rails are personalised, and they're
> produced by four different algorithms working together. Let me explain why four
> and not one — because that's the actual design decision.
>
> Content-based filtering compares product attributes. Its strength is that it
> works on a brand-new product with zero interactions, and it's explainable. Its
> weakness is it can't learn taste — it only knows similarity.
>
> Collaborative filtering learns from behaviour: people who liked this also liked
> that. It captures taste, which content-based can't. But it completely fails on
> new users and new items — that's the cold-start problem.
>
> Association rule mining finds products bought together. That's what powers
> 'frequently bought together'. But it needs purchase volume to work.
>
> And popularity, weighted by recency, is my reliable floor. It's not
> personalised, but it always returns something sensible.
>
> So each algorithm covers a specific weakness of the others. That's the argument
> for a hybrid — not that more is better, but that each one fails somewhere the
> others don't."

**💡 UNDERSTAND**
This is the single most examinable part of a recommender project. The framing
"each algorithm covers a specific weakness" is what separates understanding from
listing. **Cold start** has two forms — new *user* (no history to learn from) and
new *item* (no interactions to be collaborative about) — and they need different
solutions. Know that distinction cold.

---

## Section 5 — Recommender: the algorithms (6:30 – 8:30)

**[SHOW]** `app/ml/collaborative.py`, then `association.py`, then the trained
model stats in a terminal.

> **SAY:**
> "Let me go into the two most interesting ones.
>
> For collaborative filtering I use item-to-item cosine similarity. I build a
> user-by-item matrix from the event stream, where each cell is the summed weight
> of that user's interactions — a view is worth 1, a click 1.5, add-to-cart 3, a
> purchase 5. Then I log-transform each cell. That matters: without it, one very
> active user, or somebody refreshing a page, would dominate the similarity
> calculation. The log compresses those extremes.
>
> Item similarity is then the cosine similarity between item columns — so two
> products are similar if the same people interacted with both. I keep the top
> fifty neighbours per item, selected with argpartition, which is linear time
> rather than a full sort.
>
> I chose item-item over matrix factorisation deliberately. It's transparent — I
> can literally explain 'customers who viewed this also viewed that'. And it
> reduces to a precomputed dictionary, so at serving time I don't load NumPy at
> all. On my trained model all thirty items have neighbours, averaging
> twenty-nine each, with similarities between 0.57 and 0.63.
>
> The second algorithm is FP-Growth, for market-basket analysis. I chose it over
> the more common Apriori because Apriori repeatedly rescans the whole
> transaction database and generates candidates explicitly. FP-Growth compresses
> transactions into a tree and mines it recursively — much better scaling.
>
> And I rank rules by lift, not confidence. That's important. Confidence is the
> probability of Y given X, but it's biased toward popular items — a rule saying
> 'anything implies bestseller' has high confidence and tells you nothing. Lift
> divides that by how often Y occurs alone. So lift above one means two products
> genuinely co-occur more than chance predicts.
>
> My model found eighteen rules with lift from 1.62 up to 4.44 — all above one,
> confirming these are real associations, not noise.
>
> Finally, popularity uses exponential time decay with a fourteen-day half-life.
> And everything combines in a weighted blend: forty per cent collaborative,
> twenty content, twenty popularity, ten trending, ten affinity."

**💡 UNDERSTAND**
Definitions, in case you're asked:
- **support(X)** = fraction of baskets containing X
- **confidence(X→Y)** = support(X∪Y) / support(X) = P(Y|X)
- **lift(X→Y)** = confidence / support(Y) — >1 means positive association, 1
  means independence, <1 means they repel
- **Implicit feedback** — you never see ratings, only actions, so you infer
  preference strength from action type. Hence the weights.
- **argpartition** — rearranges an array so the k largest are in the last k
  positions, unordered. O(n) instead of O(n log n) for a full sort.

If asked *"why hand-tuned weights?"*: because learning them needs real
click/purchase labels. The collection pipeline now exists, the data doesn't yet.
That's honest and it's the top item in future work.

---

## Section 6 — The AI Copilot (8:30 – 11:00)

**[SHOW]** Open the copilot. Type: *"I need white running shoes under 12000"*.
Then: *"I usually wear size 9"*. Then: *"now show me something from New Balance"*.

> **SAY:**
> "Now the feature I'm most pleased with — the conversational copilot.
>
> This isn't a chatbot with scripted replies — it's an LLM agent with tools. And
> the rule underneath it is this: the language model never touches my database. It
> never generates a query. It emits a structured tool call, and my Python
> validates the arguments and runs the real query. The AI proposes; my code
> disposes.
>
> There are six tools: semantic search, recommendations, comparison, my orders,
> order details, and policy lookup.
>
> Watch this first message. Behind the scenes the model calls search_products,
> extracting structured filters from my sentence — colour white, category running,
> max price twelve thousand. My code runs that as a real filtered vector search.
> The results go back into the model, and only then does it write an answer. So
> every product it mentions is real. It cannot invent one.
>
> Now memory. I tell it 'I usually wear size nine'. It acknowledges that. Then I
> ask for New Balance without mentioning size again — and look, it says 'size 9'.
> Every message runs through a preference-extraction step that fills slots —
> size, budget, brand, colour — stored in Redis and injected into later tool
> calls automatically.
>
> I also want to be honest about two failures I found by actually using this,
> which unit tests never caught.
>
> First: asked for trekking shoes, which my catalog doesn't stock, it replied
> 'I don't have hiking boots, would you like me to search for running shoes
> instead?' — and returned zero products. It wasted a whole turn asking
> permission. I fixed that with prompt engineering: it now recommends the closest
> thing it has with an honest caveat, in the same reply.
>
> Second, subtler: the product cards didn't match the text. The agent accumulates
> results from every tool call in its loop, so the reply recommended running shoes
> while the cards showed Crocs clogs. I made the reply the source of truth — the
> cards are now filtered to only the products the answer actually names."

**💡 UNDERSTAND**
- **Function/tool calling** — you give the model JSON schemas describing
  available functions. It returns a structured call with arguments instead of
  prose. You execute it and feed the result back. This is what grounds the model
  in real data.
- **Why is "the LLM never touches the DB" a security property?** Because if the
  model generated queries, prompt injection could make it generate a *malicious*
  query. With tool calling, the worst it can do is call an allowed function with
  arguments your validator accepts.
- Volunteering the two failures is deliberate. It demonstrates you evaluated your
  own system rather than only demoing the happy path — and examiners consistently
  reward that.

---

## Section 7 — RAG, orders & safety (11:00 – 12:45)

**[SHOW]** Ask the copilot *"How long do refunds take?"*, then *"Where is my
order?"*. Then show `app/repositories/order_repo.py`.

> **SAY:**
> "Two more capabilities.
>
> First, retrieval-augmented generation. When I ask 'how long do refunds take',
> the model doesn't answer from training data — it would guess, possibly wrong
> about my store. Instead I built a knowledge base: 106 chunks covering returns,
> refund timelines, shipping, payments and cancellations, plus three chunks per
> product, embedded into a separate Qdrant collection. The question is embedded,
> the top five chunks retrieved, and the model instructed to answer only from that
> context and cite it.
>
> And it refuses when it can't. Ask something outside the knowledge base and it
> returns 'I don't have that information' with no citations. I track a grounded
> flag that's only true when real citations exist. A system that can't say 'I
> don't know' isn't trustworthy.
>
> Second — where I was most careful — account questions. 'Where is my order'
> returns my real orders, statuses, payment method and refund status.
>
> That's personal data, so the security is structural, not procedural. Let me show
> the code. Every order lookup requires a user ID, and that ID goes *inside the
> database query*, not a check afterwards. Request an order that isn't yours and
> the query simply returns nothing. There's no if-statement I could forget.
>
> And notice what's absent: there's no function that fetches an order by ID alone.
> The unsafe operation doesn't exist in my codebase.
>
> The user ID always comes from the verified session. If the model puts a user ID
> in its own arguments, I ignore it — and I have a test for exactly that attack:
> the model requesting another user's order while claiming to be them. The session
> wins; the lookup returns not-found.
>
> One last piece: customer reviews flow into a prompt whose output every shopper
> sees. That's a prompt-injection vector. So I sanitise review text, strip angle
> brackets so it can't forge my delimiters, and explicitly tell the model the
> fenced content is untrusted data whose instructions must never be followed."

**💡 UNDERSTAND**
- **RAG** = retrieve relevant documents, put them in the prompt, generate an
  answer constrained to them. It reduces hallucination and lets you update
  knowledge without retraining.
- **Why is filtering inside the query better than checking after?** A check is a
  branch you can forget or get wrong under refactoring. A query filter is
  structural — the wrong data is never fetched. "Make the unsafe thing
  impossible, not merely forbidden."
- **Prompt injection** — untrusted text in a prompt containing instructions the
  model may follow. Reviews are the classic vector in e-commerce.

---

## Section 8 — Analytics & engineering (12:45 – 13:45)

**[SHOW]** The admin analytics dashboard, then run `pytest` in a terminal.

> **SAY:**
> "Everything is instrumented. Five event types — view, click, add-to-cart,
> purchase, search — feed both the recommender and this dashboard: the conversion
> funnel, click-through rate, top products by intent, search behaviour. That same
> stream is what makes collaborative filtering possible, so instrumentation isn't
> an afterthought — it's the input to the models.
>
> On engineering: about 5,600 lines, clean architecture, everything wired in one
> dependency-injection container. That's why all fifty-five tests run with no
> database, no vector store and no language model — every dependency is
> replaceable with a fake.
>
> I also ran a structured code audit: nine parallel reviewers, with two
> independent verifiers per finding to kill false positives. Sixty-five
> candidates, nineteen confirmed, eight refuted.
>
> And the pattern is interesting — almost nothing crashed. The dominant failure
> mode was contracts silently disagreeing across a boundary. My best example: the
> training worker and the serving API each had their own directory for the trained
> model, so the API never loaded it and every recommendation silently fell back to
> popularity. Forever, with no error anywhere. Those are the bugs that scare me."

**💡 UNDERSTAND**
**Dependency injection** — dependencies are passed in rather than created
internally. That's precisely what makes fakes possible in tests. If
`SearchService` constructed its own Qdrant client, you couldn't test it without
Qdrant running.

The "silent failure" point is your strongest engineering-maturity signal. A crash
is easy — you see it. A system confidently returning plausible-but-wrong results
is the dangerous case.

---

## Section 9 — Results, limits & close (13:45 – 15:00)

**[SHOW]** Summary slide with the key numbers.

> **SAY:**
> "To summarise. Thirty products, nine hundred simulated shoppers, thirty
> thousand behavioural events, eight hundred orders, six hundred and seventy
> reviews. Fourteen AI endpoints. Fifty-five tests passing.
>
> On model quality: association rules with lift up to 4.44, collaborative
> filtering covering every item, and popularity and trending producing genuinely
> different rankings — confirming the time decay does real work.
>
> One measurement I'd highlight. I estimated the embedding model needed one and a
> half to two and a half gigabytes. I measured it instead: four hundred and
> sixty-three megabytes. That single measurement took my hosting from
> forty-eight dollars a month to twelve. Measure, don't estimate.
>
> Now the limitations, honestly. My catalog is thirty products, almost all
> sneakers — if someone asks for trekking boots, no algorithm can retrieve what
> isn't there.
>
> And my interaction data is synthetic. It's structured rather than random, and the
> models demonstrably learn from it, but it comes from a process I wrote. So I have
> deliberately *not* claimed precision or recall figures — those would measure how
> well my models recover my own generator, which is circular. I report model
> diagnostics instead. My ranking weights are also hand-tuned, not learned,
> because learning them needs real click data.
>
> So future work: a learning-to-rank model on real labels, matrix factorisation
> with LightFM benchmarked against item-item on Recall@K and NDCG, and an offline
> evaluation harness with a temporal train-test split.
>
> Thank you — happy to take questions."

**💡 UNDERSTAND**
Stating the synthetic-data circularity **before** anyone asks converts your
biggest weakness into evidence of methodological awareness. If you claimed 92%
precision on synthetic data and an examiner spotted the circularity, you'd lose
far more than you gained.

---

## Likely questions — and answers

**"Why not use ChatGPT's API?"**
The architecture is provider-agnostic — I use an OpenAI-compatible interface, so
swapping providers is a config change. I used a MiniMax gateway available to me.
Notably these are *reasoning* models, which taught me something: they emit hidden
chain-of-thought before visible text, so if a token budget is too small the reply
truncates mid-thought and strips to empty. I had to raise budgets to 1500 tokens.

**"How do you know your recommendations are good?"**
I don't claim accuracy uplift, and I'm explicit about that. What I can show is
that the algorithms learned real structure: lift above 1 on every mined rule,
full item coverage in collaborative filtering, and trending diverging from raw
popularity. Proving *uplift* needs an A/B test on real traffic — that's future
work, not a claim I'll make.

**"What's the hardest bug you fixed?"**
The shared model artifact. The trainer and the API each had their own container
directory, so the API never saw the trained model and every recommendation
silently degraded to popularity — permanently, with no error. It's the class of
bug I find most dangerous: the system looks healthy and is quietly wrong.

**"Why item-item CF instead of deep learning?"**
Data volume. With thirty items and thirty thousand events, a neural
recommender would overfit badly and I couldn't validate it. Item-item is
appropriate at this scale, transparent, and cheap to serve. Sequence models like
GRU4Rec are in my future work for when there's real traffic.

**"Is the LLM making up product details?"**
It can't. Every product it mentions comes from a tool result — my code ran the
query. And I added a step that filters the displayed cards to only products the
reply actually names, so text and cards can't disagree.

**"What would you do differently?"**
Instrument first. I built recommenders before event tracking existed, so my early
models had nothing to learn from. Behavioural data is the input to everything —
it should have been step one.

---

## Delivery tips

1. **Rehearse Sections 3, 5 and 6 most.** They carry the AI content and the
   marks.
2. **Let demos breathe.** After typing a query, pause and let the result appear
   before speaking. Silence looks confident.
3. **Have the copilot pre-warmed.** The first request loads the embedding model —
   do a throwaway query before recording so you don't narrate a 15-second wait.
4. **Say numbers slowly.** "Lift of four point four four" needs more space than
   surrounding prose.
5. **If a demo fails, keep going.** Say "that's the AI service cold-starting" and
   move on. Do not debug on camera.
6. **Record the demos separately** if live typing makes you nervous, then narrate
   over the footage.
7. **Keep the honest limitations in.** They read as confidence, not weakness.
