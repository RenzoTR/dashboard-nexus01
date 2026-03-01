"""Build search queries for different engines."""


def build_google_maps_query(nicho: str, cidade: str | None, pais: str) -> str:
    """Build a Google Maps search query string.

    Format: "{nicho} in {cidade}, {pais}" or "{nicho} in {pais}" if no city.
    """
    parts = [nicho]
    if cidade:
        parts.append(f"in {cidade}, {pais}")
    else:
        parts.append(f"in {pais}")
    return " ".join(parts)


def build_workana_query(keyword: str, pais: str | None = None) -> str:
    """Build a Workana job search query.

    No fixed niches — any keyword is valid.
    """
    parts = [keyword]
    if pais:
        parts.append(pais)
    return " ".join(parts)
