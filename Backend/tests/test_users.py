import secrets
from uuid import UUID

import pytest
import pytest_asyncio

from app.schemas import user as user_schemas
from app.services import users as user_service


@pytest_asyncio.fixture
async def superuser_headers(session_factory, client):
    email = f"admin_{secrets.token_hex(4)}@example.com"
    password = "SuperSecret123!"
    async with session_factory() as session:
        await user_service.create_user(
            session,
            user_schemas.UserCreate(
                email=email,
                password=password,
                is_superuser=True,
            ),
        )

    response = await client.post("/auth/login", json={"email": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def regular_user_headers(session_factory, client):
    email = f"user_{secrets.token_hex(4)}@example.com"
    password = "UserPassword123!"
    async with session_factory() as session:
        await user_service.create_user(
            session,
            user_schemas.UserCreate(
                email=email,
                password=password,
                is_superuser=False,
            ),
        )

    response = await client.post("/auth/login", json={"email": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_superuser_can_list_users(client, session_factory, superuser_headers):
    # Seed an additional user
    async with session_factory() as session:
        await user_service.create_user(
            session,
            user_schemas.UserCreate(
                email="member@example.com",
                password="Password123!",
                full_name="Member",
            ),
        )

    response = await client.get("/users/", headers=superuser_headers)
    assert response.status_code == 200
    data = response.json()
    assert any(user["email"] == "member@example.com" for user in data)


@pytest.mark.asyncio
async def test_non_superuser_cannot_access_management(client, regular_user_headers):
    list_response = await client.get("/users/", headers=regular_user_headers)
    assert list_response.status_code == 403


@pytest.mark.asyncio
async def test_superuser_can_manage_users(client, session_factory, superuser_headers):
    create_payload = {
        "email": "managed@example.com",
        "password": "ManagedPass123!",
        "full_name": "Managed User",
        "is_superuser": False,
    }
    create_response = await client.post("/users/", json=create_payload, headers=superuser_headers)
    assert create_response.status_code == 201
    created_user = create_response.json()
    user_id = UUID(created_user["id"])
    assert created_user["email"] == create_payload["email"]
    assert created_user["is_superuser"] is False

    update_payload = {
        "full_name": "Managed User Updated",
        "is_active": False,
        "password": "NewPassword456!",
    }
    update_response = await client.patch(
        f"/users/{user_id}", json=update_payload, headers=superuser_headers
    )
    assert update_response.status_code == 200
    updated_user = update_response.json()
    assert updated_user["full_name"] == "Managed User Updated"
    assert updated_user["is_active"] is False

    delete_response = await client.delete(f"/users/{user_id}", headers=superuser_headers)
    assert delete_response.status_code == 204

    # Ensure the user is gone
    list_response = await client.get("/users/", headers=superuser_headers)
    emails = [user["email"] for user in list_response.json()]
    assert "managed@example.com" not in emails
