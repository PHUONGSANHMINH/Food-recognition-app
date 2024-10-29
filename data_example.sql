-- Thêm dữ liệu vào bảng User
INSERT INTO user (username, password_hash, email, reset_code, reset_code_expiration, reset_attempts, status) VALUES 
('john_doe', 'hashed_password_1', 'john_doe@example.com', NULL, NULL, 0, 'active'),
('jane_smith', 'hashed_password_2', 'jane_smith@example.com', NULL, NULL, 0, 'active');

-- Thêm dữ liệu vào bảng Config
INSERT INTO config (config_name, config_value) VALUES 
('site_name', 'Recipe Website'), 
('admin_email', 'admin@recipewebsite.com');

-- Thêm dữ liệu vào bảng AdvertisingBanners
INSERT INTO advertising_banners (title, content, start_date, expire_date, activate, image_background) VALUES 
('Summer Sale', 'Get 50% off!', '2024-06-01', '2024-07-01', TRUE, 'https://example.com/images/summer-sale.jpg'), 
('Winter Specials', 'Hot deals this winter!', '2024-12-01', '2025-01-01', TRUE, 'https://example.com/images/winter-specials.jpg');

-- Thêm dữ liệu vào bảng RecipeInfo
INSERT INTO recipe_info (name_recipe, image, type, status, summary) VALUES 
('Grilled Chicken Salad', 'https://example.com/images/grilled-chicken-salad.jpg', 'Main', 'published,featured', 'A healthy and delicious grilled chicken salad with fresh vegetables and a light dressing.'),
('Vegan Salad', 'https://example.com/images/vegan-salad.jpg', 'Side', 'published', 'A refreshing vegan salad with a variety of fresh vegetables.');

