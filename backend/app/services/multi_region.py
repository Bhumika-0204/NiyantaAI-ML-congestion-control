import asyncio
from typing import Dict

REGION_LATENCIES: Dict[str, float] = {
    "US-EAST": 0.02, 
    "US-WEST": 0.06, 
    "EU-WEST": 0.09, 
    "AP-SOUTH": 0.15 
}

async def simulate_region_latency(region: str):
    """
    Injects artificial delay representative of cross-region routing.
    Used by the RoutingAgent to simulate real-world physical constraints.
    """
    latency = REGION_LATENCIES.get(region, 0.1)
    await asyncio.sleep(latency)
