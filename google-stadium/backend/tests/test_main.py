from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_gates():
    """Phase 2: Test the gates status endpoint as a health check."""
    response = client.get("/gates/status")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)
    # Check that it returns initial data
    assert "1" in response.json()

def test_auth_login_invalid_credentials():
    """Phase 2: Test that /auth/login returns 401 for invalid credentials."""
    response = client.post(
        "/auth/login",
        data={"username": "nonexistentuser", "password": "wrongpassword"}
    )
    # FastAPI OAuth2PasswordRequestForm usually returns 401 for failed auth
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_google_stadium_config():
    """Phase 2: Verify the map configuration endpoint exists."""
    # This might require auth depending on implementation, 
    # but we can check if it exists or returns 401.
    response = client.get("/map/config")
    assert response.status_code in [200, 401]
