"""Model artifact persistence + versioning.

A trained ``RecModel`` (item-item CF + association rules + popularity/trending)
is pickled to ``artifacts_dir`` with a timestamp version, and a ``current.json``
pointer names the live version. Serving loads the latest lazily and hot-reloads
when the pointer changes. Disk is fine here; production would back this with an
object store so all replicas share one artifact.
"""

from __future__ import annotations

import datetime as dt
import json
import pickle
from dataclasses import dataclass, field
from pathlib import Path

from app.core.logging import get_logger
from app.ml.association import AssociationRules
from app.ml.collaborative import ItemCF

logger = get_logger("app.artifacts")


@dataclass
class RecModel:
    version: str
    item_cf: ItemCF
    rules: AssociationRules
    popularity: dict[str, float] = field(default_factory=dict)   # normalized
    trending: dict[str, float] = field(default_factory=dict)     # normalized
    item_ids: list[str] = field(default_factory=list)
    stats: dict = field(default_factory=dict)

    @staticmethod
    def new_version() -> str:
        return dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d%H%M%S")


class ArtifactStore:
    def __init__(self, artifacts_dir: str) -> None:
        self._dir = Path(artifacts_dir)
        self._pointer = self._dir / "current.json"
        self._cached: RecModel | None = None
        self._cached_version: str | None = None

    def save(self, model: RecModel) -> Path:
        self._dir.mkdir(parents=True, exist_ok=True)
        path = self._dir / f"recmodel-{model.version}.pkl"
        with path.open("wb") as fh:
            pickle.dump(model, fh, protocol=pickle.HIGHEST_PROTOCOL)
        self._pointer.write_text(json.dumps({"version": model.version}))
        self._cached, self._cached_version = model, model.version
        logger.info("artifact_saved", extra={"version": model.version, "path": str(path)})
        return path

    def _current_version(self) -> str | None:
        if not self._pointer.exists():
            return None
        try:
            return json.loads(self._pointer.read_text()).get("version")
        except (json.JSONDecodeError, OSError):
            return None

    def load_latest(self) -> RecModel | None:
        version = self._current_version()
        if version is None:
            return None
        if self._cached is not None and self._cached_version == version:
            return self._cached
        path = self._dir / f"recmodel-{version}.pkl"
        if not path.exists():
            return None
        with path.open("rb") as fh:
            model = pickle.load(fh)  # noqa: S301 — trusted, self-produced artifact
        self._cached, self._cached_version = model, version
        logger.info("artifact_loaded", extra={"version": version})
        return model
