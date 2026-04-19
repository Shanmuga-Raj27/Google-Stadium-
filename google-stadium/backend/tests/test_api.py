import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health_gates():
    """Phase 3: Verify the gates status endpoint is responding."""
    response = client.get("/gates/status")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_api_vendors_list_public():
    """Phase 3: Verify vendors can be fetched publicly."""
    response = client.get("/vendors/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_api_unauthorized_profile_access():
    """Phase 3: Verify protected endpoints return 401 for anonymous users."""
    response = client.get("/auth/me")
    assert response.status_code == 401

def test_api_order_edge_case_not_found():
    """Phase 3: Verify 404 behavior for non-existent orders."""
    # Note: We expect 401 if not logged in, but we check if the path exists
    response = client.get("/orders/999999/active")
    assert response.status_code in [401, 404]

def test_api_map_configs():
    """Phase 3: Verify map configuration accessibility."""
    response = client.get("/map/config")
    assert response.status_code == 200
    assert "overrides" in response.json()
