delete from clothing_items;

delete from users;

ALTER TABLE clothing_items DROP COLUMN name;

insert into clothing_categories values (2,'Pants');

insert into clothing_categories values (3,'Shoes');

insert into clothing_categories values (4,'Hat');

delete from clothing_items;

UPDATE users
SET username = CONCAT('user_', id)
WHERE username IS NULL;

delete from posts;

ALTER TABLE posts DROP CONSTRAINT ukh1rlsmw5ajcre3jk60xvsbtds;

ALTER TABLE clothing_items DROP COLUMN color;

