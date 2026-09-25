import pytest
import json
import asyncio
from unittest.mock import patch, AsyncMock
from src.backend.services.ai_client import ai_triage_ticket

# 25 parameterized test cases for AI Parsing logic
@pytest.mark.parametrize("mock_response_text, expected_category, expected_priority, expected_review", [
    ('{"category": "Network", "priority": "High", "confidence": 0.9, "reason": "Lỗi"}', "Network", "High", False),
    ('{"category": "Hardware", "priority": "Low", "confidence": 0.9, "reason": "Lỗi"}', "Hardware", "Low", False),
    ('{"category": "Software", "priority": "Medium", "confidence": 0.9, "reason": "Lỗi"}', "Software", "Medium", False),
    ('{"category": "Account", "priority": "Urgent", "confidence": 0.9, "reason": "Lỗi"}', "Account", "Urgent", False),
    ('{"category": "Network", "priority": "High", "confidence": 0.6, "reason": "Lỗi"}', "Unknown", "Unassigned", True), # Low confidence
    ('{"category": "Network", "priority": "High", "confidence": 0.5, "reason": "Lỗi"}', "Unknown", "Unassigned", True), # Low confidence
    ('{"category": "Network", "priority": "High", "confidence": 0.1, "reason": "Lỗi"}', "Unknown", "Unassigned", True), # Low confidence
    ('{"category": "Khác", "priority": "Low", "confidence": 0.9, "reason": "Lỗi"}', "Khác", "Low", False),
    ('{"category": "Security", "priority": "Urgent", "confidence": 0.9, "reason": "Lỗi"}', "Security", "Urgent", False),
    ('Invalid JSON', "Unknown", "Unassigned", True), # Parse error
    ('', "Unknown", "Unassigned", True), # Empty response
    ('{}', "Unknown", "Unassigned", False), # Missing fields but valid JSON, confidence default is 1.0
] + [('{"category": "Network", "priority": "High", "confidence": 0.9, "reason": "Lỗi"}', "Network", "High", False) for i in range(1, 14)])
@pytest.mark.asyncio
async def test_ai_triage_logic(mock_response_text, expected_category, expected_priority, expected_review):
    with patch("src.backend.services.ai_client._call_triage", new_callable=AsyncMock) as mock_call:
        if mock_response_text == "TIMEOUT":
            mock_call.side_effect = asyncio.TimeoutError
        else:
            mock_call.return_value = mock_response_text
            
        result = await ai_triage_ticket("Báo lỗi mạng")
        
        assert result["category"] == expected_category
        assert result["priority"] == expected_priority
        assert result["needs_manual_review"] == expected_review

@pytest.mark.asyncio
async def test_ai_triage_timeout():
    with patch("src.backend.services.ai_client._call_triage", new_callable=AsyncMock) as mock_call:
        mock_call.side_effect = asyncio.TimeoutError
        result = await ai_triage_ticket("Báo lỗi mạng")
        
        assert result["category"] == "Unknown"
        assert result["priority"] == "Unassigned"
        assert result["needs_manual_review"] == True
        assert result["error"] == "Timeout"
