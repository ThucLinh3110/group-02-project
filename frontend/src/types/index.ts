export enum TicketCategory {
    NETWORK = "Network",
    HARDWARE = "Hardware",
    SOFTWARE = "Software",
    ACCOUNT = "Account",
    SECURITY = "Security",
    OTHER = "Khác",
    UNKNOWN = "Unknown"
}

export enum TicketPriority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
    URGENT = "Urgent",
    UNASSIGNED = "Unassigned"
}

export enum TicketStatus {
    NEW = "New",
    IN_PROGRESS = "In Progress",
    RESOLVED = "Resolved",
    CLOSED = "Closed"
}

export enum MessageRole {
    EMPLOYEE = "Employee",
    AGENT = "Agent",
    SYSTEM = "System"
}

export interface Ticket {
    id: number;
    ticket_code: string;
    title: string;
    description: string;
    attachment_urls?: string[];
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    needs_manual_review: boolean;
    sla_breached: boolean;
    created_at: string;
    sla_due_at?: string;
}

export interface Message {
    id: number;
    ticket_id: number;
    sender_id: string;
    sender_name: string;
    role: MessageRole;
    content: string;
    created_at: string;
}

export interface TicketDetail extends Ticket {
    messages: Message[];
}

export interface SLAMetrics {
    on_track: number;
    at_risk: number;
    breached: number;
    total_active: number;
}
