-- Soft-delete duplicate active customers with the same WhatsApp digits
-- (keep oldest). Matches 55… vs local and with/without 9th digit via last 8 digits.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY company_id, RIGHT(regexp_replace(COALESCE(whatsapp, phone, ''), '\D', '', 'g'), 8)
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM customers
  WHERE deleted_at IS NULL
    AND COALESCE(whatsapp, phone, '') <> ''
    AND LENGTH(regexp_replace(COALESCE(whatsapp, phone, ''), '\D', '', 'g')) >= 8
)
UPDATE customers
SET deleted_at = NOW(),
    updated_at = NOW()
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Prevent future duplicates for the exact same WhatsApp string.
CREATE UNIQUE INDEX IF NOT EXISTS customers_company_whatsapp_active_uidx
ON customers (company_id, whatsapp)
WHERE deleted_at IS NULL AND whatsapp IS NOT NULL AND whatsapp <> '';
