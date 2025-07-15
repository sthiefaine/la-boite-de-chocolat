-- AlterTable
ALTER TABLE "Saga" ADD COLUMN "slug" TEXT;

-- Generate slugs for existing sagas
UPDATE "Saga" 
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE("name", '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '^-+|-+$', '', 'g'
  )
) || '-' || SUBSTRING("id", 1, 8);

-- Make slug NOT NULL after populating
ALTER TABLE "Saga" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Saga_slug_key" ON "Saga"("slug");
