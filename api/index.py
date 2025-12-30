"""Vercel serverless function for Print Shop AI Order Guardrail API."""

import json
import traceback

def handler(req):
    """Main handler for Vercel serverless function."""
    
    # Handle CORS
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    
    try:
        # Handle OPTIONS for CORS
        method = getattr(req, 'method', 'GET')
        if method == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": headers,
                "body": ""
            }
        
        # Parse request body
        body = {}
        if hasattr(req, 'body') and req.body:
            try:
                if isinstance(req.body, str):
                    body = json.loads(req.body)
                else:
                    body = req.body
            except:
                body = {}
        
        # Get query parameters
        query = {}
        if hasattr(req, 'query') and req.query:
            query = req.query
        
        # Get action
        action = body.get("action") or query.get("action", "info")
        
        # Simple response for now
        if action == "status":
            result = {
                "success": True,
                "message": "API is working",
                "action": action,
                "method": method
            }
        elif action == "test":
            result = {
                "success": True,
                "message": "Test endpoint working",
                "body_received": bool(body),
                "query_received": bool(query)
            }
        else:
            result = {
                "success": True,
                "message": "Print Shop AI Order Guardrail API",
                "status": "Basic endpoint working",
                "available_actions": ["status", "test"],
                "note": "Full functionality requires module imports to be fixed"
            }
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(result, default=str)
        }
    
    except Exception as e:
        # Return detailed error
        error_info = {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__,
            "traceback": traceback.format_exc()
        }
        
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps(error_info, default=str)
        }
