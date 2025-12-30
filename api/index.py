"""Vercel serverless function for Print Shop AI Order Guardrail API."""

import json
import sys
import traceback

# Try to add path for imports (but don't fail if it doesn't work)
try:
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
except:
    pass

def handler(req):
    """Main handler for Vercel serverless function - minimal version."""
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    
    try:
        # Get method
        method = getattr(req, 'method', 'GET')
        
        # Handle OPTIONS
        if method == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": headers,
                "body": ""
            }
        
        # Parse body
        body = {}
        if hasattr(req, 'body') and req.body:
            try:
                body = json.loads(req.body) if isinstance(req.body, str) else req.body
            except:
                pass
        
        # Get query
        query = getattr(req, 'query', {}) or {}
        
        # Get action
        action = body.get("action") or query.get("action", "info")
        
        # Return response
        result = {
            "success": True,
            "message": "Print Shop API is working",
            "action": action,
            "method": method,
            "python_version": sys.version,
            "available_actions": ["info", "status", "test"]
        }
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(result, default=str)
        }
        
    except Exception as e:
        # Return error with full traceback
        error_response = {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__,
            "traceback": traceback.format_exc(),
            "python_version": sys.version
        }
        
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps(error_response, default=str)
        }
