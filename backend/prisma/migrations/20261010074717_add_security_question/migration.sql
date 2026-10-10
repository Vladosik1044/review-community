/*
  Warnings:

  - Added the required column `securityAnswerHash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `securityQuestion` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "securityAnswerHash" TEXT NOT NULL,
ADD COLUMN     "securityQuestion" TEXT NOT NULL;
