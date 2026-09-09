/*
  Warnings:

  - Added the required column `consent` to the `ContactRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContactRequest" ADD COLUMN     "consent" BOOLEAN NOT NULL;
