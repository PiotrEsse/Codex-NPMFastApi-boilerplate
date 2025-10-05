import pytest


@pytest.mark.asyncio
async def test_cors_preflight_allows_frontend_origin(client):
    response = await client.options(
        "/auth/register",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] in {"*", "http://localhost:5173"}
