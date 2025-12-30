"""Vercel serverless function for Print Shop AI Order Guardrail API."""

import json
import sys
import traceback
from pathlib import Path

# Add parent directory to path
try:
    sys.path.insert(0, str(Path(__file__).parent.parent))
except Exception as e:
    pass  # Continue even if path addition fails

# Try to import modules with error handling
try:
    from agent.react_agent import ReActAgent
    AGENT_AVAILABLE = True
except ImportError as e:
    AGENT_AVAILABLE = False
    AGENT_ERROR = str(e)

try:
    from tools.inventory_tool import check_inventory
    INVENTORY_AVAILABLE = True
except ImportError as e:
    INVENTORY_AVAILABLE = False
    INVENTORY_ERROR = str(e)

try:
    from tools.resolution_tool import check_resolution
    RESOLUTION_AVAILABLE = True
except ImportError as e:
    RESOLUTION_AVAILABLE = False
    RESOLUTION_ERROR = str(e)

try:
    from tools.pricing_tool import calculate_price
    PRICING_AVAILABLE = True
except ImportError as e:
    PRICING_AVAILABLE = False
    PRICING_ERROR = str(e)

try:
    from guardrails.spec_check_guardrail import SpecCheckGuardrail
    from guardrails.preflight_guardrail import PreflightGuardrail
    from guardrails.quote_guardrail import QuoteGuardrail
    GUARDRAILS_AVAILABLE = True
except ImportError as e:
    GUARDRAILS_AVAILABLE = False
    GUARDRAILS_ERROR = str(e)


def handler(req):
    """Main handler for Vercel serverless function."""
    
    # Handle CORS
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    
    # Handle OPTIONS for CORS
    if hasattr(req, 'method') and req.method == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}
    
    try:
        # Parse request - Vercel format
        method = getattr(req, 'method', 'GET')
        body = {}
        
        # Try to get body from request
        if hasattr(req, 'body'):
            request_body = req.body
            if request_body:
                if isinstance(request_body, str):
                    try:
                        body = json.loads(request_body)
                    except:
                        body = {}
                else:
                    body = request_body
        
        # Get query parameters
        query = {}
        if hasattr(req, 'query'):
            query = req.query or {}
        
        # Get action from body or query string
        action = body.get("action") or query.get("action", "info")
        
        # Route to appropriate handler
        if action == "process_order":
            result = handle_process_order(body)
        elif action == "check_inventory":
            result = handle_check_inventory(body)
        elif action == "check_resolution":
            result = handle_check_resolution(body)
        elif action == "calculate_price":
            result = handle_calculate_price(body)
        elif action == "test_guardrails":
            result = handle_test_guardrails()
        elif action == "status":
            result = get_status()
        else:
            result = {
                "success": True,
                "message": "Print Shop AI Order Guardrail API",
                "available_actions": [
                    "process_order",
                    "check_inventory", 
                    "check_resolution",
                    "calculate_price",
                    "test_guardrails",
                    "status"
                ],
                "usage": {
                    "method": "POST",
                    "example": {
                        "action": "calculate_price",
                        "paper_stock": "100lb_cardstock",
                        "quantity": 500,
                        "width_inches": 3.5,
                        "height_inches": 2.0
                    }
                }
            }
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(result, default=str)
        }
    
    except Exception as e:
        # Return detailed error for debugging
        error_response = {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__,
            "traceback": traceback.format_exc()
        }
        
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps(error_response, default=str)
        }


