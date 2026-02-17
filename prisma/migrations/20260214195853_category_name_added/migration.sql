/*
  Warnings:

  - Added the required column `categoryName` to the `Meal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "categoryName" TEXT NOT NULL;
