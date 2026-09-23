"""
Standard System Permissions for RBAC & UBAC.
Formatted as 'resource:action'.
"""

# Platform & SuperAdmin Permissions
SUPERADMIN_ALL = "*"
PLATFORM_MANAGE = "platform:manage"
TENANT_MANAGE = "tenant:manage"
DOMAIN_MANAGE = "domain:manage"
MODULE_MANAGE = "module:manage"

# User Management
USER_READ = "user:read"
USER_CREATE = "user:create"
USER_UPDATE = "user:update"
USER_DELETE = "user:delete"

EMPLOYEE_READ = "employee:read"
EMPLOYEE_CREATE = "employee:create"
EMPLOYEE_UPDATE = "employee:update"
EMPLOYEE_DELETE = "employee:delete"

# RBAC Management
ROLE_READ = "role:read"
ROLE_CREATE = "role:create"
ROLE_UPDATE = "role:update"
ROLE_DELETE = "role:delete"
PERMISSION_ASSIGN = "permission:assign"

# Document Management Permissions (File Store)
DOCUMENT_UPLOAD = "document:upload"
DOCUMENT_VIEW = "document:view"
DOCUMENT_DOWNLOAD = "document:download"
DOCUMENT_DELETE = "document:delete"
DOCUMENT_READ = "document:read"
DOCUMENT_CREATE = "document:create"
DOCUMENT_UPDATE = "document:update"

# Knowledge Management Permissions (AI Ingestion & RAG)
KNOWLEDGE_ENABLE = "knowledge:enable"
KNOWLEDGE_DISABLE = "knowledge:disable"
KNOWLEDGE_REPROCESS = "knowledge:reprocess"
KNOWLEDGE_VIEW = "knowledge:view"
KNOWLEDGE_APPROVE = "knowledge:approve"

# RAG & AI Permissions
RAG_SEARCH = "rag:search"
RAG_ASK = "rag:ask"
RAG_MANAGE = "rag:manage"


# HR Domain Permissions
ATTENDANCE_VIEW = "attendance:view"
ATTENDANCE_CHECK_IN = "attendance:check_in"
ATTENDANCE_CHECK_OUT = "attendance:check_out"
ATTENDANCE_CREATE = "attendance:create"
ATTENDANCE_UPDATE = "attendance:update"
ATTENDANCE_MANAGE = "attendance:manage"
ATTENDANCE_REPORT = "attendance:report"

RECRUITMENT_VIEW = "recruitment:view"
RECRUITMENT_MANAGE = "recruitment:manage"

PAYROLL_VIEW = "payroll:view"
PAYROLL_MANAGE = "payroll:manage"

LEAVE_VIEW = "leave:view"
LEAVE_APPLY = "leave:apply"
LEAVE_APPROVE = "leave:approve"
LEAVE_MANAGE = "leave:manage"

PERFORMANCE_VIEW = "performance:view"
PERFORMANCE_MANAGE = "performance:manage"

TRAINING_VIEW = "training:view"
TRAINING_MANAGE = "training:manage"

EMPLOYEE_PORTAL_ACCESS = "employee_portal:access"

# Finance Domain Permissions
FINANCE_INVOICE_VIEW = "finance:invoice:view"
FINANCE_INVOICE_CREATE = "finance:invoice:create"
FINANCE_INVOICE_APPROVE = "finance:invoice:approve"
FINANCE_INVOICE_PAY = "finance:invoice:pay"
FINANCE_EXPENSE_VIEW = "finance:expense:view"
FINANCE_EXPENSE_SUBMIT = "finance:expense:submit"
FINANCE_EXPENSE_APPROVE = "finance:expense:approve"
FINANCE_BUDGET_VIEW = "finance:budget:view"
FINANCE_BUDGET_MANAGE = "finance:budget:manage"
FINANCE_REPORT_VIEW = "finance:report:view"
FINANCE_REPORT_GENERATE = "finance:report:generate"

# IT Domain Permissions
IT_TICKET_VIEW = "it:ticket:view"
IT_TICKET_CREATE = "it:ticket:create"
IT_TICKET_RESOLVE = "it:ticket:resolve"
IT_RUNBOOK_VIEW = "it:runbook:view"
IT_RUNBOOK_MANAGE = "it:runbook:manage"

# Legal Domain Permissions
LEGAL_CONTRACT_VIEW = "legal:contract:view"
LEGAL_CONTRACT_CREATE = "legal:contract:create"
LEGAL_COMPLIANCE_VIEW = "legal:compliance:view"
