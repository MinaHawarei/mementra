# Mementra — Future SaaS Architecture Blueprint

## 1. Overview
This document outlines the conceptual data models and architecture for expanding Mementra into a multi-tenant SaaS application with tiered subscriptions and storage quotas, preserving user memory ownership.

## 2. Entities & Schema Conceptual Model

```text
+-------------------+       +-------------------+       +-------------------+
|      Account      |------>|   Subscription    |------>|       Plan        |
+-------------------+       +-------------------+       +-------------------+
| id                |       | id                |       | id                |
| name              |       | account_id        |       | name (Free, Pro)  |
| owner_id          |       | plan_id           |       | storage_limit_mb  |
| created_at        |       | status            |       | monthly_price     |
+-------------------+       | trial_ends_at     |       +-------------------+
                            | ends_at           |
                            +-------------------+
```

### 2.1 Account
Represents a billing boundary (personal or household account).
- `id`: Bigint Primary Key
- `owner_id`: Foreign Key (`users.id`)
- `name`: String

### 2.2 Plan
Defines tiered feature limits:
- Free Tier: 2 GB Storage Quota, 1 Memory Book export / month
- Premium Tier: 100 GB Storage Quota, Unlimited Memory Book PDF exports, Priority sync

### 2.3 Subscription
Integrated via Laravel Cashier (Stripe / Paddle):
- `account_id`: Foreign Key (`accounts.id`)
- `stripe_id`: String
- `stripe_status`: String (active, past_due, canceled)

### 2.4 Storage Quota & Usage Tracking
- Sums `memory_media.size_bytes` per user/account.
- Enforces upload quota in `MediaService` before accepting file uploads.
