"""Realistic synthetic interaction generator.

Produces the behavioural history the AI features need — collaborative filtering,
association-rule bundles, ranking, review summarization and the analytics
dashboard all read what this writes.

Everything it inserts is tagged ``synthetic: true``, so ``--reset`` removes it
cleanly and it never touches organically-created documents.

What makes the data realistic (rather than uniform noise the models can't learn):

* **Latent taste profiles** — each shopper has preferred gender/brands/category,
  a budget with a tolerance, a size, and an activity level. Interactions are
  sampled from that profile, so genuine user-user and item-item structure exists.
* **A real funnel** — view -> click -> add_to_cart -> purchase, with conversion
  probabilities that fall at each stage and scale with affinity.
* **Complementary pairs** — a hidden affinity graph makes certain products
  co-occur in baskets, so FP-Growth finds rules with real lift instead of noise.
* **Temporal shape** — 120 days of history with weekend peaks and a recency
  ramp, so time-decayed popularity and "trending" differ from all-time counts.
* **Aspect-based reviews** — varied sentences about fit, comfort, durability,
  style, value and delivery, so LLM review summarization has real themes to find.

Usage:
    python -m scripts.seed_interactions --users 600
    python -m scripts.seed_interactions --users 600 --reset     # wipe synthetic first
    python -m scripts.seed_interactions --reset-only            # just clean up
"""

from __future__ import annotations

import argparse
import datetime as dt
import math
import random

from pymongo import InsertOne, MongoClient

from app.core.config import get_settings

SYNTH = {"synthetic": True}
NOW = dt.datetime.now(dt.timezone.utc)
HISTORY_DAYS = 120
BATCH = 1000

FIRST = ["Aarav", "Diya", "Kabir", "Ananya", "Vivaan", "Isha", "Reyansh", "Myra", "Arjun",
         "Sara", "Advait", "Kiara", "Rohan", "Naina", "Dev", "Tara", "Ishaan", "Anika",
         "Aditya", "Riya", "Vihaan", "Meera", "Kartik", "Pooja", "Nikhil", "Shreya",
         "Rahul", "Sneha", "Aryan", "Divya", "Manav", "Neha", "Siddharth", "Priya"]
LAST = ["Sharma", "Verma", "Iyer", "Nair", "Reddy", "Kapoor", "Mehta", "Bose", "Chopra",
        "Rao", "Gupta", "Malhotra", "Joshi", "Desai", "Banerjee", "Pillai"]

