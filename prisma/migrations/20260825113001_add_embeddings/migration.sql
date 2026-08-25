-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "embedding" vector(1024);

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "embedding" vector(1024);
