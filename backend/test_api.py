from fastapi.testclient import TestClient
from backend.legacy_simulator import app, manager, SimulationSession

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
    
    
    state = session.tick()
    assert state["time"] == 1
    assert state["static"]["incoming"] == 30
    assert "queue_length" in state["static"]
    
    
    assert "is_throttling" in state["adaptive"]

def test_websocket_connect():
    
    with client.websocket_connect("/ws/stream/test_client_id") as websocket:
        
        assert "test_client_id" in manager.active_connections
        
        websocket.send_json({"action": "start", "load": "medium"})
        
        
        reply = websocket.receive_json()
        assert reply["type"] == "tick"
        assert "data" in reply
        assert reply["data"]["time"] == 1
        
        
        websocket.send_json({"action": "stop"})
        stopped_reply = websocket.receive_json()
        
        assert stopped_reply["type"] == "stopped"

