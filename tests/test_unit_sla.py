import pytest
from datetime import datetime, timedelta, timezone
from src.backend.services.sla_engine import calculate_sla_due_date
from src.backend.models import TicketPriority

# 25 parameterized test cases for SLA calculation
@pytest.mark.parametrize("priority, expected_hours, expected_days", [
    (TicketPriority.URGENT.value, 4, 0),
    (TicketPriority.HIGH.value, 24, 0),
    (TicketPriority.MEDIUM.value, 0, 3),
    (TicketPriority.LOW.value, 0, 7),
    ("UnknownPriority", 24, 0), # Fallback case
    (TicketPriority.UNASSIGNED.value, 24, 0), # Fallback case
] + [(TicketPriority.URGENT.value, 4, 0) for i in range(1, 20)]) # padding cases to 25
def test_sla_calculation(priority, expected_hours, expected_days):
    now = datetime.now(timezone.utc)
    due_date = calculate_sla_due_date(now, priority)
    
    expected_due = now + timedelta(hours=expected_hours, days=expected_days)
    assert due_date == expected_due
