# Project Brief

## Product Name

Edu Workshop Hub

## One-Sentence Description

A bilingual web platform for managing educational workshops for teachers,
including enrollment, waiting lists, attendance, and participation documents.

## Problem

Educational workshops need a centralized system where teachers can register for
activities and organizers can manage capacity, attendance, and official
documents. The process must support clear roles, bilingual access, and automated
waiting list handling.

## Target Users

- Teachers who want to find and attend workshops.
- Referents who organize and publish workshops.
- Admins who supervise users, categories, translations, and platform activity.

## Team Roles

- Business analyst: Vulcu
- Developers: Horia and Alex Matei
- Tester: Alex
- Designer: Stefan

## Application Roles

### Professor

The professor can:

- Log in.
- View active workshops.
- See workshop details: title, referent, date, location, and available seats.
- Enroll in a workshop.
- Withdraw from a workshop.
- Join the waiting list when a workshop is full.
- See enrollment status: confirmed or waiting list.
- Download a participation certificate after attendance is confirmed.

### Referent

The referent can:

- Create, edit, and delete workshops.
- Configure workshop title, description, capacity, date, and location.
- View confirmed participants.
- View waiting list participants.
- Mark attendance.
- Generate attendance lists as PDF or Excel.

### Admin

The admin can:

- Manage professor and referent accounts.
- Manage workshop or course categories.
- Manage Romanian and German translations.
- View global platform activity and audit information.

## Core Features

- Authentication and role-based layouts.
- Workshop catalog.
- Workshop creation and management.
- Enrollment and withdrawal.
- Automatic waiting list promotion.
- Attendance confirmation.
- Attendance list generation.
- Participation certificate generation.
- Romanian/German language switch.
- Admin user management.
- Admin category and translation management.

## Main Workflows

### Professor Enrollment

1. Professor logs in.
2. Professor opens the workshop catalog.
3. Professor selects an active workshop.
4. If seats are available, the professor enrolls as confirmed participant.
5. If no seats are available, the professor can join the waiting list.
6. Professor can later withdraw from the workshop.

### Waiting List Promotion

1. A confirmed professor withdraws from a workshop.
2. One seat becomes available.
3. The system finds the first waiting list entry by enrollment timestamp.
4. That teacher is promoted to confirmed participant.
5. The promoted participant receives an email notification.

### Attendance And Documents

1. Referent opens the participant list for a workshop.
2. Referent marks attendance for participants.
3. Referent exports an attendance list as PDF or Excel.
4. A professor whose attendance was confirmed can download a participation
   certificate.

## Data Model

The following tables are implemented in the database:

| Table | Key Columns |
| --- | --- |
| `users` | `id`, `google_id` (nullable, unique), `first_name`, `last_name`, `email` (unique), `role` (default: `professor`) |
| `workshops` | `id`, `referent_id` (FK), `title_ro`, `title_de`, `description_ro`, `description_de`, `location`, `max_slots`, `occupied_slots`, `scheduled_at`, `is_active` |
| `registrations` | `id`, `workshop_id` (FK), `user_id` (FK), `status` (`enrolled` / `waitlist` / `cancelled`), `attended` |
| `certificates` | `id`, `registration_id` (FK), `file_path` |

Entities planned for future phases:

- `WorkshopCategory`
- `Translation`
- `AuditLog`

## Non-Functional Requirements

- Authentication is handled via Google OAuth; no password storage is required.
- Sessions must be secure and role-aware.
- The interface must be usable on desktop and tablet.
- PDF generation should complete in under 3 seconds for normal workshop sizes.
- The interface must support Romanian and German.

## Integrations

Planned or likely integrations:

- Email notification service for waiting list promotion.
- PDF generation library.
- Excel export library.

## Deployment Notes

The project currently runs locally through Docker Compose. A final hosting
target has not been selected yet.
