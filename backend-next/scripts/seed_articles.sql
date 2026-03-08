-- Ensure admin user exists (password is dummy hash)
INSERT IGNORE INTO User (email, password, name, role, createdAt, updatedAt)
VALUES ('admin@dailyspark.com', '$2a$10$dummyhashforadminpassword', 'Admin', 'admin', NOW(), NOW());

-- Get Admin ID (Assuming it's the one we just inserted or exists)
SET @adminId = (SELECT id FROM User WHERE email = 'admin@dailyspark.com' LIMIT 1);

-- Insert Articles
INSERT INTO Article (title, content, category, level, authorId, createdAt, updatedAt)
VALUES 
('The Secret Life of Rabbits', 'Rabbits are small mammals in the family Leporidae of the order Lagomorpha. They are found in several parts of the world.\n\nRabbits are famous for their reproductive speed. A female rabbit can have many babies in a year. They live in groups called warrens, which are underground tunnels.\n\nRabbits are herbivores, which means they eat plants. They love grass, leafy weeds, and vegetables. Their long ears help them detect predators from far away.', 'Nature', 'Beginner', @adminId, NOW(), NOW()),

('Cloud Computing Basics', 'Cloud computing is the on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user.\n\nLarge clouds often have functions distributed over multiple locations, each of which is a data center. Cloud computing relies on sharing of resources to achieve coherence and economies of scale.', 'Technology', 'Intermediate', @adminId, NOW(), NOW()),

('The History of Tea', 'Tea is an aromatic beverage prepared by pouring hot or boiling water over cured or fresh leaves of Camellia sinensis, an evergreen shrub native to East Asia.\n\nAfter water, it is the most widely consumed drink in the world. There are many different types of tea; some, like Darjeeling and Chinese greens, have a cooling, slightly bitter, and astringent flavour, while others have vastly different profiles that include sweet, nutty, floral, or grassy notes.', 'Culture', 'Advanced', @adminId, NOW(), NOW());
