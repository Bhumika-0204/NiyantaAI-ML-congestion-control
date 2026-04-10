from locust import HttpUser, task, between, events
import time
import random

# ==============================================================================
# Niyanta AI vs Traditional NGINX Benchmarking Suite
# Run: locust -f locustfile.py --host=http://localhost:8000
# Target Metrics: Latency, Throughput, Failure Rates (429s/500s)
# ==============================================================================

class APIStressTester(HttpUser):
    # Aggressively simulate traffic. Wait time between user requests is minimal.
    wait_time = between(0.01, 0.1)

    def on_start(self):
        """ Setup: Each simulated user gets an API Key and IP """
        self.ip_address = f"192.168.1.{random.randint(1, 200)}"
        self.headers = {
            "Authorization": "Bearer TEST_JWT_TOKEN_12345",
            "X-Client-IP": self.ip_address
        }

    @task(4)
    def standard_api_request(self):
        """ 
        Simulates standard valid traffic hitting the backend via the Gateway. 
        Evaluating Niyanta's <10ms overhead processing time.
        """
        start_time = time.time()
        with self.client.post(
            "/analyze-request", 
            headers=self.headers, 
            json={"payload_size": 512, "endpoint": "/api/users"}, 
            catch_response=True
        ) as response:
            latency = (time.time() - start_time) * 1000
            
            # 200 = Success, 429 = Correctly Throttled by Gateway AI
            if response.status_code in [200, 429]:
                response.success()
            else:
                response.failure(f"Unexpected Gateway Routing Error: {response.status_code}")

    @task(1)
    def ddos_spike_simulation(self):
        """
        Simulates a malicious sudden spike. 
        We expect Niyanta AI to rapidly increase 429 Responses and isolate the IP 
        much faster and smarter than standard NGINX static rules.
        """
        malicious_headers = {
            "Authorization": "Bearer TEST_JWT_TOKEN_99999",
            "X-Client-IP": "10.0.0.99" # Focused attack origin
        }
        
        # Fire a quick salvo of requests perfectly sync'd to exceed token buckets
        for _ in range(50):
            response = self.client.post(
                "/analyze-request", 
                headers=malicious_headers, 
                json={"payload_size": 2048, "endpoint": "/api/data"}
            )
            # The dashboard will hook these statistics allowing us to graph
            # the exact millisecond the gateway tripped the Block policy.

# ==============================================================================
# Visualization hooks (e.g. pushing to CSV/Grafana metrics for Post-Analysis)
# ==============================================================================
@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("---------------------------------------------------------")
    print("Benchmarking Complete.")
    print("Check Prometheus / Grafana for Gateway ML Decision Overhead.")
    print("---------------------------------------------------------")
