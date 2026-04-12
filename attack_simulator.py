"""
Niyanta AI — Attack Simulation Script
======================================
Simulates realistic traffic patterns including DDoS spikes, 
brute force attempts, and normal user traffic from multiple IPs.

Run this WHILE the backend + frontend are running to see
the Security dashboard light up with live blocked/throttled IPs.

Usage:
    python attack_simulator.py
"""

import requests
import time
import random
import threading
from concurrent.futures import ThreadPoolExecutor

API_BASE = "http://localhost:8000/api/v1"

# Simulated IP addresses
NORMAL_IPS = [
    "203.0.113.10", "203.0.113.11", "203.0.113.12",
    "198.51.100.5", "198.51.100.6"
]

ATTACKER_IPS = [
    "45.33.32.156",    # Simulated botnet node 1
    "185.220.101.33",  # Simulated botnet node 2  
    "91.240.118.222",  # Simulated scanner
    "23.129.64.100",   # Simulated Tor exit node
    "171.25.193.20",   # Simulated brute force
    "62.102.148.68",   # Simulated DDoS amplifier
    "185.56.80.65",    # Simulated port scanner
    "45.155.205.233",  # Simulated credential stuffer
]

COLORS = {
    "red": "\033[91m",
    "green": "\033[92m",
    "yellow": "\033[93m",
    "blue": "\033[94m",
    "purple": "\033[95m",
    "reset": "\033[0m",
    "bold": "\033[1m",
}

stats = {"allowed": 0, "throttled": 0, "blocked": 0, "errors": 0}

def send_request(ip: str, metrics: dict, label: str):
    """Send a single analysis request to the gateway."""
    try:
        res = requests.post(
            f"{API_BASE}/analyze",
            json={"ip": ip, "metrics": metrics},
            headers={"X-Forwarded-For": ip},
            timeout=5
        )
        data = res.json()
        action = data.get("decision", {}).get("action", "unknown")
        
        if action == "block":
            stats["blocked"] += 1
            print(f"  {COLORS['red']}🚫 BLOCKED{COLORS['reset']}  {ip:<20} | {label}")
        elif action == "throttle":
            stats["throttled"] += 1
            print(f"  {COLORS['yellow']}⚡ THROTTLE{COLORS['reset']} {ip:<20} | {label}")
        else:
            stats["allowed"] += 1
            print(f"  {COLORS['green']}✅ ALLOWED{COLORS['reset']}  {ip:<20} | {label}")
            
    except Exception as e:
        stats["errors"] += 1

def normal_traffic():
    """Simulate normal user browsing — low rate, reasonable metrics."""
    ip = random.choice(NORMAL_IPS)
    metrics = {
        "incoming_rate": random.randint(50, 500),
        "cpu_percent": random.uniform(10, 45),
        "memory_percent": random.uniform(30, 60),
        "latency": random.uniform(5, 80),
        "error_rate": random.uniform(0, 0.02),
        "queue_length": random.randint(1, 20),
        "dropped_packets": random.randint(0, 2),
        "bytes_recv_rate": random.randint(1000, 50000),
    }
    send_request(ip, metrics, "Normal browsing")

def ddos_spike():
    """Simulate DDoS attack — massive rate from attacker IP."""
    ip = random.choice(ATTACKER_IPS)
    metrics = {
        "incoming_rate": random.randint(8000, 50000),  # Massive spike
        "cpu_percent": random.uniform(85, 99),
        "memory_percent": random.uniform(80, 95),
        "latency": random.uniform(500, 3000),
        "error_rate": random.uniform(0.1, 0.5),
        "queue_length": random.randint(90, 100),
        "dropped_packets": random.randint(50, 500),
        "bytes_recv_rate": random.randint(500000, 5000000),
    }
    send_request(ip, metrics, f"🔴 DDoS SPIKE ({metrics['incoming_rate']} req/s)")

def slowloris_attack():
    """Simulate Slow Loris — low rate but high latency (holding connections open)."""
    ip = random.choice(ATTACKER_IPS[:3])
    metrics = {
        "incoming_rate": random.randint(5, 30),
        "cpu_percent": random.uniform(60, 80),
        "memory_percent": random.uniform(70, 90),
        "latency": random.uniform(2000, 10000),  # Very high latency
        "error_rate": random.uniform(0.05, 0.15),
        "queue_length": random.randint(70, 95),
        "dropped_packets": random.randint(10, 30),
        "bytes_recv_rate": random.randint(100, 500),
    }
    send_request(ip, metrics, f"🐌 Slow Loris (latency: {metrics['latency']:.0f}ms)")

