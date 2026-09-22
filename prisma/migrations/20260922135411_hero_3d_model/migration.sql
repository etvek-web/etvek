-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "heroModelEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "heroModelUrl" TEXT;