# --- Review corpus: aspect-based so summarization finds genuine themes --------
REVIEW_BANK: dict[str, dict[str, list[str]]] = {
    "comfort": {
        "pos": [
            "Incredibly comfortable straight out of the box — no break-in period at all.",
            "Cushioning is excellent, I wore these for a 10-hour shift and my feet were fine.",
            "The insole support is genuinely good, my usual arch pain didn't show up.",
            "Light and breathable; my feet don't get sweaty even in Chennai humidity.",
        ],
        "neg": [
            "Comfortable for short walks but the arch support gives up after a few hours.",
            "The tongue rubs against my ankle, had to wear thicker socks.",
            "Stiffer than expected, took nearly two weeks to break in properly.",
        ],
    },
    "sizing": {
        "pos": [
            "True to size, ordered my usual 9 and the fit is spot on.",
            "Fits exactly as expected, and there's room in the toe box.",
            "Wide feet here — these were the first pair in ages that didn't pinch.",
        ],
        "neg": [
            "Runs about half a size small, definitely size up if you're between sizes.",
            "Narrow fit. If you have wide feet, look elsewhere.",
            "The sizing chart is misleading, my usual size was far too tight.",
        ],
    },
    "durability": {
        "pos": [
            "Six months of daily wear and the sole still looks almost new.",
            "Stitching quality is solid, nothing has come loose.",
            "Survived the monsoon without the sole separating, very impressed.",
        ],
        "neg": [
            "The outsole wore down noticeably after about two months of regular use.",
            "Glue started coming apart near the toe within weeks. Disappointing at this price.",
            "The colour faded faster than I expected after a few washes.",
        ],
    },
    "style": {
        "pos": [
            "Looks even better in person than in the photos. Constant compliments.",
            "Goes with literally everything, jeans or joggers.",
            "The colourway is gorgeous, exactly as pictured.",
        ],
        "neg": [
            "The shade is noticeably different from the product photos — more grey than white.",
            "Bulkier than it looks online, not the sleek profile I wanted.",
        ],
    },
    "value": {
        "pos": [
            "Great value at this price, would happily buy a second pair.",
            "Cheaper than the big-brand equivalent and honestly just as good.",
        ],
        "neg": [
            "Decent shoe but overpriced for what you actually get.",
            "Okay for the money, nothing that justifies the premium.",
        ],
    },
    "delivery": {
        "pos": [
            "Arrived in two days, well packaged, genuine product with tags intact.",
            "Fast delivery and the box arrived undamaged.",
            "Ordered Friday, had them by Sunday. Packaging was spotless.",
        ],
        "neg": [
            "Delivery took over a week longer than promised.",
            "Box arrived crushed, though the shoes themselves were fine.",
            "Tracking sat on 'shipped' for four days with no updates.",
        ],
    },
    "grip": {
        "pos": [
            "Grip is excellent, no slipping even on wet tiles.",
            "Traction on the outsole is genuinely good on loose gravel.",
            "Held up fine on a damp morning walk, no skidding at all.",
        ],
        "neg": [
            "The sole is slippery on smooth wet surfaces — nearly went down once.",
            "Tread wears smooth quickly, grip drops off after a couple of months.",
        ],
    },
    "weight": {
        "pos": [
            "Surprisingly light for how substantial they look.",
            "Barely notice them on long days, they feel almost weightless.",
        ],
        "neg": [
            "Heavier than I expected. Noticeable by the end of a long day.",
            "Chunky and a bit clumsy if you're used to minimal shoes.",
        ],
    },
    "breathability": {
        "pos": [
            "Mesh upper keeps my feet cool even in peak summer.",
            "No sweating or odour after full days of wear.",
        ],
        "neg": [
            "Gets warm quickly — not ideal for Indian summers.",
            "Very little airflow, my feet were damp after an hour.",
        ],
    },
    "authenticity": {
        "pos": [
            "100% genuine, box and tags all correct. No doubts at all.",
            "Verified against the brand's site — completely authentic.",
        ],
        "neg": [
            "Stitching looked slightly off compared to my previous pair.",
        ],
    },
}

SEARCH_TERMS = [
    "running shoes", "white sneakers", "black sneakers", "casual shoes", "gym trainers",
    "comfortable walking shoes", "nike air max", "jordan retro", "adidas originals",
    "new balance 550", "crocs clogs", "shoes under 5000", "trending sneakers",
    "best running shoes", "converse chuck taylor", "sneakers for women",
    "lightweight running shoes", "shoes for flat feet", "waterproof shoes", "puma sneakers",
]


def rand_ts() -> dt.datetime:
    """A timestamp with weekend peaks and a recency ramp."""
    for _ in range(12):
        age = random.random() ** 1.6 * HISTORY_DAYS  # bias toward recent
        ts = NOW - dt.timedelta(days=age, hours=random.uniform(0, 24))
        weight = 1.4 if ts.weekday() >= 5 else 1.0
        if random.random() < weight / 1.4:
            return ts
    return NOW - dt.timedelta(days=random.uniform(0, HISTORY_DAYS))


def build_profile(brands: list[str], categories: list[str]) -> dict:
    return {
        "gender": random.choice(["male", "female"]),
        "brands": set(random.sample(brands, k=min(random.randint(1, 3), len(brands)))),
        "categories": set(random.sample(categories, k=min(1, len(categories)))),
        "budget": random.choice([3000, 4500, 6000, 9000, 13000]),
        "tolerance": random.uniform(0.45, 1.3),
        "size": str(random.choice([6, 7, 8, 9, 10, 11])),
        "activity": random.choice([0.4, 0.7, 1.0, 1.0, 1.5, 2.4]),  # a few power users
    }


