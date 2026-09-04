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

**Retention window:** a contact message is eligible for automatic
deletion once it is both:

- marked `read` (i.e., a staff member has already seen and presumably
  acted on it), and
- older than `CONTACT_MESSAGE_RETENTION_DAYS` (env var; **default: 180
  days**).

Unread messages are **never** auto-deleted, regardless of age — nothing
staff hasn't looked at yet should be able to silently disappear.

This is enforced by `scripts/purge-old-contact-messages.ts`
(`npm run purge:messages`), which is **not** run automatically by the
app — there's no cron/scheduler built into this codebase. It needs to be
wired up as a periodic job on whatever platform this is deployed to (e.g.
a daily/weekly scheduled task). Running it more or less often, or not at
all, only affects how long read messages linger — it's safe to run at any
cadence, including manually.

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
| Contact message (unread)    | —                                | Never auto-deleted                                            |
| Contact message (read)      | `purge:messages` script, periodically | Deleted after `CONTACT_MESSAGE_RETENTION_DAYS` (default 180) |
| Cloudinary image            | Removed/replaced/product or account deleted | Deleted from Cloudinary, not just unlinked            |
