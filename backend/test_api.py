from fastapi.testclient import TestClient
from backend.main import app, manager, SimulationSession

client = TestClient(app)

def test_metrics_api():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "description" in data
    assert data["active_sessions"] == 0

def test_simulation_session_tick():
    session = SimulationSession(load_profile="high")
    assert session.base_incoming == 30
    
    # Tick 1
    state = session.tick()
    assert state["time"] == 1
    assert state["static"]["incoming"] == 30
    assert "queue_length" in state["static"]
    
    # The adaptive model should eventually throttle
    assert "is_throttling" in state["adaptive"]

def test_websocket_connect():
    # FastAPI TestClient has built-in websocket context manager
    with client.websocket_connect("/ws/stream/test_client_id") as websocket:
        # Before sending start, no sessions exist
        assert "test_client_id" in manager.active_connections
        
        websocket.send_json({"action": "start", "load": "medium"})
        
        # We should receive 100 ticks and then a complete
        reply = websocket.receive_json()
        assert reply["type"] == "tick"
        assert "data" in reply
        assert reply["data"]["time"] == 1
        
        # Stop manually to not hang the test receiving all ticks
        websocket.send_json({"action": "stop"})
        stopped_reply = websocket.receive_json()
        
        assert stopped_reply["type"] == "stopped"

