"""Normalize scraped lead data into a consistent schema."""

import hashlib


LEAD_FIELDS = [
    "empresa", "telefone", "email", "site", "cidade", "estado",
    "pais", "nicho", "origem", "observacoes",
]


def normalize_lead(raw: dict, *, nicho: str, pais: str, cidade: str | None, source: str) -> dict:
    """Normalize a raw scraped lead into the standard schema."""
    return {
        "empresa": (raw.get("nome_empresa") or raw.get("empresa") or "").strip() or "Unknown",
        "telefone": (raw.get("telefone") or "").strip() or None,
        "email": (raw.get("email") or "").strip() or None,
        "site": (raw.get("site") or "").strip() or None,
        "cidade": (raw.get("cidade") or cidade or "").strip() or None,
        "estado": (raw.get("estado") or "").strip() or None,
        "pais": (raw.get("pais") or pais).strip(),
        "nicho": (raw.get("nicho") or nicho).strip(),
        "origem": source,
        "observacoes": (raw.get("observacoes") or "").strip(),
    }


def normalize_leads(raws: list[dict], *, nicho: str, pais: str, cidade: str | None, source: str) -> list[dict]:
    """Normalize a batch of raw leads."""
    return [normalize_lead(r, nicho=nicho, pais=pais, cidade=cidade, source=source) for r in raws]


def dedup_fingerprint(lead: dict) -> str:
    """Generate a dedup fingerprint from name + phone."""
    nome = (lead.get("empresa") or lead.get("nome_empresa") or "").strip().lower()
    telefone = (lead.get("telefone") or "").strip().lower()
    base = f"{nome}|{telefone}"
    return hashlib.sha256(base.encode("utf-8")).hexdigest()


def deduplicate(leads: list[dict]) -> list[dict]:
    """Remove duplicates by name + phone fingerprint."""
    seen: set[str] = set()
    unique: list[dict] = []
    for lead in leads:
        fp = dedup_fingerprint(lead)
        if fp in seen:
            continue
        seen.add(fp)
        unique.append(lead)
    return unique
