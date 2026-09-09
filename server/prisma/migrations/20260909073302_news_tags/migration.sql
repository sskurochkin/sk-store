-- AlterTable
ALTER TABLE "News" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
