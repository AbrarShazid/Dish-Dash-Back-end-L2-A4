/*
  Warnings:

  - A unique constraint covering the columns `[orderItemId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderItemId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Review_userId_mealId_key";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "orderItemId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderItemId_key" ON "Review"("orderItemId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
