// frontend/constants/dpp.ts

export const departmentPositions: Record<string, string[]> = {
    business_office: ["Office Manager", "Biller", "Payroll", "Reception"],
    admissions: ["Director of Admissions", "Liaison"],
    activities: ["Director of Activities", "Activity Staff"],
    maintenance: ["Director of Maintenance", "Maintenance Staff"],
    dietary: ["Director of Dietary", "Dietician", "Dietary Staff"],
    therapy: ["Director of Therapy", "Therapy Staff"],
    laundry: ["Laundry Supervisor"],
    housekeeping: ["Housekeeping Supervisor"],
    case_management: ["Case Manager"],
    mds: ["Director of MDS", "MDS Staff"],
    nursing_department: [
      "Director of Nursing",
      "Asst Director Nursing",
      "Unit Manager",
    ],
    administration: ["Administrator", "Administrator in Training"],
    social_services: ["Social Service Director", "Social Service Staff"],
    staff_development: ["Staff Development Coordinator"],
  };
  
  export const departmentLabels: Record<string, string> = {
    business_office: "Business Office",
    admissions: "Admissions",
    activities: "Activities",
    maintenance: "Maintenance",
    dietary: "Dietary",
    therapy: "Therapy",
    laundry: "Laundry",
    housekeeping: "Housekeeping",
    case_management: "Case Management",
    mds: "MDS",
    nursing_department: "Nursing Department",
    administration: "Administration",
    social_services: "Social Services",
    staff_development: "Staff Development",
  };
  
  export const roles = ["Facility Admin", "Facility Users", "Regional Admin"];
  