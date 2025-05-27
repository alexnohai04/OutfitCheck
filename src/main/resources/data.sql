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

delete public_visible from outfits;

UPDATE clothing_items
SET in_laundry = false;



ALTER TABLE posts DROP CONSTRAINT ukh1rlsmw5ajcre3jk60xvsbtds;

ALTER TABLE outfits DROP COLUMN public_visible;

ALTER TABLE outfits
    RENAME COLUMN is_public TO public_visible;


select * from outfits;

ALTER TABLE clothing_items DROP COLUMN material;

DROP TABLE IF EXISTS clothing_item_colors;

UPDATE clothing_items
SET usage = 'Casual'
WHERE usage IS NULL
   OR TRIM(usage) = ''
   OR LOWER(usage) = 'null';

SELECT id, image_url
FROM clothing_items
WHERE image_url LIKE 'http%';

DELETE FROM clothing_items
WHERE image_url LIKE 'http%';

DELETE FROM outfit_clothing
WHERE clothing_item_id IN (
    SELECT id
    FROM clothing_items
    WHERE image_url LIKE 'file://%'
);