def affinity(profile: dict, product: dict) -> float:
    score = 1.0
    gender = (product.get("for") or "").lower()
    if gender and gender == profile["gender"]:
        score *= 2.4
    if product.get("brand") in profile["brands"]:
        score *= 2.6
    if product.get("category") in profile["categories"]:
        score *= 1.6
    price = product.get("price") or profile["budget"]
    diff = (price - profile["budget"]) / (profile["budget"] * profile["tolerance"])
    score *= math.exp(-0.5 * diff * diff) + 0.12
    return max(score, 0.01)


def weighted_sample(items: list, weights: list[float], k: int) -> list:
    pool = list(zip(items, weights))
    out = []
    for _ in range(min(k, len(pool))):
        total = sum(w for _, w in pool) or 1.0
        r = random.uniform(0, total)
        acc = 0.0
        for idx, (it, w) in enumerate(pool):
            acc += w
            if acc >= r:
                out.append(it)
                pool.pop(idx)
                break
    return out


def make_review(rating: int) -> str:
    """Compose 1-2 aspect sentences consistent with the star rating."""
    aspects = random.sample(list(REVIEW_BANK), k=random.randint(1, 2))
    tone = "pos" if rating >= 4 else "neg" if rating <= 2 else random.choice(["pos", "neg"])
    parts = [random.choice(REVIEW_BANK[a][tone]) for a in aspects]
    if rating == 3 and len(parts) == 1:
        other = random.choice([a for a in REVIEW_BANK if a not in aspects])
        parts.append(random.choice(REVIEW_BANK[other]["neg"]))
    return " ".join(parts)


