# Vercel Function Debugging Guide

## Current Issue
500 INTERNAL_SERVER_ERROR - FUNCTION_INVOCATION_FAILED

## Minimal Function Deployed
I've created a minimal version of `api/index.py` that:
- Has no imports except json and traceback (built-in)
- Has comprehensive error handling
- Should work even if there are import issues

## Testing Steps

1. **Wait for Vercel to redeploy** (should happen automatically)

2. **Test the minimal endpoint:**
   ```
   GET https://your-project.vercel.app/api/index
   ```
   Should return: `{"success": true, "message": "Print Shop AI Order Guardrail API", ...}`

3. **Test status endpoint:**
   ```
   GET https://your-project.vercel.app/api/index?action=status
   ```

4. **Check Vercel Logs:**
   - Go to Vercel Dashboard
   - Your Project → Functions → `api/index`
   - Click on the function
   - View "Logs" tab
   - Look for any error messages

## If Still Failing

The issue might be:

1. **Handler Signature Issue**
   - Vercel Python functions might expect a different signature
   - Try: `def handler(request, response):` or check Vercel docs

2. **Requirements.txt Issue**
   - Check if all dependencies are listed
   - Some packages might not be compatible with Vercel's Python runtime

3. **File Structure Issue**
   - Ensure `api/index.py` exists
   - Ensure `handler` function is defined

## Next Steps

Once the minimal version works, we can:
1. Add imports one by one
2. Test each module individually
3. Identify which import is causing the crash

## Alternative: Use Render Instead

If Vercel continues to have issues, Render is better suited for Flask/Python apps:
- Full Python support
- No function size limits
- Better for complex applications
- See `render.yaml` for configuration

