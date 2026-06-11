ALTER TABLE "Follow"
ADD CONSTRAINT "Follow_no_self_check" CHECK ("followerId" <> "followingId");