def get_status():
    """Get status of all modules."""
    return {
        "success": True,
        "modules": {
            "agent": {
                "available": AGENT_AVAILABLE,
                "error": getattr(AGENT_AVAILABLE, 'AGENT_ERROR', None) if not AGENT_AVAILABLE else None
            },
            "inventory_tool": {
                "available": INVENTORY_AVAILABLE,
                "error": INVENTORY_ERROR if not INVENTORY_AVAILABLE else None
            },
            "resolution_tool": {
                "available": RESOLUTION_AVAILABLE,
                "error": RESOLUTION_ERROR if not RESOLUTION_AVAILABLE else None
            },
            "pricing_tool": {
                "available": PRICING_AVAILABLE,
                "error": PRICING_ERROR if not PRICING_AVAILABLE else None
            },
            "guardrails": {
                "available": GUARDRAILS_AVAILABLE,
                "error": GUARDRAILS_ERROR if not GUARDRAILS_AVAILABLE else None
            }
        }
    }


def handle_process_order(body):
    """Handle process_order action."""
    if not AGENT_AVAILABLE:
        return {
            "success": False,
            "error": f"Agent not available: {AGENT_ERROR}"
        }
    
    user_query = body.get("query", "")
    file_path = body.get("file_path")
    
    agent = ReActAgent()
    result = agent.process_order(user_query, file_path)
    
    return {
        "success": True,
        "result": result
    }


def handle_check_inventory(body):
    """Handle check_inventory action."""
    if not INVENTORY_AVAILABLE:
        return {
            "success": False,
            "error": f"Inventory tool not available: {INVENTORY_ERROR}"
        }
    
    paper_stock = body.get("paper_stock")
    color = body.get("color", "white")
    finish = body.get("finish", "matte")
    
    if not paper_stock:
        return {
            "success": False,
            "error": "paper_stock is required"
        }
    
    result = check_inventory(paper_stock, color, finish)
    return {
        "success": True,
        "result": result
    }


def handle_check_resolution(body):
    """Handle check_resolution action."""
    if not RESOLUTION_AVAILABLE:
        return {
            "success": False,
            "error": f"Resolution tool not available: {RESOLUTION_ERROR}"
        }
    
    file_path = body.get("file_path")
    
    if not file_path:
        return {
            "success": False,
            "error": "file_path is required"
        }
    
    result = check_resolution(file_path)
    return {
        "success": True,
        "result": result
    }


def handle_calculate_price(body):
    """Handle calculate_price action."""
    if not PRICING_AVAILABLE:
        return {
            "success": False,
            "error": f"Pricing tool not available: {PRICING_ERROR}"
        }
    
    paper_stock = body.get("paper_stock")
    quantity = body.get("quantity")
    width_inches = body.get("width_inches")
    height_inches = body.get("height_inches")
    full_color = body.get("full_color", True)
    rush_type = body.get("rush_type")
    
    if not all([paper_stock, quantity, width_inches, height_inches]):
        return {
            "success": False,
            "error": "paper_stock, quantity, width_inches, and height_inches are required"
        }
    
    result = calculate_price(
        paper_stock=paper_stock,
        quantity=quantity,
        width_inches=width_inches,
        height_inches=height_inches,
        full_color=full_color,
        rush_type=rush_type
    )
    
    return {
        "success": True,
        "result": result
    }


def handle_test_guardrails():
    """Handle test_guardrails action."""
    if not GUARDRAILS_AVAILABLE:
        return {
            "success": False,
            "error": f"Guardrails not available: {GUARDRAILS_ERROR}"
        }
    
    spec_guardrail = SpecCheckGuardrail()
    preflight_guardrail = PreflightGuardrail()
    quote_guardrail = QuoteGuardrail()
    
    # Test Layer 1
    test_order = {
        "paper_stock": "100lb_cardstock",
        "color": "black",
        "finish": "matte",
        "full_color": True,
        "dark_paper": True
    }
    layer1_result = spec_guardrail.validate_order_spec(test_order)
    
    # Test Layer 3
    test_response = "The price for your order will be $125.50"
    layer3_result = quote_guardrail.validate_response(test_response, [])
    
    return {
        "success": True,
        "layer1_spec_check": layer1_result,
        "layer3_quote_guardrail": layer3_result,
        "layer2_preflight": "Requires file to test"
    }
