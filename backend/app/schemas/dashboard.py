from pydantic import BaseModel
from typing import Optional, List


class DashboardStats(BaseModel):
    schemes_discovered: int = 0
    applications_prepared: int = 0
    documents_completed: int = 0
    complaints_submitted: int = 0
    complaints_resolved: int = 0
    avg_resolution_time: Optional[str] = None
    civic_impact_score: float = 0.0


class AdminMetrics(BaseModel):
    total_complaints: int = 0
    by_category: List[dict] = []
    by_status: List[dict] = []
    resolution_rate: float = 0.0
    department_workload: List[dict] = []
    emerging_issues: List[dict] = []
    civic_pulse: Optional[str] = None
    weekly_trend: List[dict] = []
