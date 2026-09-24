import os
import json
import asyncio
import google.generativeai as genai
from typing import Dict, Any, Optional

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

# Configuration for Triage with JSON output
triage_generation_config = {
    "temperature": 0.1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 1024,
    "response_mime_type": "application/json",
}

triage_model = genai.GenerativeModel(
    model_name="gemini-flash-lite-latest",
    generation_config=triage_generation_config,
)

async def _call_triage(description: str) -> str:
    prompt = f"""
    # SYSTEM PROMPT: IT HELPDESK TICKET CLASSIFIER

    ## ROLE (Vai trò)
    Bạn là một AI phân loại vé hỗ trợ kỹ thuật (IT Helpdesk Ticket Classifier) cực kỳ chính xác. Nhiệm vụ của bạn là đọc Tiêu đề (Title) và Mô tả (Description) của khách hàng, sau đó trả về chuẩn định dạng JSON.

    ## RULES (Luật phân loại)
    1. Chỉ được chọn 1 trong 6 Category: "Network", "Hardware", "Software", "Account", "Security", hoặc "Khác".
    2. Chỉ được chọn 1 trong 4 Priority: "Low", "Medium", "High", "Urgent".
    3. Tuyệt đối không giải thích dài dòng, chỉ trả về JSON hợp lệ.

    ## TRAINING EXAMPLES (Dữ liệu mẫu để AI học cách phân loại)

    ### Ví dụ 1 (Lỗi Mạng diện rộng)
    - Input Description: "Cả tầng 3 không ai bắt được sóng Wi-Fi từ đầu giờ chiều."
    - Output JSON:
    {{
      "category": "Network",
      "priority": "High",
      "reason": "Mất kết nối mạng ảnh hưởng đến nhiều người cùng lúc."
    }}

    ### Ví dụ 2 (Lỗi Phần cứng cá nhân)
    - Input Description: "Bàn phím con lap Dell của em bấm phím cách không ăn."
    - Output JSON:
    {{
      "category": "Hardware",
      "priority": "Low",
      "reason": "Hỏng thiết bị ngoại vi, chỉ ảnh hưởng 1 cá nhân, không gấp."
    }}

    ### Ví dụ 3 (Lỗi Tài khoản / Phần mềm)
    - Input Description: "Em nhập đúng pass rồi mà web cứ báo tài khoản bị khóa."
    - Output JSON:
    {{
      "category": "Account",
      "priority": "Medium",
      "reason": "Lỗi truy cập hệ thống công việc chính của 1 cá nhân."
    }}

    ### Ví dụ 4 (Lỗi Bảo mật khẩn cấp - Cực kỳ quan trọng)
    - Input Description: "Anh nhận được mail từ phòng IT yêu cầu điền số thẻ Visa để nâng cấp tài khoản, anh lỡ điền rồi."
    - Output JSON:
    {{
      "category": "Security",
      "priority": "Urgent",
      "reason": "Rủi ro lộ lọt dữ liệu nhạy cảm (Phishing), cần xử lý lập tức để khóa thẻ/tài khoản."
    }}

    ### Ví dụ 5 (Vé Rác / Câu hỏi không liên quan)
    - Input Description: "Chiều nay nhà em có việc, sếp cho em nghỉ nửa ngày nha."
    - Output JSON:
    {{
      "category": "Khác",
      "priority": "Low",
      "reason": "Vấn đề nhân sự (HR), không thuộc phạm vi xử lý của IT Helpdesk."
    }}
    
    Ticket Description:
    "{description}"
    
    JSON Schema MUST follow exactly this:
    {{
        "category": "string",
        "priority": "string",
        "confidence": "float (0.0 to 1.0)",
        "reason": "string"
    }}
    """
    response = await triage_model.generate_content_async(prompt)
    return response.text

async def ai_triage_ticket(description: str) -> Dict[str, Any]:
    try:
        # Enforce 5.0s hard timeout (UC-04 / Q-HD-01)
        raw_json = await asyncio.wait_for(_call_triage(description), timeout=5.0)
        result = json.loads(raw_json)
        
        # Scenario A (Low Confidence)
        if result.get("confidence", 1.0) < 0.7 or len(description.split()) < 4:
            print("AI LOW CONFIDENCE OR SHORT DESCRIPTION")
            return {
                "category": "Unknown",
                "priority": "Unassigned",
                "needs_manual_review": True,
                "error": None
            }
            
        return {
            "category": result.get("category", "Unknown"),
            "priority": result.get("priority", "Unassigned"),
            "needs_manual_review": False,
            "error": None
        }
    except asyncio.TimeoutError:
        print("AI TIMEOUT ERROR")
        # Scenario B (Timeout)
        return {
            "category": "Unknown",
            "priority": "Unassigned",
            "needs_manual_review": True,
            "error": "Timeout"
        }
    except Exception as e:
        print(f"AI PARSE ERROR: {e}")
        # Scenario B (API Error)
        return {
            "category": "Unknown",
            "priority": "Unassigned",
            "needs_manual_review": True,
            "error": str(e)
        }
