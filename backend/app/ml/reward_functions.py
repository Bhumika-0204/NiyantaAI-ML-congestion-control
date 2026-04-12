def calculate_reward(throughput: float, latency: float, pod_count: int, throttled: bool) -> float:
    """
    Cost-Aware Scaling AI Reward Function.
    Evaluates the tradeoff between scaling infrastructure and dropping packets.
    """
    weight_throughput = 1.0
    weight_latency = -0.5
    weight_cost = -0.3 # Negative penalty for scaling up 
    
    cost_penalty = pod_count * weight_cost
    reward = (throughput * weight_throughput) + (latency * weight_latency) + cost_penalty
    
    if throttled:
        reward -= 2.0 # Penalty for dropping legitimate requests
        
    return reward
