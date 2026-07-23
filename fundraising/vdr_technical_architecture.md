# Rita POS - Virtual Data Room (VDR) Architecture

This document contains the high-level technical architecture diagrams designed specifically to demonstrate the operational moat to venture capital investors during Due Diligence (Phase 5) and to be included in the Virtual Data Room (VDR) (Phase 1).

## 1. System Architecture: The Offline-First Moat

This diagram highlights how Rita POS guarantees 100% uptime regardless of internet connectivity, a critical competitive advantage in African markets.

```mermaid
graph TD
    subgraph "Retail Outlet (Edge/Local)"
        UI[Rita POS Web/Desktop Interface]
        LocalDB[(SQLite Local Database)]
        SyncEngine[Local Sync Engine]
        Hardware[Thermal Printers & Scanners]
    end

    subgraph "Tax Authority (RRA)"
        VSDC[RRA VSDC API / Local EBM]
    end

    subgraph "Cloud Infrastructure (Supabase)"
        CloudDB[(Supabase PostgreSQL)]
        Auth[Supabase Auth]
        EdgeFunc[Edge Functions / Webhooks]
    end

    %% Edge Connections
    UI -- "Reads/Writes instantly (Zero latency)" --> LocalDB
    UI -- "Controls" --> Hardware
    SyncEngine -- "Polls & Listens" --> LocalDB
    SyncEngine -- "Signs receipts (Offline or Online)" --> VSDC

    %% Cloud Sync
    SyncEngine -- "Eventual Consistency Sync (When Online)" --> CloudDB
    CloudDB -- "Updates Pricing/Inventory" --> SyncEngine
    UI -. "Authenticates (If Online)" .-> Auth
    
    classDef highlight fill:#f9f,stroke:#333,stroke-width:2px;
    class LocalDB,SyncEngine highlight;
```

### Investor Talking Points:
*   **Zero-Downtime:** The primary database is `SQLite Local`. Transactions never wait for a network request. 
*   **Guaranteed Compliance:** Tax signing happens locally via the Sync Engine before receipts are printed, meaning the merchant is always RRA compliant, even if the internet has been down for hours.
*   **Eventual Consistency:** When the network returns, the `SyncEngine` pushes all local changes to `Supabase` seamlessly, ensuring the central ERP remains the source of truth without being a bottleneck.

---

## 2. RRA VSDC Invoice Signing Flow

This sequence diagram details exactly how a transaction is secured and signed for tax compliance. This validates the deep technical expertise claimed in the Pitch Deck.

```mermaid
sequenceDiagram
    participant Cashier as Cashier (UI)
    participant POS as Local POS App
    participant SQLite as Local SQLite DB
    participant VSDC as RRA VSDC Client
    participant Supabase as Cloud Supabase

    Cashier->>POS: Initiates Checkout (Cart Total: 10,000 RWF)
    POS->>SQLite: Save Transaction (Status: Pending Signature)
    SQLite-->>POS: Transaction ID: TXN-123
    
    POS->>VSDC: POST /api/sign_invoice (TXN-123 data)
    Note over VSDC: Calculates VAT<br/>Generates SDC Receipt Number<br/>Creates Internal Data Signature
    VSDC-->>POS: Return Signed Data (Receipt #, Signature, QR Info)
    
    POS->>SQLite: Update Transaction (Status: Signed, Attach RRA Data)
    POS->>Cashier: Print Receipt (With RRA QR Code)
    
    alt Internet is Available
        POS->>Supabase: Async Sync: Push signed TXN-123
        Supabase-->>POS: Sync Confirmed
    else Internet is Down
        Note over POS,SQLite: Transaction remains safe in SQLite. <br/> Will sync automatically upon reconnection.
    end
```

### Investor Talking Points:
*   **Regulatory Alignment:** Demonstrates exact compliance with RRA mandates, significantly de-risking the regulatory environment for investors.
*   **Auditability:** Shows exactly where the state of the transaction is held, proving that data loss is virtually impossible.
