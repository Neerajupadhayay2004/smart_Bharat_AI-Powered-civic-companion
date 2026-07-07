from pydantic import BaseModel
from typing import Optional, List


class EligibilityCheckRequest(BaseModel):
    scheme_id: str
    profile: Optional[dict] = None


class EligibilityRuleResult(BaseModel):
    rule_id: str
    label: str
    passed: bool
    required_value: str
    actual_value: Optional[str] = None


class EligibilityResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    eligibility_status: str  # eligible, likely_eligible, possibly_eligible, not_eligible, insufficient_information
    matched_rules: List[EligibilityRuleResult]
    failed_rules: List[EligibilityRuleResult]
    unknown_rules: List[EligibilityRuleResult]
    missing_information: List[str]
    recommended_actions: List[str]
    confidence_score: float
    is_preliminary: bool = True
