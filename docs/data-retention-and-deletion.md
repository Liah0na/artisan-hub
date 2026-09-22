# Data retention & deletion policy

This document defines, in one place, what happens to each kind of data
ArtisanHub stores when an account or a piece of content goes away. The
corresponding code is cross-referenced so this stays a description of
actual behavior, not aspirational policy.

## Artisan accounts (role: `artisan`)

**Deletion model: hard delete, not anonymization.**

There is no order history, review history, or other record in this app
that legally or functionally needs to survive after an artisan's account
is gone — a `Product` only exists in relation to its artisan, so keeping
an "anonymized" orphaned product around would serve no purpose. Because of
that, account deletion is a full, permanent removal rather than a
soft-delete/anonymize step.

When an artisan deletes their own account
(`DELETE /api/dashboard/account`, `lib` in
`app/api/dashboard/account/route.ts`):

1. The account's password is re-confirmed (defense against session
   hijacking / CSRF, on top of the Origin check every mutating route
   already applies).
2. All of the artisan's `Product` records are deleted.
3. The `User` record itself is deleted.
4. Every Cloudinary asset referenced by those products, plus the
   artisan's avatar, is deleted (`deleteCloudinaryAssets`,
   `lib/utils/cloudinary.server.ts`). This runs *after* the database
   deletion commits, so a transient Cloudinary failure never blocks the
   account from actually being removed — it's logged instead
   (`console.error`) for manual follow-up.

The **superadmin** account cannot be deleted through this endpoint (the
route returns 403 for that role). Removing the only superadmin would leave
the platform unmanageable; if that's genuinely needed, it has to be done
manually (directly against the database), after making sure another
superadmin exists or the platform is being decommissioned.

Admin accounts (`role: admin`) aren't deleted by their own owner at all —
they're managed exclusively by the superadmin via `/admin/admins`
(`app/api/admin/admins/[id]/route.ts`, `DELETE`), which does a hard delete
of the `User` row. Admins have no products or avatar upload flow, so
there's no associated Cloudinary cleanup needed there.

## Contact messages (`ContactMessage`)

Contact messages are **not linked to any user account** — a visitor
doesn't need an account to reach out, so a message is just a
name/email/message tuple with no foreign key to `User`. Account deletion
therefore never touches `ContactMessage` rows, and there's nothing to
anonymize on that side either.

**Retention flow** (implemented in
`lib/services/contact-message-retention.ts`):

```
ContactMessage
      │
      ▼
Is there a
retention hold? ──YES──> KEEP IT (never auto-deleted)
      │
      NO
      │
      ▼
   read? ──YES──> eligible after CONTACT_MESSAGE_RETENTION_DAYS (default 180d)
      │
      NO
      │
      ▼
eligible after CONTACT_MESSAGE_RETENTION_DAYS_UNREAD (default 30d)
      │
      ▼
Daily purge (Vercel Cron → /api/cron/purge-contact-messages)
```

- **Retention hold** (`retentionHold: true`) always wins, regardless of
  age or read state. It's a manual override an admin sets from
  `/admin/messages` ("Reter (não purgar)" / "Liberar retenção") for a
  message that needs to be kept around — e.g. an active dispute. The query
  filters with `retentionHold: { not: true }` rather than `retentionHold:
  false`, so messages written before this field existed (and therefore
  don't have it stored in MongoDB at all) are correctly treated as
  "not held", not accidentally protected forever.
- **Read messages** become eligible for deletion once older than
  `CONTACT_MESSAGE_RETENTION_DAYS` (default: **180 days**).
- **Unread messages** become eligible once older than
  `CONTACT_MESSAGE_RETENTION_DAYS_UNREAD` (default: **30 days**) — shorter
  than read messages, since an unread message this old was never acted on
  and isn't something staff is likely to come back to.

**Enforcement:** the same `purgeExpiredContactMessages()` function is used
by two entry points, so there's exactly one place the rules live:

1. `/api/cron/purge-contact-messages` (`GET`) — runs automatically, once a
   day, via the Vercel Cron job declared in `vercel.json`. Authenticated
   with Vercel's own `CRON_SECRET` convention (an `Authorization: Bearer
   <CRON_SECRET>` header Vercel attaches automatically); the endpoint
   refuses to run if `CRON_SECRET` isn't configured, and rejects any
   request whose header doesn't match. Hosting somewhere other than
   Vercel? This route can be called by any external scheduler that can
   send that header instead.
2. `scripts/purge-old-contact-messages.ts` (`npm run purge:messages`) —
   the same logic, for a manual/local run. Safe to run at any time or
   cadence, including never (the cron job already covers the daily case).

## Uploaded images (Cloudinary)

Every image (avatar or product photo) is stored as a `{ url, publicId }`
pair (`CloudinaryAsset` in `prisma/schema.prisma`), never as a bare URL —
this is what makes deleting the underlying asset possible at all. An
asset's `publicId` is always scoped to the uploading user's own folder
(`artisan-hub/avatars/<userId>/...`, `artisan-hub/products/<userId>/...`),
and the server verifies that ownership on every write
(`isOwnedCloudinaryAsset`, `lib/utils/cloudinary.ts`) — so an asset
belonging to user A can never end up referenced by user B's profile or
product in the first place.

An asset is deleted from Cloudinary (not just dereferenced in Mongo)
whenever it stops being used by anything:

- a product image is removed or replaced (`PATCH` on
  `/api/dashboard/products/[id]`),
- a product is deleted entirely (`DELETE` on the same route),
- an avatar is replaced or removed (`PATCH` on
  `/api/dashboard/profile`),
- an account is deleted (`DELETE` on `/api/dashboard/account`, see
  above).

## Summary table

| Data                       | Trigger                        | Outcome                                                    |
|----------------------------|---------------------------------|--------------------------------------------------------------|
| Artisan account + products | Self-service account deletion   | Hard delete (User + Products + their Cloudinary assets)      |
| Admin account               | Superadmin removes it           | Hard delete (User row only — no products/avatar)              |
| Superadmin account          | —                                | Cannot be self-deleted; manual DB action only                 |
| Contact message (on retention hold) | —                                | Never auto-deleted                                            |
| Contact message (read, no hold)     | Daily cron / `purge:messages`    | Deleted after `CONTACT_MESSAGE_RETENTION_DAYS` (default 180)  |
| Contact message (unread, no hold)   | Daily cron / `purge:messages`    | Deleted after `CONTACT_MESSAGE_RETENTION_DAYS_UNREAD` (default 30) |
| Cloudinary image            | Removed/replaced/product or account deleted | Deleted from Cloudinary, not just unlinked            |
