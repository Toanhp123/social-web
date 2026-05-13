-- Enforce unordered pair uniqueness for friendship records.
DELETE FROM "Friendship" existing
USING (
    SELECT
        "user1Id",
        "user2Id",
        ROW_NUMBER() OVER (
            PARTITION BY LEAST("user1Id", "user2Id"), GREATEST("user1Id", "user2Id")
            ORDER BY "createdAt" ASC, "user1Id" ASC, "user2Id" ASC
        ) AS rank
    FROM "Friendship"
) ranked
WHERE existing."user1Id" = ranked."user1Id"
  AND existing."user2Id" = ranked."user2Id"
  AND ranked.rank > 1;

DELETE FROM "Friendship"
WHERE "user1Id" = "user2Id";

ALTER TABLE "Friendship"
ADD CONSTRAINT "Friendship_no_self_check" CHECK ("user1Id" <> "user2Id");

CREATE UNIQUE INDEX "Friendship_symmetric_pair_key"
ON "Friendship" (LEAST("user1Id", "user2Id"), GREATEST("user1Id", "user2Id"));

-- Enforce unordered pair uniqueness for friend requests.
DELETE FROM "FriendRequest" existing
USING (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY LEAST("requesterId", "receiverId"), GREATEST("requesterId", "receiverId")
            ORDER BY
                CASE "status"
                    WHEN 'ACCEPTED' THEN 0
                    WHEN 'PENDING' THEN 1
                    ELSE 2
                END,
                "createdAt" ASC,
                "id" ASC
        ) AS rank
    FROM "FriendRequest"
) ranked
WHERE existing."id" = ranked."id"
  AND ranked.rank > 1;

DELETE FROM "FriendRequest"
WHERE "requesterId" = "receiverId";

ALTER TABLE "FriendRequest"
ADD CONSTRAINT "FriendRequest_no_self_check" CHECK ("requesterId" <> "receiverId");

CREATE UNIQUE INDEX "FriendRequest_symmetric_pair_key"
ON "FriendRequest" (LEAST("requesterId", "receiverId"), GREATEST("requesterId", "receiverId"));
