def test_health_is_live(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["service"] == "urban-sole-ai"


def test_ready_reports_dependencies(client):
    r = client.get("/ready")
    # No infra in the test env -> not ready, but the probe must respond cleanly.
    assert r.status_code in (200, 503)
    body = r.json()
    assert set(body["dependencies"]) == {"mongo", "redis", "qdrant"}


def test_protected_route_requires_service_token(client):
    r = client.post("/v1/recommend", json={"section": "trending", "limit": 5})
    assert r.status_code == 401


def test_openapi_exposes_full_surface(client):
    spec = client.get("/openapi.json").json()
    paths = spec["paths"]
    for expected in (
        "/v1/semantic-search", "/v1/recommend", "/v1/chat",
        "/v1/compare-products", "/v1/summarize-reviews", "/v1/bundles",
        "/v1/ask", "/v1/events", "/v1/rerank",
    ):
        assert expected in paths, f"missing endpoint {expected}"
