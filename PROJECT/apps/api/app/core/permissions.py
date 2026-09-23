"""
Standard System Permissions for RBAC.
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

# Document & Knowledge Base Permissions
DOCUMENT_READ = "document:read"
DOCUMENT_CREATE = "document:create"
DOCUMENT_UPDATE = "document:update"
DOCUMENT_DELETE = "document:delete"

# RAG & AI Permissions
RAG_SEARCH = "rag:search"
RAG_ASK = "rag:ask"
RAG_MANAGE = "rag:manage"

# Business Module - Attendance Permissions
ATTENDANCE_VIEW = "attendance:view"
ATTENDANCE_CHECK_IN = "attendance:check_in"
ATTENDANCE_CHECK_OUT = "attendance:check_out"
ATTENDANCE_CREATE = "attendance:create"
ATTENDANCE_UPDATE = "attendance:update"
ATTENDANCE_MANAGE = "attendance:manage"
ATTENDANCE_REPORT = "attendance:report"

# Business Module - Recruitment Permissions
RECRUITMENT_VIEW = "recruitment:view"
RECRUITMENT_MANAGE = "recruitment:manage"

# Business Module - Payroll Permissions
PAYROLL_VIEW = "payroll:view"
PAYROLL_MANAGE = "payroll:manage"

# Business Module - Leave Permissions
LEAVE_APPLY = "leave:apply"
LEAVE_VIEW = "leave:view"
LEAVE_APPROVE = "leave:approve"

# Business Module - Projects Permissions
PROJECTS_VIEW = "projects:view"
PROJECTS_MANAGE = "projects:manage"


DEFAULT_SYSTEM_PERMISSIONS = [
    {"key": PLATFORM_MANAGE, "name": "Platform Management", "resource": "platform", "action": "manage", "description": "SuperAdmin full platform control"},
    {"key": TENANT_MANAGE, "name": "Tenant Management", "resource": "tenant", "action": "manage", "description": "Manage tenant settings"},
    {"key": DOMAIN_MANAGE, "name": "Domain Management", "resource": "domain", "action": "manage", "description": "Create and configure domains and departments"},
    {"key": MODULE_MANAGE, "name": "Module Management", "resource": "module", "action": "manage", "description": "Enable, disable, and configure domain modules"},

    {"key": USER_READ, "name": "View Users", "resource": "user", "action": "read", "description": "View users in the organization"},
    {"key": USER_CREATE, "name": "Create Users", "resource": "user", "action": "create", "description": "Create new users in the organization"},
    {"key": USER_UPDATE, "name": "Update Users", "resource": "user", "action": "update", "description": "Update user profiles and statuses"},
    {"key": USER_DELETE, "name": "Delete Users", "resource": "user", "action": "delete", "description": "Deactivate or delete users"},

    {"key": EMPLOYEE_READ, "name": "View Employees", "resource": "employee", "action": "read", "description": "View employee profiles and directory"},
    {"key": EMPLOYEE_CREATE, "name": "Create Employees", "resource": "employee", "action": "create", "description": "Create and onboard new employees"},
    {"key": EMPLOYEE_UPDATE, "name": "Update Employees", "resource": "employee", "action": "update", "description": "Update employee records and designations"},
    {"key": EMPLOYEE_DELETE, "name": "Delete Employees", "resource": "employee", "action": "delete", "description": "Terminate or archive employee records"},
    
    {"key": ROLE_READ, "name": "View Roles", "resource": "role", "action": "read", "description": "View RBAC roles and permissions"},
    {"key": ROLE_CREATE, "name": "Create Roles", "resource": "role", "action": "create", "description": "Create custom RBAC roles"},
    {"key": ROLE_UPDATE, "name": "Update Roles", "resource": "role", "action": "update", "description": "Update RBAC roles"},
    {"key": ROLE_DELETE, "name": "Delete Roles", "resource": "role", "action": "delete", "description": "Delete custom RBAC roles"},
    {"key": PERMISSION_ASSIGN, "name": "Assign Permissions", "resource": "permission", "action": "assign", "description": "Assign permissions to roles"},
    
    {"key": DOCUMENT_READ, "name": "Read Documents", "resource": "document", "action": "read", "description": "View and download documents"},
    {"key": DOCUMENT_CREATE, "name": "Upload Documents", "resource": "document", "action": "create", "description": "Upload new documents to knowledge base"},
    {"key": DOCUMENT_UPDATE, "name": "Update Documents", "resource": "document", "action": "update", "description": "Update document metadata and access"},
    {"key": DOCUMENT_DELETE, "name": "Delete Documents", "resource": "document", "action": "delete", "description": "Delete documents from knowledge base"},
    
    {"key": RAG_SEARCH, "name": "RAG Search", "resource": "rag", "action": "search", "description": "Search knowledge base with vector retrieval"},
    {"key": RAG_ASK, "name": "Ask AI Assistant", "resource": "rag", "action": "ask", "description": "Query AI assistant with secure RAG context"},
    {"key": RAG_MANAGE, "name": "Manage RAG Settings", "resource": "rag", "action": "manage", "description": "Configure domain RAG parameters"},
    
    {"key": ATTENDANCE_VIEW, "name": "View Attendance", "resource": "attendance", "action": "view", "description": "View attendance records"},
    {"key": ATTENDANCE_CHECK_IN, "name": "Check In", "resource": "attendance", "action": "check_in", "description": "Check in for attendance"},
    {"key": ATTENDANCE_CHECK_OUT, "name": "Check Out", "resource": "attendance", "action": "check_out", "description": "Check out for attendance"},
    {"key": ATTENDANCE_CREATE, "name": "Record Attendance", "resource": "attendance", "action": "create", "description": "Manually create attendance records"},
    {"key": ATTENDANCE_UPDATE, "name": "Modify Attendance", "resource": "attendance", "action": "update", "description": "Modify attendance records"},
    {"key": ATTENDANCE_MANAGE, "name": "Manage Attendance", "resource": "attendance", "action": "manage", "description": "Manage attendance configurations"},
    {"key": ATTENDANCE_REPORT, "name": "Attendance Reports", "resource": "attendance", "action": "report", "description": "Generate and view attendance reports"},

    {"key": RECRUITMENT_VIEW, "name": "View Recruitment", "resource": "recruitment", "action": "view", "description": "View applicants and jobs"},
    {"key": RECRUITMENT_MANAGE, "name": "Manage Recruitment", "resource": "recruitment", "action": "manage", "description": "Manage recruitment pipelines"},

    {"key": PAYROLL_VIEW, "name": "View Payroll", "resource": "payroll", "action": "view", "description": "View payroll and pay stubs"},
    {"key": PAYROLL_MANAGE, "name": "Manage Payroll", "resource": "payroll", "action": "manage", "description": "Manage salaries and compensation"},

    {"key": LEAVE_APPLY, "name": "Apply Leave", "resource": "leave", "action": "apply", "description": "Submit leave and time off requests"},
    {"key": LEAVE_VIEW, "name": "View Leave", "resource": "leave", "action": "view", "description": "View leave balances and requests"},
    {"key": LEAVE_APPROVE, "name": "Approve Leave", "resource": "leave", "action": "approve", "description": "Approve or reject leave requests"},

    {"key": PROJECTS_VIEW, "name": "View Projects", "resource": "projects", "action": "view", "description": "View project boards and tasks"},
    {"key": PROJECTS_MANAGE, "name": "Manage Projects", "resource": "projects", "action": "manage", "description": "Manage project boards and milestones"},
]
