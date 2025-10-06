import pytest


@pytest.mark.asyncio
async def test_register_login_and_profile_flow(client):
    register_payload = {
        "email": "newuser@example.com",
        "password": "strongpassword",
        "full_name": "New User",
    }

    register_response = await client.post("/auth/register", json=register_payload)
    assert register_response.status_code == 200
    register_data = register_response.json()
    assert register_data["token_type"] == "bearer"
    assert register_data["access_token"]
    assert register_data["refresh_token"]

    # Newly issued access token should let us fetch the current profile
    profile_response = await client.get(
        "/users/me", headers={"Authorization": f"Bearer {register_data['access_token']}"}
    )
    assert profile_response.status_code == 200
    profile_data = profile_response.json()
    assert profile_data["email"] == register_payload["email"]

    # And we can authenticate again with the same credentials
    login_response = await client.post(
        "/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["access_token"]
    assert login_data["refresh_token"]
