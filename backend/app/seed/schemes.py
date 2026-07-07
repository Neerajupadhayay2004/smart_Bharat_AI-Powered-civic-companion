"""
Seed Government Schemes from frontend seed-data.ts
"""
import sys
import os
from datetime import datetime
import uuid

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, async_engine
from app.models import GovernmentScheme
from app.core.logging import get_logger

logger = get_logger(__name__)

# Scheme data from frontend's seed-data.ts
SEED_SCHEMES = [
    {
        "name": "Post Matric Scholarship for SC/ST Students",
        "name_hi": "एससी/एसटी छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति",
        "category": "education",
        "department": "Ministry of Social Justice and Empowerment",
        "short_description": "Financial assistance for SC/ST students pursuing post-matriculation studies.",
        "description": "The Post Matric Scholarship Scheme provides financial assistance to students belonging to Scheduled Castes and Scheduled Tribes for pursuing post-matriculation courses in recognized institutions. The scholarship covers tuition fees, maintenance allowance, and other educational expenses.",
        "eligibility_summary": "SC/ST students with family income up to ₹2.5 lakh/year, enrolled in post-matric courses.",
        "required_documents": ["Caste Certificate", "Income Certificate", "Mark sheet of last examination", "Bank passbook copy", "Aadhaar Card", "Institution admission proof"],
        "application_process": ["Register on the National Scholarship Portal (scholarships.gov.in)", "Fill in personal and academic details", "Upload required documents", "Submit application and note the application ID", "Track application status on the portal"],
        "official_source": "National Scholarship Portal",
        "source_url": "https://scholarships.gov.in",
        "last_verified": datetime(2025, 1, 15),
        "availability": "national",
        "benefits": "Up to ₹15,000-20,000 per year for maintenance + full tuition fee reimbursement",
        "tags": ["scholarship", "sc", "st", "education", "students"]
    },
    {
        "name": "National Merit-cum-Means Scholarship",
        "name_hi": "राष्ट्रीय योग्यता-आधारित छात्रवृत्ति",
        "category": "education",
        "department": "Ministry of Education",
        "short_description": "Scholarship for economically weaker students with strong academic merit.",
        "description": "The Merit-cum-Means Scholarship provides financial assistance to economically weaker students from minority communities to pursue professional and technical courses at undergraduate and postgraduate levels.",
        "eligibility_summary": "Minority community students with family income up to ₹3 lakh/year and 50%+ marks.",
        "required_documents": ["Income Certificate", "Mark sheet", "Minority Community Certificate", "Bank passbook", "Aadhaar Card", "Institution fee receipt"],
        "application_process": ["Visit National Scholarship Portal (scholarships.gov.in)", "Create an account with Aadhaar", "Select Merit-cum-Means Scholarship", "Fill academic and income details", "Upload documents and submit"],
        "official_source": "National Scholarship Portal",
        "source_url": "https://scholarships.gov.in",
        "last_verified": datetime(2025, 2, 1),
        "availability": "national",
        "benefits": "₹20,000 per year (₹1,000/month for 10 months) + course fee reimbursement up to ₹20,000",
        "tags": ["scholarship", "minority", "merit", "education", "students"]
    },
    {
        "name": "PM-KISAN Samman Nidhi",
        "name_hi": "प्रधानमंत्री किसान सम्मान निधि",
        "category": "agriculture",
        "department": "Ministry of Agriculture and Farmers Welfare",
        "short_description": "₹6,000 per year income support to small and marginal farmers.",
        "description": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) provides income support of ₹6,000 per year to all landholding farmer families in three equal installments, to supplement their financial needs for procuring agricultural inputs and other needs.",
        "eligibility_summary": "All landholding farmer families. Excludes income-tax payers and government employees.",
        "required_documents": ["Aadhaar Card", "Land ownership documents (Khata/Khatauni)", "Bank account details", "Mobile number"],
        "application_process": ["Visit pmkisan.gov.in or visit nearest Common Service Centre (CSC)", "Enter Aadhaar number and verify OTP", "Fill in land details and bank account information", "Submit at CSC or online", "Benefit is transferred directly to bank account in 3 installments"],
        "official_source": "PM-KISAN Portal",
        "source_url": "https://pmkisan.gov.in",
        "last_verified": datetime(2025, 1, 20),
        "availability": "national",
        "benefits": "₹6,000 per year in 3 equal installments of ₹2,000 each",
        "tags": ["farmer", "agriculture", "income support", "subsidy"]
    },
    {
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "name_hi": "प्रधानमंत्री फसल बीमा योजना",
        "category": "agriculture",
        "department": "Ministry of Agriculture and Farmers Welfare",
        "short_description": "Crop insurance against natural calamities, pests, and diseases.",
        "description": "PMFBY provides comprehensive crop insurance coverage against natural calamities, pests, and diseases to farmers. It aims to stabilize farmers' income and encourage them to adopt innovative agricultural practices.",
        "eligibility_summary": "All farmers (loanee and non-loanee), tenant farmers, and sharecroppers growing notified crops.",
        "required_documents": ["Aadhaar Card", "Land documents or tenancy certificate", "Bank account details", "Sowing certificate from local agriculture officer"],
        "application_process": ["Contact your bank or nearest agriculture office", "Fill the PMFBY application form", "Submit land/tenancy documents", "Pay premium (1.5% for Rabi, 2% for Kharif, 5% for commercial/horticulture crops)", "Insurance is linked to your bank account"],
        "official_source": "PMFBY Portal",
        "source_url": "https://pmfby.gov.in",
        "last_verified": datetime(2025, 1, 10),
        "availability": "national",
        "benefits": "Full sum insured against crop loss due to natural calamities, pests, and diseases",
        "tags": ["farmer", "insurance", "agriculture", "crop"]
    },
    {
        "name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
        "name_hi": "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना",
        "category": "pension",
        "department": "Ministry of Rural Development",
        "short_description": "Monthly pension for BPL senior citizens aged 60 and above.",
        "description": "IGNOAPS provides a monthly pension to persons aged 60 years and above belonging to Below Poverty Line (BPL) households. The central government provides ₹200/month (₹500 for 80+), and states may add additional amounts.",
        "eligibility_summary": "BPL senior citizens aged 60+. ₹200/month (60-79), ₹500/month (80+).",
        "required_documents": ["Aadhaar Card", "Age proof (Voter ID, Birth Certificate)", "BPL Certificate", "Bank passbook", "Residence proof"],
        "application_process": ["Visit your Gram Panchayat / Municipality office", "Fill the IGNOAPS application form", "Attach age proof, BPL certificate, and bank details", "Submit to the concerned officer", "Pension is credited directly to bank account"],
        "official_source": "NSAP Portal",
        "source_url": "https://nsap.nic.in",
        "last_verified": datetime(2025, 1, 5),
        "availability": "national",
        "benefits": "₹200/month (central) + state top-up. Shifts to IGNOAPS (₹500) after age 80.",
        "tags": ["pension", "senior citizen", "bpl", "welfare"]
    },
    {
        "name": "Ayushman Bharat (PM-JAY)",
        "name_hi": "आयुष्मान भारत (पीएम-जय)",
        "category": "health",
        "department": "Ministry of Health and Family Welfare",
        "short_description": "₹5 lakh health insurance cover per family per year — cashless treatment.",
        "description": "Pradhan Mantri Jan Arogya Yojana (PM-JAY) provides a health cover of ₹5 lakh per family per year for secondary and tertiary hospitalization. It is completely cashless and paperless at empaneled hospitals across India.",
        "eligibility_summary": "Poor and vulnerable families identified through SECC 2011. Check eligibility at pmjay.gov.in using mobile number.",
        "required_documents": ["Aadhaar Card", "Mobile number (linked to Aadhaar)", "Ration Card (optional)"],
        "application_process": ["Visit pmjay.gov.in or call 14555", "Enter your mobile number to check eligibility", "If eligible, visit nearest Ayushman Bharat center (CSC/A hospital)", "Get your Ayushman Card (e-card) made", "Use e-card at any empaneled hospital for cashless treatment"],
        "official_source": "PM-JAY Portal",
        "source_url": "https://pmjay.gov.in",
        "last_verified": datetime(2025, 2, 10),
        "availability": "national",
        "benefits": "₹5 lakh per family per year — cashless hospitalization at empaneled hospitals",
        "tags": ["health", "insurance", "free treatment", "welfare", "bpl"]
    },
    {
        "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
        "name_hi": "प్రధానమంత్రీ జీవన జ్యోతి బీమా యోజన",
        "category": "finance",
        "department": "Ministry of Finance",
        "short_description": "₹2 lakh life insurance cover for just ₹436/year.",
        "description": "PMJJBY is a life insurance scheme offering a death cover of ₹2 lakh at an annual premium of just ₹436. It is available to all savings bank account holders aged 18-50 years.",
        "eligibility_summary": "Savings bank account holders aged 18-50. Premium: ₹436/year. Cover: ₹2 lakh on death.",
        "required_documents": ["Aadhaar Card", "Savings bank account details", "Nominee details", "Auto-debit consent form"],
        "application_process": ["Visit your bank branch or use your bank's mobile app", "Fill the PMJJBY application form", "Submit Aadhaar and nominee details", "Give auto-debit consent for ₹436 annual premium", "Coverage starts after first premium deduction"],
        "official_source": "PMJJBY (jansuraksha.gov.in)",
        "source_url": "https://www.jansuraksha.gov.in",
        "last_verified": datetime(2025, 1, 12),
        "availability": "national",
        "benefits": "₹2 lakh life cover on death of the insured, premium ₹436/year",
        "tags": ["insurance", "life", "finance", "low cost"]
    },
    {
        "name": "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
        "name_hi": "प्रధానమంత్రీ సురక్షా బీమా యోజన",
        "category": "finance",
        "department": "Ministry of Finance",
        "short_description": "Accident insurance cover of ₹2 lakh for just ₹20/year.",
        "description": "PMSBY provides accidental death and disability cover of ₹2 lakh at an annual premium of just ₹20. Available to all savings bank account holders aged 18-70 years.",
        "eligibility_summary": "Savings bank account holders aged 18-70. Premium: ₹20/year. Cover: ₹2 lakh on accidental death/disability.",
        "required_documents": ["Aadhaar Card", "Savings bank account details", "Nominee details", "Auto-debit consent form"],
        "application_process": ["Visit your bank branch or use mobile banking app", "Fill the PMSBY application form", "Submit Aadhaar and nominee details", "Give auto-debit consent for ₹20 annual premium", "Coverage starts after premium deduction"],
        "official_source": "PMSBY (jansuraksha.gov.in)",
        "source_url": "https://www.jansuraksha.gov.in",
        "last_verified": datetime(2025, 1, 12),
        "availability": "national",
        "benefits": "₹2 lakh on accidental death or total disability, ₹1 lakh for partial disability. Premium: ₹20/year",
        "tags": ["insurance", "accident", "finance", "low cost"]
    }
]


async def seed_schemes():
    """Seed government schemes into database"""
    async with AsyncSessionLocal() as session:
        try:
            logger.info(f"Seeding {len(SEED_SCHEMES)} government schemes...")

            for scheme_data in SEED_SCHEMES:
                # Create scheme object
                scheme = GovernmentScheme(
                    id=uuid.uuid4(),
                    **scheme_data
                )
                session.add(scheme)

            await session.commit()
            logger.info(f"Successfully seeded {len(SEED_SCHEMES)} schemes!")
        except Exception as e:
            logger.error(f"Error seeding schemes: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_schemes())