def brute_force():
    """Simulate brute force login — high rate from single IP."""
    ip = ATTACKER_IPS[4]  # Always same IP = suspicious
    metrics = {
        "incoming_rate": random.randint(3000, 8000),
        "cpu_percent": random.uniform(70, 90),
        "memory_percent": random.uniform(50, 70),
        "latency": random.uniform(100, 400),
        "error_rate": random.uniform(0.3, 0.8),  # High error = failed logins
        "queue_length": random.randint(40, 80),
        "dropped_packets": random.randint(5, 20),
        "bytes_recv_rate": random.randint(10000, 100000),
    }
    send_request(ip, metrics, f"🔐 Brute Force (error rate: {metrics['error_rate']:.1%})")

def port_scan():
    """Simulate port scanning — moderate rate, many different ports."""
    ip = ATTACKER_IPS[6]
    metrics = {
        "incoming_rate": random.randint(2000, 6000),
        "cpu_percent": random.uniform(55, 75),
        "memory_percent": random.uniform(40, 60),
        "latency": random.uniform(50, 200),
        "error_rate": random.uniform(0.2, 0.6),
        "queue_length": random.randint(30, 70),
        "dropped_packets": random.randint(20, 80),
        "bytes_recv_rate": random.randint(5000, 50000),
    }
    send_request(ip, metrics, "🔍 Port Scan")

def print_header():
    print(f"\n{COLORS['bold']}{'='*70}")
    print(f"  NIYANTA AI — ATTACK SIMULATION")
    print(f"  Sending traffic to http://localhost:8000")
    print(f"  Open http://localhost:5173 → Security page to watch live!")
    print(f"{'='*70}{COLORS['reset']}\n")

def print_stats():
    total = stats["allowed"] + stats["throttled"] + stats["blocked"]
    print(f"\n{COLORS['bold']}{'─'*70}")
    print(f"  SIMULATION RESULTS")
    print(f"{'─'*70}{COLORS['reset']}")
    print(f"  {COLORS['green']}Allowed:   {stats['allowed']}{COLORS['reset']}")
    print(f"  {COLORS['yellow']}Throttled: {stats['throttled']}{COLORS['reset']}")
    print(f"  {COLORS['red']}Blocked:   {stats['blocked']}{COLORS['reset']}")
    print(f"  Errors:    {stats['errors']}")
    print(f"  {COLORS['bold']}Total:     {total}{COLORS['reset']}")
    if total > 0:
        block_rate = (stats['blocked'] + stats['throttled']) / total * 100
        print(f"\n  {COLORS['purple']}Threat Detection Rate: {block_rate:.1f}%{COLORS['reset']}")
    print(f"{'─'*70}\n")

def run_simulation():
    print_header()
    
    # Phase 1: Normal traffic warm-up
    print(f"{COLORS['blue']}[Phase 1] Normal traffic warm-up (10 requests)...{COLORS['reset']}")
    for _ in range(10):
        normal_traffic()
        time.sleep(0.3)

    # Phase 2: DDoS attack begins
    print(f"\n{COLORS['red']}[Phase 2] 🚨 DDoS ATTACK STARTING — 20 spike requests...{COLORS['reset']}")
    for _ in range(20):
        ddos_spike()
        time.sleep(0.15)

    # Phase 3: Mixed attack + normal
    print(f"\n{COLORS['yellow']}[Phase 3] Mixed traffic — attacks + normal users...{COLORS['reset']}")
    for _ in range(30):
        roll = random.random()
        if roll < 0.3:
            normal_traffic()
        elif roll < 0.5:
            ddos_spike()
        elif roll < 0.65:
            slowloris_attack()
        elif roll < 0.8:
            brute_force()
        else:
            port_scan()
        time.sleep(0.2)

    # Phase 4: Massive coordinated attack
    print(f"\n{COLORS['red']}[Phase 4] 🔥 COORDINATED BOTNET ATTACK — 8 IPs simultaneously...{COLORS['reset']}")
    with ThreadPoolExecutor(max_workers=8) as pool:
        for _ in range(40):
            pool.submit(ddos_spike)
            time.sleep(0.05)

    # Phase 5: Recovery — normal traffic
    print(f"\n{COLORS['green']}[Phase 5] Attack stopped. Normal traffic resuming...{COLORS['reset']}")
    for _ in range(10):
        normal_traffic()
        time.sleep(0.3)

    print_stats()

if __name__ == "__main__":
    run_simulation()
