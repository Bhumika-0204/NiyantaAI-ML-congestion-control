import grpc
from concurrent import futures
import logging

try:
    # These will be generated via grpc_tools.protoc
    import network_pb2
    import network_pb2_grpc
except ImportError:
    network_pb2 = None
    network_pb2_grpc = None

logger = logging.getLogger("gRPC_Server")

class GatewayServicer:
    # Inherit from network_pb2_grpc.GatewayServicer if it exists
    async def ProcessRequest(self, request, context):
        if not network_pb2:
            return None
        
        # Abstract Protocol Layer logic:
        # Route to the same ML Gateway Engine as REST
        # decision = await ml_policy_engine.evaluate(request.ip, request.payload_size)
        
        logger.info(f"gRPC request received from {request.ip}")
        return network_pb2.GatewayResponse(decision="allow", rate_limit_remaining=4999, reason="OK")

async def serve_grpc():
    if not network_pb2_grpc:
        logger.warning("gRPC proto files not compiled. Skip starting gRPC server.")
        return

    server = grpc.aio.server()
    # network_pb2_grpc.add_GatewayServicer_to_server(GatewayServicer(), server)
    server.add_insecure_port('[::]:50051')
    await server.start()
    logger.info("gRPC server started on port 50051")
    await server.wait_for_termination()