-- Thêm dữ liệu vào bảng RecipeIngredients
INSERT INTO recipe_ingredients (id_recipe, name_ingredient, quantity, unit, image) VALUES 
(1, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(1, 'Lettuce', 100, 'g', 'https://example.com/images/lettuce.jpg'),
(2, 'Lettuce', 100, 'g', 'https://example.com/images/lettuce.jpg'),
(2, 'Tomato', 50, 'g', 'https://example.com/images/tomato.jpg');

-- Thêm dữ liệu vào bảng RecipeNutrition
INSERT INTO recipe_nutrition (id_recipe, calories, fat, saturated_fat, carbohydrates, sugar, cholesterol, sodium, protein, alcohol) VALUES 
(1, 350, 15, 3, 20, 5, 80, 200, 30, 0),
(2, 200, 5, 0.5, 20, 5, 0, 50, 5, 0);

-- Thêm dữ liệu vào bảng RecipeVitamin
INSERT INTO recipe_vitamin (id_nutrition, protein, calcium, iron, vitamin_a, vitamin_c, vitamin_d, vitamin_e, vitamin_k, vitamin_b1, vitamin_b2, vitamin_b3, vitamin_b5, vitamin_b6, vitamin_b12, fiber) VALUES 
(1, 30, 15, 10, 700, 40, 10, 5, 100, 0.5, 0.3, 7, 1.5, 0.6, 0.002, 5),
(2, 5, 10, 8, 600, 30, 5, 3, 80, 0.3, 0.2, 5, 1, 0.4, 0.001, 4);

-- Thêm dữ liệu vào bảng RecipeSteps
INSERT INTO recipe_steps (id_recipe, step_number, content) VALUES 
(1, 1, 'Marinate chicken breast with salt, pepper, and olive oil.'),
(1, 2, 'Grill the chicken breast for 6-7 minutes on each side.'),
(1, 3, 'Chop lettuce and mix with grilled chicken.'),
(2, 1, 'Chop lettuce and tomato.'),
(2, 2, 'Mix vegetables in a bowl.');

-- Thêm dữ liệu vào bảng RecipesFavourite
INSERT INTO recipes_favourite (id_recipe, id_user) VALUES 
(1, 1), 
(2, 2);

-- Thêm dữ liệu vào bảng RecipesContribution
INSERT INTO recipes_contribution (id_recipe, id_user, accept_contribution) VALUES 
(1, 1, TRUE), 
(2, 2, TRUE);

-- Thêm dữ liệu vào bảng Rating
INSERT INTO rating (id_recipe, id_user, star, description) VALUES 
(1, 1, 5, 'Delicious and easy to make!'),
(2, 2, 4, 'Fresh and healthy.');


-- Thêm dữ liệu vào bảng RecipeInfo
INSERT INTO recipe_info (name_recipe, image, type, status, summary) VALUES 
('Chicken Caesar Salad', 'https://example.com/images/chicken-caesar-salad.jpg', 'Main', 'published,featured', 'A classic Caesar salad topped with grilled chicken and croutons.'),
('BBQ Chicken Pizza', 'https://example.com/images/bbq-chicken-pizza.jpg', 'Main', 'published,featured', 'A delicious BBQ chicken pizza with a crispy crust.'),
('Spicy Chicken Tacos', 'https://example.com/images/spicy-chicken-tacos.jpg', 'Main', 'published,featured', 'Spicy chicken tacos with a tangy salsa.'),
('Chicken Alfredo Pasta', 'https://example.com/images/chicken-alfredo-pasta.jpg', 'Main', 'published,featured', 'Creamy Alfredo pasta with grilled chicken.'),
('Chicken Fried Rice', 'https://example.com/images/chicken-fried-rice.jpg', 'Main', 'published,featured', 'Flavorful fried rice with chunks of chicken.'),
('Spicy Chicken Curry', 'https://example.com/images/spicy-chicken-curry.jpg', 'Main', 'published,featured', 'A flavorful and spicy chicken curry with a rich blend of spices.'),
('Garlic Chicken Stir Fry', 'https://example.com/images/garlic-chicken-stir-fry.jpg', 'Main', 'published,featured', 'A quick and flavorful garlic chicken stir fry with fresh vegetables.'),
('Teriyaki Chicken', 'https://example.com/images/teriyaki-chicken.jpg', 'Main', 'published,featured', 'Tender chicken glazed with a sweet teriyaki sauce.'),
('Lemon Chicken Piccata', 'https://example.com/images/lemon-chicken-piccata.jpg', 'Main', 'published,featured', 'Chicken piccata with a lemon butter sauce.'),
('Honey Garlic Chicken', 'https://example.com/images/honey-garlic-chicken.jpg', 'Main', 'published,featured', 'Succulent chicken coated in a honey garlic glaze.'),
('Cajun Chicken Pasta', 'https://example.com/images/cajun-chicken-pasta.jpg', 'Main', 'published,featured', 'Cajun-spiced chicken served over creamy pasta.'),
('Greek Chicken Gyros', 'https://example.com/images/greek-chicken-gyros.jpg', 'Main', 'published,featured', 'Greek-style chicken gyros with tzatziki sauce.'),
('Chicken Shawarma', 'https://example.com/images/chicken-shawarma.jpg', 'Main', 'published,featured', 'Middle Eastern spiced chicken shawarma.'),
('Chicken Parmigiana', 'https://example.com/images/chicken-parmigiana.jpg', 'Main', 'published,featured', 'Breaded chicken breasts topped with marinara sauce and cheese.'),
('Chicken Enchiladas', 'https://example.com/images/chicken-enchiladas.jpg', 'Main', 'published,featured', 'Mexican-style chicken enchiladas with a rich enchilada sauce.'),
('Chicken Fajitas', 'https://example.com/images/chicken-fajitas.jpg', 'Main', 'published,featured', 'Sizzling chicken fajitas with bell peppers and onions.'),
('Buffalo Chicken Wings', 'https://example.com/images/buffalo-chicken-wings.jpg', 'Main', 'published,featured', 'Spicy buffalo chicken wings with a tangy dip.'),
('Chicken Pesto Pasta', 'https://example.com/images/chicken-pesto-pasta.jpg', 'Main', 'published,featured', 'Pasta tossed in pesto sauce with grilled chicken.'),
('Chicken Satay', 'https://example.com/images/chicken-satay.jpg', 'Main', 'published,featured', 'Grilled chicken satay with a peanut dipping sauce.'),
('Chicken Cacciatore', 'https://example.com/images/chicken-cacciatore.jpg', 'Main', 'published,featured', 'Chicken cacciatore cooked with tomatoes, peppers, and onions.');

-- Thêm dữ liệu vào bảng RecipeSteps
INSERT INTO recipe_steps (id_recipe, step_number, content) VALUES 
(1, 1, 'Marinate chicken breast with salt, pepper, and olive oil.'),
(1, 2, 'Grill the chicken breast for 6-7 minutes on each side.'),
(1, 3, 'Chop lettuce and mix with grilled chicken.'),
(2, 1, 'Chop lettuce and tomato.'),
(2, 2, 'Mix vegetables in a bowl.'),
(3, 1, 'Grill the chicken breast and slice into strips.'),
(3, 2, 'Toss lettuce with Caesar dressing and top with chicken and croutons.'),
(4, 1, 'Spread BBQ sauce on pizza crust and add chicken slices.'),
(4, 2, 'Bake in the oven until the crust is golden brown.'),
(5, 1, 'Cook chicken with taco seasoning.'),
(5, 2, 'Assemble tacos with chicken and salsa.'),
(6, 1, 'Cook fettuccine according to package instructions.'),
(6, 2, 'Prepare Alfredo sauce and mix with grilled chicken.'),
(7, 1, 'Cook rice and stir-fry with chicken and vegetables.'),
(8, 1, 'Cook chicken with spices until tender.'),
(8, 2, 'Serve with rice.'),
(9, 1, 'Stir-fry chicken with garlic and vegetables.'),
(10, 1, 'Cook chicken in teriyaki sauce.'),
(11, 1, 'Cook chicken in lemon butter sauce.'),
(12, 1, 'Glaze chicken with honey garlic sauce.'),
(13, 1, 'Cook pasta and toss with Cajun-spiced chicken.'),
(14, 1, 'Assemble gyros with chicken and tzatziki sauce.'),
(15, 1, 'Cook chicken shawarma with spices.'),
(16, 1, 'Bread chicken breasts and bake with marinara sauce.'),
(17, 1, 'Roll chicken in tortillas with enchilada sauce.'),
(18, 1, 'Cook chicken with bell peppers and onions.'),
(19, 1, 'Fry chicken wings and coat with buffalo sauce.'),
(20, 1, 'Toss pasta with pesto sauce and grilled chicken.');

-- Thêm dữ liệu vào bảng RecipeIngredients
INSERT INTO recipe_ingredients (id_recipe, name_ingredient, quantity, unit, image) VALUES 
(1, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(1, 'Lettuce', 100, 'g', 'https://example.com/images/lettuce.jpg'),
(2, 'Lettuce', 100, 'g', 'https://example.com/images/lettuce.jpg'),
(2, 'Tomato', 50, 'g', 'https://example.com/images/tomato.jpg'),
(3, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(3, 'Romaine Lettuce', 100, 'g', 'https://example.com/images/romaine-lettuce.jpg'),
(4, 'Chicken Breast', 150, 'g', 'https://example.com/images/chicken-breast.jpg'),
(4, 'BBQ Sauce', 50, 'ml', 'https://example.com/images/bbq-sauce.jpg'),
(5, 'Chicken Thighs', 250, 'g', 'https://example.com/images/chicken-thighs.jpg'),
(5, 'Taco Shells', 3, 'pieces', 'https://example.com/images/taco-shells.jpg'),
(6, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(6, 'Fettuccine', 150, 'g', 'https://example.com/images/fettuccine.jpg'),
(7, 'Chicken Breast', 150, 'g', 'https://example.com/images/chicken-breast.jpg'),
(7, 'Rice', 200, 'g', 'https://example.com/images/rice.jpg'),
(8, 'Chicken Thighs', 300, 'g', 'https://example.com/images/chicken-thighs.jpg'),
(8, 'Curry Powder', 2, 'tbsp', 'https://example.com/images/curry-powder.jpg'),
(9, 'Chicken Breast', 250, 'g', 'https://example.com/images/chicken-breast.jpg'),
(9, 'Garlic', 3, 'cloves', 'https://example.com/images/garlic.jpg'),
(10, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(10, 'Teriyaki Sauce', 50, 'ml', 'https://example.com/images/teriyaki-sauce.jpg'),
(11, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(11, 'Lemon', 1, 'piece', 'https://example.com/images/lemon.jpg'),
(12, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(12, 'Honey', 50, 'ml', 'https://example.com/images/honey.jpg'),
(13, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(13, 'Pasta', 150, 'g', 'https://example.com/images/pasta.jpg'),
(14, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(14, 'Gyro Bread', 2, 'pieces', 'https://example.com/images/gyro-bread.jpg'),
(15, 'Chicken Thighs', 300, 'g', 'https://example.com/images/chicken-thighs.jpg'),
(15, 'Spices', 2, 'tbsp', 'https://example.com/images/spices.jpg'),
(16, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(16, 'Marinara Sauce', 100, 'ml', 'https://example.com/images/marinara-sauce.jpg'),
(17, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(17, 'Tortillas', 3, 'pieces', 'https://example.com/images/tortillas.jpg'),
(18, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(18, 'Bell Peppers', 100, 'g', 'https://example.com/images/bell-peppers.jpg'),
(19, 'Chicken Wings', 300, 'g', 'https://example.com/images/chicken-wings.jpg'),
(19, 'Buffalo Sauce', 50, 'ml', 'https://example.com/images/buffalo-sauce.jpg'),
(20, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg'),
(20, 'Pesto Sauce', 50, 'ml', 'https://example.com/images/pesto-sauce.jpg');

INSERT INTO recipe_nutrition (id_recipe, calories, fat, saturated_fat, carbohydrates, sugar, cholesterol, sodium, protein, alcohol) VALUES 
(3, 400, 20, 4, 15, 3, 70, 300, 35, 0),
(4, 600, 25, 8, 50, 10, 60, 800, 30, 0),
(5, 450, 20, 5, 30, 6, 80, 500, 35, 0),
(6, 700, 35, 12, 60, 5, 90, 700, 40, 0),
(7, 500, 20, 5, 50, 4, 70, 600, 30, 0),
(8, 450, 20, 6, 25, 5, 70, 400, 35, 0),
(9, 350, 15, 3, 20, 4, 50, 300, 30, 0),
(10, 300, 10, 2, 15, 3, 60, 200, 25, 0),
(11, 400, 20, 5, 20, 4, 60, 300, 30, 0),
(12, 350, 15, 4, 15, 3, 50, 250, 28, 0),
(13, 450, 18, 6, 30, 5, 60, 350, 32, 0),
(14, 500, 22, 7, 35, 6, 65, 400, 35, 0),
(15, 420, 19, 5, 25, 5, 60, 350, 32, 0),
(16, 370, 17, 4, 20, 4, 55, 300, 29, 0),
(17, 480, 20, 6, 40, 8, 70, 450, 35, 0),
(18, 450, 18, 5, 35, 7, 65, 400, 32, 0),
(19, 460, 20, 6, 38, 6, 75, 420, 33, 0),
(20, 460, 20, 6, 38, 6, 75, 420, 33, 0)

-- Thêm dữ liệu vào bảng RecipeVitamin
INSERT INTO recipe_vitamin (id_nutrition, protein, calcium, iron, vitamin_a, vitamin_c, vitamin_d, vitamin_e, vitamin_k, vitamin_b1, vitamin_b2, vitamin_b3, vitamin_b5, vitamin_b6, vitamin_b12, fiber) VALUES 
(1, 30, 15, 10, 700, 40, 10, 5, 100, 0.5, 0.3, 7, 1.5, 0.6, 0.002, 5),
(2, 5, 10, 8, 600, 30, 5, 3, 80, 0.3, 0.2, 5, 1, 0.4, 0.001, 4),
(3, 35, 20, 8, 900, 50, 5, 3, 150, 0.4, 0.25, 6, 1.4, 0.7, 0.002, 4),
(4, 30, 15, 6, 500, 35, 3, 2, 70, 0.3, 0.2, 5, 1, 0.5, 0.002, 3),
(5, 35, 10, 12, 600, 40, 5, 3, 100, 0.5, 0.3, 6, 1.5, 0.6, 0.002, 4),
(6, 40, 25, 7, 300, 20, 5, 4, 70, 0.4, 0.3, 5.5, 1.2, 0.6, 0.002, 3),
(7, 30, 10, 8, 500, 25, 4, 3, 60, 0.4, 0.25, 5.5, 1.3, 0.6, 0.001, 3),
(8, 35, 12, 10, 700, 40, 5, 4, 90, 0.5, 0.3, 6, 1.5, 0.7, 0.002, 4),
(9, 32, 15, 9, 600, 35, 4, 3, 80, 0.45, 0.28, 5.8, 1.4, 0.65, 0.0018, 3.5),
(10, 28, 20, 7, 550, 30, 3.5, 2.5, 75, 0.38, 0.22, 5.4, 1.25, 0.58, 0.002, 3.2),
(11, 31, 18, 8, 600, 33, 4.2, 3.1, 85, 0.42, 0.24, 5.6, 1.35, 0.63, 0.002, 3.4),
(12, 29, 17, 7.5, 570, 31, 3.8, 2.8, 78, 0.39, 0.23, 5.3, 1.3, 0.61, 0.0019, 3.3),
(13, 33, 22, 9.5, 620, 37, 4.5, 3.4, 90, 0.47, 0.27, 5.9, 1.48, 0.69, 0.0021, 3.7),
(14, 34, 21, 8.5, 615, 36, 4.4, 3.3, 88, 0.46, 0.26, 5.7, 1.47, 0.68, 0.002, 3.6),
(15, 29, 16, 8, 580, 32, 3.7, 2.9, 79, 0.41, 0.25, 5.4, 1.32, 0.62, 0.0017, 3.3),
(16, 30, 19, 7.8, 595, 34, 4, 3, 83, 0.43, 0.26, 5.5, 1.36, 0.64, 0.0018, 3.5),
(17, 32, 20, 9, 610, 35, 4.1, 3.2, 87, 0.45, 0.27, 5.8, 1.4, 0.67, 0.0019, 3.6),
(18, 28, 15, 7.2, 540, 29, 3.5, 2.6, 70, 0.37, 0.21, 5.1, 1.23, 0.59, 0.0016, 3.1),
(19, 29, 18, 8, 575, 32, 3.9, 3, 76, 0.4, 0.23, 5.4, 1.29, 0.61, 0.0017, 3.3),
(20, 31, 21, 9.3, 630, 38, 4.6, 3.5, 92, 0.48, 0.28, 5.9, 1.52, 0.71, 0.0022, 3.8);