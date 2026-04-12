import jinja2
import datetime

def generate_report(metrics: dict):
    template = """
    # Niyanta AI Benchmarking Report
    **Date & Time:** {{ timestamp }}

    ## Performance Metrics
    - **Throughput**: {{ metrics.throughput }} RPS
    - **P99 Latency**: {{ metrics.p99 }} ms
    - **Error Rate**: {{ metrics.error_rate }} %
    
    ## Resource Utilization
    - **Avg CPU Load**: {{ metrics.cpu_load }} %
    - **Backend Disconnects**: {{ metrics.disconnects }}
    """
    env = jinja2.Environment()
    tpl = env.from_string(template)
    
    filename = f"REPORT_{datetime.datetime.now().strftime('%Y%md')}.md"
    with open(filename, "w") as f:
        f.write(tpl.render(
            metrics=metrics,
            timestamp=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        
    print(f"Report generated: {filename}")