def main() -> None:
    settings = get_settings()
    ap = argparse.ArgumentParser(description="Seed realistic synthetic interactions.")
    ap.add_argument("--users", type=int, default=600)
    ap.add_argument("--reset", action="store_true", help="Delete synthetic data first")
    ap.add_argument("--reset-only", action="store_true", help="Delete synthetic data and exit")
    ap.add_argument("--mongo-uri", default=settings.mongo_uri)
    ap.add_argument("--db", default=settings.mongo_db)
    ap.add_argument("--seed", type=int, default=7)
    args = ap.parse_args()

    random.seed(args.seed)
    client = MongoClient(args.mongo_uri)
    db = client[args.db]
    collections = ("users", "events", "orders", "orderitems", "reviews",
                   "orderstatushistories", "payments")

    if args.reset or args.reset_only:
        for col in collections:
            n = db[col].delete_many(SYNTH).deleted_count
            print(f"reset {col:22}: removed {n}")
        if args.reset_only:
            client.close()
            return

    products = list(db["products"].find(
        {}, {"_id": 1, "price": 1, "brand": 1, "category": 1, "for": 1, "colors": 1, "sizes": 1}
    ))
    if len(products) < 5:
        raise SystemExit(f"Need products in {args.db}.products first (found {len(products)}).")
    for p in products:
        p["category"] = str(p["category"]) if p.get("category") else None
    brands = sorted({p["brand"] for p in products if p.get("brand")})
    categories = sorted({p["category"] for p in products if p.get("category")})
    print(f"catalog: {len(products)} products · {len(brands)} brands · {len(categories)} categories")

    # Hidden complement graph -> gives FP-Growth genuine rules to discover.
    complements: dict[str, list[str]] = {}
    ids = [str(p["_id"]) for p in products]
    for pid in ids:
        partners = [q for q in ids if q != pid]
        complements[pid] = random.sample(partners, k=min(3, len(partners)))

    counts = {k: 0 for k in ("users", "events", "orders", "orderitems", "reviews",
                         "payments", "statushistory")}
    buf: dict[str, list] = {k: [] for k in ("events", "orders", "orderitems", "reviews",
                                            "orderstatushistories", "payments")}
    reviewed: set[tuple[str, str]] = set()

    def flush(col: str, force: bool = False) -> None:
        if buf[col] and (force or len(buf[col]) >= BATCH):
            db[col].bulk_write(buf[col], ordered=False)
            buf[col] = []

    print(f"generating {args.users} shoppers...")
    for i in range(args.users):
        profile = build_profile(brands, categories)
        name = f"{random.choice(FIRST)} {random.choice(LAST)}"
        user_id = db["users"].insert_one({
            "fullName": name,
            "email": f"shopper{i}.s{args.seed}@urban-sole.test",
            # bcrypt-shaped placeholder; these accounts are never logged into.
            "password": "$2b$10$syntheticplaceholderhashonlyneverusedforlogin00",
            "role": "customer", "refreshToken": None,
            "createdAt": NOW - dt.timedelta(days=random.uniform(0, HISTORY_DAYS + 60)),
            "updatedAt": NOW, **SYNTH,
        }).inserted_id
        uid = str(user_id)
        counts["users"] += 1

        weights = [affinity(profile, p) for p in products]
        n_sessions = max(1, int(random.gauss(4.5, 1.8) * profile["activity"]))

        for _ in range(n_sessions):
            session_id = f"s-{uid[-6:]}-{random.randint(100000, 999999)}"
            t0 = rand_ts()

            if random.random() < 0.55:
                buf["events"].append(InsertOne({
                    "userId": uid, "sessionId": session_id, "type": "search",
                    "productId": None, "query": random.choice(SEARCH_TERMS),
                    "weight": 0.5, "ts": t0, "metadata": {}, **SYNTH,
                }))
                counts["events"] += 1

            viewed = weighted_sample(products, weights, random.randint(2, 7))
            basket: list[dict] = []

            for p in viewed:
                pid = str(p["_id"])
                aff = affinity(profile, p)
                ts = t0 + dt.timedelta(minutes=random.uniform(0, 25))

                buf["events"].append(InsertOne({
                    "userId": uid, "sessionId": session_id, "type": "view",
                    "productId": pid, "query": None, "weight": 1.0, "ts": ts,
                    "metadata": {}, **SYNTH,
                }))
                counts["events"] += 1

                # view -> click
                if random.random() < min(0.55, 0.10 * aff):
                    buf["events"].append(InsertOne({
                        "userId": uid, "sessionId": session_id, "type": "click",
                        "productId": pid, "query": None, "weight": 1.5,
                        "ts": ts + dt.timedelta(seconds=random.uniform(20, 240)),
                        "metadata": {}, **SYNTH,
                    }))
                    counts["events"] += 1

                    # click -> cart
                    if random.random() < min(0.45, 0.16 * aff):
                        buf["events"].append(InsertOne({
                            "userId": uid, "sessionId": session_id, "type": "add_to_cart",
                            "productId": pid, "query": None, "weight": 3.0,
                            "ts": ts + dt.timedelta(minutes=random.uniform(2, 8)),
                            "metadata": {}, **SYNTH,
                        }))
                        counts["events"] += 1

                        if random.random() < 0.45:  # cart -> purchase
                            basket.append(p)
                            # complementary add-on, which is what ARM should learn
                            if random.random() < 0.42:
                                comp_id = random.choice(complements[pid])
                                comp = next((q for q in products if str(q["_id"]) == comp_id), None)
                                if comp and comp not in basket:
                                    basket.append(comp)

            if basket:
                order_ts = t0 + dt.timedelta(minutes=random.uniform(25, 60))
                total = sum(b.get("price", 0) for b in basket)
                status = random.choices(
                    ["delivered", "shipped", "paid", "cancelled"], weights=[68, 14, 10, 8]
                )[0]
                order_id = db["orders"].insert_one({
                    "userId": user_id, "totalAmount": total, "currentStatus": status,
                    "createdAt": order_ts, "updatedAt": order_ts, **SYNTH,
                }).inserted_id
                counts["orders"] += 1

                # A real progression, not a single row — "where is my order"
                # needs a timeline the copilot can actually narrate.
                progression = {
                    "pending":   ["pending"],
                    "paid":      ["pending", "paid"],
                    "shipped":   ["pending", "paid", "shipped"],
                    "delivered": ["pending", "paid", "shipped", "delivered"],
                    "cancelled": ["pending", "paid", "cancelled"],
                }[status]
                step_ts = order_ts
                for i, st in enumerate(progression):
                    buf["orderstatushistories"].append(InsertOne({
                        "orderId": order_id, "status": st, "changedAt": step_ts, **SYNTH,
                    }))
                    counts["statushistory"] += 1
                    # pending->paid is minutes; later stages are days apart.
                    step_ts = step_ts + dt.timedelta(
                        minutes=random.uniform(2, 20) if i == 0
                        else random.uniform(900, 2600)
                    )

                # Payment record. Pending orders never captured; cancelled ones
                # captured then refunded; everything else succeeded.
                pay_status = "pending" if status == "pending" else "success"
                if status == "pending" and random.random() < 0.45:
                    pay_status = "failed"
                buf["payments"].append(InsertOne({
                    "orderId": order_id,
                    "amount": total,
                    "paymentMethod": random.choices(
                        ["stripe", "upi", "card", "netbanking", "wallet"],
                        weights=[30, 34, 22, 8, 6],
                    )[0],
                    "paymentStatus": pay_status,
                    "transactionId": "pi_" + "".join(
                        random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=24)
                    ),
                    "createdAt": order_ts + dt.timedelta(minutes=random.uniform(1, 6)),
                    "updatedAt": order_ts + dt.timedelta(minutes=random.uniform(6, 12)),
                    **SYNTH,
                }))
                counts["payments"] += 1

                for b in basket:
                    bid = str(b["_id"])
                    qty = random.choices([1, 2], weights=[88, 12])[0]
                    buf["orderitems"].append(InsertOne({
                        "orderId": order_id, "productId": b["_id"], "quantity": qty,
                        "price": b.get("price", 0),
                        "selectedColor": (b.get("colors") or [None])[0],
                        "selectedSize": (random.choice(b["sizes"]) if b.get("sizes")
                                         else profile["size"]),
                        "createdAt": order_ts, "updatedAt": order_ts, **SYNTH,
                    }))
                    counts["orderitems"] += 1

                    buf["events"].append(InsertOne({
                        "userId": uid, "sessionId": session_id, "type": "purchase",
                        "productId": bid, "query": None, "weight": 5.0, "ts": order_ts,
                        "metadata": {"orderId": str(order_id)}, **SYNTH,
                    }))
                    counts["events"] += 1

                    # Reviews only from delivered orders, and only once per (user, product).
                    key = (bid, uid)
                    if status == "delivered" and key not in reviewed and random.random() < 0.80:
                        reviewed.add(key)
                        rating = random.choices([5, 4, 3, 2, 1], weights=[42, 29, 15, 9, 5])[0]
                        buf["reviews"].append(InsertOne({
                            "userId": user_id, "productId": b["_id"], "rating": rating,
                            "reviewText": make_review(rating),
                            "createdAt": order_ts + dt.timedelta(days=random.uniform(2, 30)),
                            "updatedAt": NOW, **SYNTH,
                        }))
                        counts["reviews"] += 1

        for col in buf:
            flush(col)

        if (i + 1) % 100 == 0:
            print(f"  {i + 1}/{args.users} shoppers · {counts['events']} events so far")

    for col in buf:
        flush(col, force=True)

    print("\nseed complete:")
    for k, v in counts.items():
        print(f"  {k:12}: {v:,}")

    # Keep denormalised review stats on the product in step with reality.
    print("\nrefreshing product rating aggregates...")
    updated = 0
    for row in db["reviews"].aggregate([
        {"$group": {"_id": "$productId", "avg": {"$avg": "$rating"}, "n": {"$sum": 1}}}
    ]):
        db["products"].update_one(
            {"_id": row["_id"]},
            {"$set": {"averageRating": round(row["avg"], 2), "totalReviews": row["n"],
                      "rating": round(row["avg"], 2), "ratedBy": row["n"]}},
        )
        updated += 1
    print(f"  updated {updated} products")
    client.close()


if __name__ == "__main__":
    main()
