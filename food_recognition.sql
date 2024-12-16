/*
 Navicat Premium Data Transfer

 Source Server         : heartcore_mysql.v8.3_admin
 Source Server Type    : MySQL
 Source Server Version : 80036
 Source Host           : 10.1.1.208:3306
 Source Schema         : food_recognition

 Target Server Type    : MySQL
 Target Server Version : 80036
 File Encoding         : 65001

 Date: 16/12/2024 17:47:17
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for advertising_banners
-- ----------------------------
DROP TABLE IF EXISTS `advertising_banners`;
CREATE TABLE `advertising_banners`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `start_date` date NULL DEFAULT NULL,
  `expire_date` date NULL DEFAULT NULL,
  `activate` tinyint(1) NOT NULL,
  `image_background` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of advertising_banners
-- ----------------------------

-- ----------------------------
-- Table structure for config
-- ----------------------------
DROP TABLE IF EXISTS `config`;
CREATE TABLE `config`  (
  `config_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`config_name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of config
-- ----------------------------
INSERT INTO `config` VALUES ('data_recommend_csv', 'recommend-dataset/recipes_export_20241216_150643.csv');
INSERT INTO `config` VALUES ('superadmin_password', 'admin');
INSERT INTO `config` VALUES ('superadmin_username', 'admin');

-- ----------------------------
-- Table structure for csv_export_version
-- ----------------------------
DROP TABLE IF EXISTS `csv_export_version`;
CREATE TABLE `csv_export_version`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  `exported_by` int NOT NULL,
  `total_recipes` int NOT NULL,
  `file_size` float NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `exported_by`(`exported_by` ASC) USING BTREE,
  CONSTRAINT `csv_export_version_ibfk_1` FOREIGN KEY (`exported_by`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of csv_export_version
-- ----------------------------
INSERT INTO `csv_export_version` VALUES (1, 'recipes_export_20241216_150643.csv', '2024-12-16 08:06:43', 1, 40, 14.5557, 'completed', NULL);

-- ----------------------------
-- Table structure for rating
-- ----------------------------
DROP TABLE IF EXISTS `rating`;
CREATE TABLE `rating`  (
  `id_rate` int NOT NULL AUTO_INCREMENT,
  `id_recipe` int NOT NULL,
  `id_user` int NOT NULL,
  `star` int NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id_rate`) USING BTREE,
  INDEX `id_recipe`(`id_recipe` ASC) USING BTREE,
  INDEX `id_user`(`id_user` ASC) USING BTREE,
  CONSTRAINT `rating_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `rating_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rating
-- ----------------------------
INSERT INTO `rating` VALUES (1, 1, 1, 5, 'Perfect salmon recipe!');
INSERT INTO `rating` VALUES (2, 2, 1, 4, 'Simple and delicious');
INSERT INTO `rating` VALUES (3, 3, 1, 5, 'Best Caesar salad ever');
INSERT INTO `rating` VALUES (4, 4, 1, 4, 'Healthy and tasty');
INSERT INTO `rating` VALUES (5, 5, 1, 5, 'Kids love these pancakes');
INSERT INTO `rating` VALUES (6, 6, 1, 5, 'Perfect salmon recipe!');
INSERT INTO `rating` VALUES (7, 7, 1, 4, 'Simple and delicious');
INSERT INTO `rating` VALUES (8, 8, 1, 5, 'Best Caesar salad ever');
INSERT INTO `rating` VALUES (9, 9, 1, 4, 'Healthy and tasty');
INSERT INTO `rating` VALUES (10, 10, 1, 5, 'Kids love these pancakes');
INSERT INTO `rating` VALUES (11, 11, 1, 5, 'Authentic risotto taste!');
INSERT INTO `rating` VALUES (12, 12, 1, 4, 'Healthy and delicious breakfast');
INSERT INTO `rating` VALUES (13, 13, 1, 5, 'Just like in Italy');
INSERT INTO `rating` VALUES (14, 14, 1, 4, 'Great vegetarian option');
INSERT INTO `rating` VALUES (15, 15, 1, 5, 'Kids love the colorful bowl');
INSERT INTO `rating` VALUES (16, 16, 1, 4, 'Classic taco night');
INSERT INTO `rating` VALUES (17, 17, 1, 5, 'Protein-packed breakfast');
INSERT INTO `rating` VALUES (18, 18, 1, 4, 'Nutritious and filling');
INSERT INTO `rating` VALUES (19, 19, 1, 5, 'Restaurant-quality paella');
INSERT INTO `rating` VALUES (20, 20, 1, 4, 'Interesting vegetable dish');
INSERT INTO `rating` VALUES (21, 21, 1, 5, 'Authentic Thai flavor!');
INSERT INTO `rating` VALUES (22, 22, 1, 4, 'Healthy and delicious');
INSERT INTO `rating` VALUES (23, 23, 1, 5, 'Perfect Mediterranean spread');
INSERT INTO `rating` VALUES (24, 24, 1, 4, 'Flavorful lamb kebabs');
INSERT INTO `rating` VALUES (25, 25, 1, 5, 'Great post-workout smoothie');
INSERT INTO `rating` VALUES (26, 26, 1, 4, 'Reminds me of Vietnam');
INSERT INTO `rating` VALUES (27, 27, 1, 5, 'Colorful and tasty');
INSERT INTO `rating` VALUES (28, 28, 1, 4, 'Interesting breakfast dish');
INSERT INTO `rating` VALUES (29, 29, 1, 5, 'Fresh and light lunch');
INSERT INTO `rating` VALUES (30, 30, 1, 4, 'Rich and comforting tagine');
INSERT INTO `rating` VALUES (41, 31, 1, 5, 'Authentic Korean flavors!');
INSERT INTO `rating` VALUES (42, 32, 1, 4, 'Healthy and creamy');
INSERT INTO `rating` VALUES (43, 33, 1, 5, 'Just like in Greece');
INSERT INTO `rating` VALUES (44, 34, 1, 4, 'Rich and flavorful curry');
INSERT INTO `rating` VALUES (45, 35, 1, 5, 'Perfect morning detox');
INSERT INTO `rating` VALUES (46, 36, 1, 4, 'Crispy and delicious');
INSERT INTO `rating` VALUES (47, 37, 1, 5, 'Unique Peruvian dish');
INSERT INTO `rating` VALUES (48, 38, 1, 4, 'Interesting matcha twist');
INSERT INTO `rating` VALUES (49, 39, 1, 5, 'Creative sushi fusion');
INSERT INTO `rating` VALUES (50, 40, 1, 4, 'Comforting ramen bowl');

-- ----------------------------
-- Table structure for recipe_info
-- ----------------------------
DROP TABLE IF EXISTS `recipe_info`;
CREATE TABLE `recipe_info`  (
  `id_recipe` int NOT NULL AUTO_INCREMENT,
  `name_recipe` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id_recipe`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipe_info
-- ----------------------------
INSERT INTO `recipe_info` VALUES (1, 'Grilled Salmon with Quinoa', 'salmon_quinoa.jpg', 'dinner', 'Published', 'A healthy and delicious dinner with omega-3 rich salmon');
INSERT INTO `recipe_info` VALUES (2, 'Avocado Toast with Eggs', 'avocado_toast.jpg', 'breakfast', 'Published', 'Creamy avocado on crispy toast topped with perfectly cooked eggs');
INSERT INTO `recipe_info` VALUES (3, 'Chicken Caesar Salad', 'caesar_salad.jpg', 'lunch', 'Published', 'Classic lunch salad with grilled chicken and homemade dressing');
INSERT INTO `recipe_info` VALUES (4, 'Vegetable Stir Fry', 'stir_fry.jpg', 'dinner', 'Published', 'Quick and nutritious vegetable stir fry with tofu');
INSERT INTO `recipe_info` VALUES (5, 'Banana Pancakes', 'banana_pancakes.jpg', 'breakfast', 'Published', 'Fluffy pancakes made with ripe bananas');
INSERT INTO `recipe_info` VALUES (6, 'Mediterranean Wrap', 'med_wrap.jpg', 'lunch', 'Published', 'Hummus, vegetables, and feta cheese in a whole wheat wrap');
INSERT INTO `recipe_info` VALUES (7, 'Beef Stroganoff', 'beef_stroganoff.jpg', 'dinner', 'Published', 'Classic comfort food with tender beef and creamy sauce');
INSERT INTO `recipe_info` VALUES (8, 'Overnight Oats', 'overnight_oats.jpg', 'breakfast', 'Published', 'No-cook overnight oats with berries and nuts');
INSERT INTO `recipe_info` VALUES (9, 'Greek Salad', 'greek_salad.jpg', 'lunch', 'Published', 'Fresh and light Greek salad with olives and feta');
INSERT INTO `recipe_info` VALUES (10, 'Shrimp Scampi', 'shrimp_scampi.jpg', 'dinner', 'Published', 'Garlic butter shrimp served over linguine');
INSERT INTO `recipe_info` VALUES (11, 'Mushroom Risotto', 'mushroom_risotto.jpg', 'dinner', 'Published', 'Creamy Italian rice dish with wild mushrooms');
INSERT INTO `recipe_info` VALUES (12, 'Chia Seed Pudding', 'chia_pudding.jpg', 'breakfast', 'Published', 'Healthy overnight chia seed pudding with fresh fruits');
INSERT INTO `recipe_info` VALUES (13, 'Caprese Sandwich', 'caprese_sandwich.jpg', 'lunch', 'Published', 'Classic Italian sandwich with fresh mozzarella and tomatoes');
INSERT INTO `recipe_info` VALUES (14, 'Korean BBQ Tofu Bowl', 'bbq_tofu.jpg', 'dinner', 'Published', 'Spicy Korean-style tofu with rice and vegetables');
INSERT INTO `recipe_info` VALUES (15, 'Smoothie Bowl', 'smoothie_bowl.jpg', 'breakfast', 'Published', 'Colorful smoothie bowl topped with granola and seeds');
INSERT INTO `recipe_info` VALUES (16, 'Falafel Wrap', 'falafel_wrap.jpg', 'lunch', 'Published', 'Crispy falafel with tahini sauce in a soft wrap');
INSERT INTO `recipe_info` VALUES (17, 'Beef Tacos', 'beef_tacos.jpg', 'dinner', 'Published', 'Homemade beef tacos with fresh salsa');
INSERT INTO `recipe_info` VALUES (18, 'Protein Pancakes', 'protein_pancakes.jpg', 'breakfast', 'Published', 'High-protein pancakes with protein powder');
INSERT INTO `recipe_info` VALUES (19, 'Quinoa Buddha Bowl', 'buddha_bowl.jpg', 'lunch', 'Published', 'Nutritious bowl with quinoa, roasted vegetables, and dressing');
INSERT INTO `recipe_info` VALUES (20, 'Seafood Paella', 'seafood_paella.jpg', 'dinner', 'Published', 'Traditional Spanish seafood and rice dish');
INSERT INTO `recipe_info` VALUES (21, 'Thai Green Curry', 'thai_curry.jpg', 'dinner', 'Published', 'Authentic Thai green curry with vegetables and coconut milk');
INSERT INTO `recipe_info` VALUES (22, 'Acai Bowl', 'acai_bowl.jpg', 'breakfast', 'Published', 'Superfood breakfast bowl with fresh fruits and nuts');
INSERT INTO `recipe_info` VALUES (23, 'Mediterranean Mezze Plate', 'mezze_plate.jpg', 'lunch', 'Published', 'Variety of Mediterranean small plates and dips');
INSERT INTO `recipe_info` VALUES (24, 'Lamb Kebabs', 'lamb_kebabs.jpg', 'dinner', 'Published', 'Grilled lamb skewers with herbs and spices');
INSERT INTO `recipe_info` VALUES (25, 'Protein Smoothie', 'protein_smoothie.jpg', 'breakfast', 'Published', 'High-protein morning smoothie with multiple ingredients');
INSERT INTO `recipe_info` VALUES (26, 'Vietnamese Banh Mi', 'banh_mi.jpg', 'lunch', 'Published', 'Traditional Vietnamese sandwich with pickled vegetables');
INSERT INTO `recipe_info` VALUES (27, 'Stuffed Bell Peppers', 'stuffed_peppers.jpg', 'dinner', 'Published', 'Colorful bell peppers stuffed with rice and meat');
INSERT INTO `recipe_info` VALUES (28, 'Shakshuka', 'shakshuka.jpg', 'breakfast', 'Published', 'Middle Eastern eggs poached in spicy tomato sauce');
INSERT INTO `recipe_info` VALUES (29, 'Poke Bowl', 'poke_bowl.jpg', 'lunch', 'Published', 'Hawaiian-style raw fish bowl with rice and toppings');
INSERT INTO `recipe_info` VALUES (30, 'Moroccan Tagine', 'moroccan_tagine.jpg', 'dinner', 'Published', 'Traditional slow-cooked Moroccan stew with meat and vegetables');
INSERT INTO `recipe_info` VALUES (31, 'Korean Bibimbap', 'bibimbap.jpg', 'dinner', 'Published', 'Traditional Korean mixed rice bowl with vegetables and meat');
INSERT INTO `recipe_info` VALUES (32, 'Chia Seed Pudding', 'chia_pudding.jpg', 'breakfast', 'Published', 'Creamy overnight chia seed pudding with tropical fruits');
INSERT INTO `recipe_info` VALUES (33, 'Greek Gyros Plate', 'gyros_plate.jpg', 'lunch', 'Published', 'Classic Greek gyros with tzatziki and pita');
INSERT INTO `recipe_info` VALUES (34, 'Indian Butter Chicken', 'butter_chicken.jpg', 'dinner', 'Published', 'Creamy tomato-based chicken curry with aromatic spices');
INSERT INTO `recipe_info` VALUES (35, 'Green Detox Smoothie', 'detox_smoothie.jpg', 'breakfast', 'Published', 'Nutrient-packed green smoothie with leafy greens');
INSERT INTO `recipe_info` VALUES (36, 'Cuban Sandwich', 'cuban_sandwich.jpg', 'lunch', 'Published', 'Traditional Cuban pressed sandwich with ham and pickles');
INSERT INTO `recipe_info` VALUES (37, 'Peruvian Lomo Saltado', 'lomo_saltado.jpg', 'dinner', 'Published', 'Peruvian stir-fried beef with French fries');
INSERT INTO `recipe_info` VALUES (38, 'Matcha Overnight Oats', 'matcha_oats.jpg', 'breakfast', 'Published', 'Green tea-infused overnight oats');
INSERT INTO `recipe_info` VALUES (39, 'Sushi Burrito', 'sushi_burrito.jpg', 'lunch', 'Published', 'Fusion sushi roll wrapped like a burrito');
INSERT INTO `recipe_info` VALUES (40, 'Japanese Ramen', 'ramen.jpg', 'dinner', 'Published', 'Authentic Japanese ramen with rich broth and toppings');

-- ----------------------------
-- Table structure for recipe_ingredients
-- ----------------------------
DROP TABLE IF EXISTS `recipe_ingredients`;
CREATE TABLE `recipe_ingredients`  (
  `id_ingredient` int NOT NULL AUTO_INCREMENT,
  `id_recipe` int NOT NULL,
  `name_ingredient` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `quantity` float NOT NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id_ingredient`) USING BTREE,
  INDEX `id_recipe`(`id_recipe` ASC) USING BTREE,
  CONSTRAINT `recipe_ingredients_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipe_ingredients
-- ----------------------------
INSERT INTO `recipe_ingredients` VALUES (1, 1, 'Salmon Fillet', 200, 'g', 'salmon.jpg');
INSERT INTO `recipe_ingredients` VALUES (2, 1, 'Quinoa', 100, 'g', 'quinoa.jpg');
INSERT INTO `recipe_ingredients` VALUES (3, 2, 'Bread', 2, 'slice', 'bread.jpg');
INSERT INTO `recipe_ingredients` VALUES (4, 2, 'Avocado', 1, 'piece', 'avocado.jpg');
INSERT INTO `recipe_ingredients` VALUES (5, 3, 'Chicken Breast', 150, 'g', 'chicken.jpg');
INSERT INTO `recipe_ingredients` VALUES (6, 3, 'Romaine Lettuce', 100, 'g', 'lettuce.jpg');
INSERT INTO `recipe_ingredients` VALUES (7, 4, 'Tofu', 200, 'g', 'tofu.jpg');
INSERT INTO `recipe_ingredients` VALUES (8, 4, 'Mixed Vegetables', 300, 'g', 'mixed_veg.jpg');
INSERT INTO `recipe_ingredients` VALUES (9, 5, 'Banana', 2, 'piece', 'banana.jpg');
INSERT INTO `recipe_ingredients` VALUES (10, 5, 'Flour', 150, 'g', 'flour.jpg');
INSERT INTO `recipe_ingredients` VALUES (11, 2, 'Salmon Fillet', 200, 'g', 'salmon.jpg');
INSERT INTO `recipe_ingredients` VALUES (12, 2, 'Quinoa', 100, 'g', 'quinoa.jpg');
INSERT INTO `recipe_ingredients` VALUES (13, 3, 'Bread', 2, 'slice', 'bread.jpg');
INSERT INTO `recipe_ingredients` VALUES (14, 3, 'Avocado', 1, 'piece', 'avocado.jpg');
INSERT INTO `recipe_ingredients` VALUES (15, 4, 'Chicken Breast', 150, 'g', 'chicken.jpg');
INSERT INTO `recipe_ingredients` VALUES (16, 4, 'Romaine Lettuce', 100, 'g', 'lettuce.jpg');
INSERT INTO `recipe_ingredients` VALUES (17, 5, 'Tofu', 200, 'g', 'tofu.jpg');
INSERT INTO `recipe_ingredients` VALUES (18, 5, 'Mixed Vegetables', 300, 'g', 'mixed_veg.jpg');
INSERT INTO `recipe_ingredients` VALUES (19, 6, 'Banana', 2, 'piece', 'banana.jpg');
INSERT INTO `recipe_ingredients` VALUES (20, 6, 'Flour', 150, 'g', 'flour.jpg');
INSERT INTO `recipe_ingredients` VALUES (21, 11, 'Arborio Rice', 250, 'g', 'arborio_rice.jpg');
INSERT INTO `recipe_ingredients` VALUES (22, 11, 'Wild Mushrooms', 200, 'g', 'mushrooms.jpg');
INSERT INTO `recipe_ingredients` VALUES (23, 12, 'Chia Seeds', 50, 'g', 'chia_seeds.jpg');
INSERT INTO `recipe_ingredients` VALUES (24, 12, 'Almond Milk', 250, 'ml', 'almond_milk.jpg');
INSERT INTO `recipe_ingredients` VALUES (25, 13, 'Mozzarella', 100, 'g', 'mozzarella.jpg');
INSERT INTO `recipe_ingredients` VALUES (26, 13, 'Tomatoes', 2, 'piece', 'tomatoes.jpg');
INSERT INTO `recipe_ingredients` VALUES (27, 14, 'Tofu', 250, 'g', 'tofu.jpg');
INSERT INTO `recipe_ingredients` VALUES (28, 14, 'Gochujang Sauce', 50, 'ml', 'gochujang.jpg');
INSERT INTO `recipe_ingredients` VALUES (29, 15, 'Frozen Berries', 150, 'g', 'frozen_berries.jpg');
INSERT INTO `recipe_ingredients` VALUES (30, 15, 'Greek Yogurt', 100, 'g', 'greek_yogurt.jpg');
INSERT INTO `recipe_ingredients` VALUES (31, 16, 'Ground Beef', 300, 'g', 'ground_beef.jpg');
INSERT INTO `recipe_ingredients` VALUES (32, 16, 'Tortillas', 4, 'piece', 'tortillas.jpg');
INSERT INTO `recipe_ingredients` VALUES (33, 17, 'Protein Powder', 50, 'g', 'protein_powder.jpg');
INSERT INTO `recipe_ingredients` VALUES (34, 17, 'Eggs', 2, 'piece', 'eggs.jpg');
INSERT INTO `recipe_ingredients` VALUES (35, 18, 'Quinoa', 150, 'g', 'quinoa.jpg');
INSERT INTO `recipe_ingredients` VALUES (36, 18, 'Roasted Vegetables', 200, 'g', 'roasted_veg.jpg');
INSERT INTO `recipe_ingredients` VALUES (37, 19, 'Seafood Mix', 400, 'g', 'seafood_mix.jpg');
INSERT INTO `recipe_ingredients` VALUES (38, 19, 'Saffron', 1, 'pinch', 'saffron.jpg');
INSERT INTO `recipe_ingredients` VALUES (39, 20, 'Cauliflower', 1, 'head', 'cauliflower.jpg');
INSERT INTO `recipe_ingredients` VALUES (40, 20, 'Curry Paste', 50, 'ml', 'curry_paste.jpg');
INSERT INTO `recipe_ingredients` VALUES (41, 21, 'Coconut Milk', 400, 'ml', 'coconut_milk.jpg');
INSERT INTO `recipe_ingredients` VALUES (42, 21, 'Green Curry Paste', 50, 'g', 'green_curry_paste.jpg');
INSERT INTO `recipe_ingredients` VALUES (43, 22, 'Acai Powder', 50, 'g', 'acai_powder.jpg');
INSERT INTO `recipe_ingredients` VALUES (44, 22, 'Mixed Nuts', 30, 'g', 'mixed_nuts.jpg');
INSERT INTO `recipe_ingredients` VALUES (45, 23, 'Hummus', 150, 'g', 'hummus.jpg');
INSERT INTO `recipe_ingredients` VALUES (46, 23, 'Olives', 50, 'g', 'olives.jpg');
INSERT INTO `recipe_ingredients` VALUES (47, 24, 'Lamb', 300, 'g', 'lamb.jpg');
INSERT INTO `recipe_ingredients` VALUES (48, 24, 'Herbs', 20, 'g', 'herbs.jpg');
INSERT INTO `recipe_ingredients` VALUES (49, 25, 'Protein Powder', 50, 'g', 'protein_powder.jpg');
INSERT INTO `recipe_ingredients` VALUES (50, 25, 'Banana', 1, 'piece', 'banana.jpg');
INSERT INTO `recipe_ingredients` VALUES (51, 26, 'Baguette', 1, 'piece', 'baguette.jpg');
INSERT INTO `recipe_ingredients` VALUES (52, 26, 'Pickled Vegetables', 100, 'g', 'pickled_veg.jpg');
INSERT INTO `recipe_ingredients` VALUES (53, 27, 'Bell Peppers', 4, 'piece', 'bell_peppers.jpg');
INSERT INTO `recipe_ingredients` VALUES (54, 27, 'Ground Beef', 250, 'g', 'ground_beef.jpg');
INSERT INTO `recipe_ingredients` VALUES (55, 28, 'Eggs', 4, 'piece', 'eggs.jpg');
INSERT INTO `recipe_ingredients` VALUES (56, 28, 'Tomato Sauce', 200, 'ml', 'tomato_sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (57, 29, 'Sushi Grade Tuna', 200, 'g', 'tuna.jpg');
INSERT INTO `recipe_ingredients` VALUES (58, 29, 'Sushi Rice', 150, 'g', 'sushi_rice.jpg');
INSERT INTO `recipe_ingredients` VALUES (59, 30, 'Lamb Shoulder', 500, 'g', 'lamb_shoulder.jpg');
INSERT INTO `recipe_ingredients` VALUES (60, 30, 'Preserved Lemons', 50, 'g', 'preserved_lemons.jpg');
INSERT INTO `recipe_ingredients` VALUES (61, 31, 'Beef', 200, 'g', 'beef.jpg');
INSERT INTO `recipe_ingredients` VALUES (62, 31, 'Rice', 150, 'g', 'rice.jpg');
INSERT INTO `recipe_ingredients` VALUES (63, 32, 'Chia Seeds', 50, 'g', 'chia_seeds.jpg');
INSERT INTO `recipe_ingredients` VALUES (64, 32, 'Coconut Milk', 200, 'ml', 'coconut_milk.jpg');
INSERT INTO `recipe_ingredients` VALUES (65, 33, 'Pita Bread', 2, 'piece', 'pita.jpg');
INSERT INTO `recipe_ingredients` VALUES (66, 33, 'Tzatziki', 100, 'g', 'tzatziki.jpg');
INSERT INTO `recipe_ingredients` VALUES (67, 34, 'Chicken Thighs', 300, 'g', 'chicken_thighs.jpg');
INSERT INTO `recipe_ingredients` VALUES (68, 34, 'Tomato Sauce', 200, 'ml', 'tomato_sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (69, 35, 'Spinach', 100, 'g', 'spinach.jpg');
INSERT INTO `recipe_ingredients` VALUES (70, 35, 'Green Apple', 1, 'piece', 'green_apple.jpg');
INSERT INTO `recipe_ingredients` VALUES (71, 36, 'Pork Shoulder', 200, 'g', 'pork_shoulder.jpg');
INSERT INTO `recipe_ingredients` VALUES (72, 36, 'Pickles', 50, 'g', 'pickles.jpg');
INSERT INTO `recipe_ingredients` VALUES (73, 37, 'Beef Sirloin', 250, 'g', 'beef_sirloin.jpg');
INSERT INTO `recipe_ingredients` VALUES (74, 37, 'French Fries', 150, 'g', 'french_fries.jpg');
INSERT INTO `recipe_ingredients` VALUES (75, 38, 'Rolled Oats', 100, 'g', 'rolled_oats.jpg');
INSERT INTO `recipe_ingredients` VALUES (76, 38, 'Matcha Powder', 10, 'g', 'matcha_powder.jpg');
INSERT INTO `recipe_ingredients` VALUES (77, 39, 'Sushi Rice', 150, 'g', 'sushi_rice.jpg');
INSERT INTO `recipe_ingredients` VALUES (78, 39, 'Fresh Tuna', 200, 'g', 'tuna.jpg');
INSERT INTO `recipe_ingredients` VALUES (79, 40, 'Ramen Noodles', 200, 'g', 'ramen_noodles.jpg');
INSERT INTO `recipe_ingredients` VALUES (80, 40, 'Pork Belly', 150, 'g', 'pork_belly.jpg');

-- ----------------------------
-- Table structure for recipe_nutrition
-- ----------------------------
DROP TABLE IF EXISTS `recipe_nutrition`;
CREATE TABLE `recipe_nutrition`  (
  `id_nutrition` int NOT NULL AUTO_INCREMENT,
  `id_recipe` int NOT NULL,
  `calories` float NULL DEFAULT NULL,
  `fat` float NULL DEFAULT NULL,
  `saturated_fat` float NULL DEFAULT NULL,
  `carbohydrates` float NULL DEFAULT NULL,
  `sugar` float NULL DEFAULT NULL,
  `cholesterol` float NULL DEFAULT NULL,
  `sodium` float NULL DEFAULT NULL,
  `protein` float NULL DEFAULT NULL,
  `alcohol` float NULL DEFAULT NULL,
  PRIMARY KEY (`id_nutrition`) USING BTREE,
  INDEX `id_recipe`(`id_recipe` ASC) USING BTREE,
  CONSTRAINT `recipe_nutrition_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipe_nutrition
-- ----------------------------
INSERT INTO `recipe_nutrition` VALUES (1, 1, 350, 15.5, NULL, 30.2, 1.2, 70, 250, 25.3, NULL);
INSERT INTO `recipe_nutrition` VALUES (2, 2, 280, 12.5, NULL, 25.3, 3.4, 35, 180, 15.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (3, 3, 320, 10.2, NULL, 15.5, 2.1, 90, 450, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (4, 4, 250, 8.7, NULL, 20.3, 5.2, 0, 300, 18.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (5, 5, 300, 9.5, NULL, 45.2, 10.5, 50, 200, 12.3, NULL);
INSERT INTO `recipe_nutrition` VALUES (6, 6, 350, 15.5, NULL, 30.2, 1.2, 70, 250, 25.3, NULL);
INSERT INTO `recipe_nutrition` VALUES (7, 7, 280, 12.5, NULL, 25.3, 3.4, 35, 180, 15.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (8, 8, 320, 10.2, NULL, 15.5, 2.1, 90, 450, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (9, 9, 250, 8.7, NULL, 20.3, 5.2, 0, 300, 18.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (10, 10, 300, 9.5, NULL, 45.2, 10.5, 50, 200, 12.3, NULL);
INSERT INTO `recipe_nutrition` VALUES (11, 11, 380, 18.5, NULL, 45.2, 3.4, 25, 320, 12.3, NULL);
INSERT INTO `recipe_nutrition` VALUES (12, 12, 250, 12.5, NULL, 30.6, 5.2, 0, 180, 8.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (13, 13, 320, 15.3, NULL, 25.7, 2.1, 35, 450, 15.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (14, 14, 290, 14.2, NULL, 28.5, 4.5, 0, 280, 20.3, NULL);
INSERT INTO `recipe_nutrition` VALUES (15, 15, 270, 8.7, NULL, 35.4, 12.3, 10, 200, 15.2, NULL);
INSERT INTO `recipe_nutrition` VALUES (16, 16, 450, 22.5, NULL, 35.6, 3.5, 90, 520, 28.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (17, 17, 300, 10.2, NULL, 25.8, 2.7, 45, 250, 30.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (18, 18, 320, 12.5, NULL, 40.3, 5.4, 15, 300, 18.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (19, 19, 400, 20.3, NULL, 30.5, 4.2, 120, 480, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (20, 20, 250, 15.6, NULL, 20.4, 6.3, 5, 220, 12.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (21, 21, 350, 22.5, NULL, 25.3, 4.2, 0, 380, 15.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (22, 22, 280, 12.3, NULL, 35.7, 15.4, 5, 150, 10.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (23, 23, 300, 18.7, NULL, 20.5, 3.6, 10, 450, 12.3, NULL);
INSERT INTO `recipe_nutrition` VALUES (24, 24, 420, 28.5, NULL, 15.3, 2.1, 120, 320, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (25, 25, 250, 8.5, NULL, 30.2, 12.3, 15, 180, 25.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (26, 26, 320, 15.4, NULL, 35.6, 5.2, 25, 520, 15.3, NULL);
INSERT INTO `recipe_nutrition` VALUES (27, 27, 380, 22.3, NULL, 25.7, 4.5, 90, 450, 28.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (28, 28, 290, 20.6, NULL, 15.3, 6.3, 350, 320, 18.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (29, 29, 350, 12.5, NULL, 40.3, 3.4, 45, 280, 25.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (30, 30, 450, 30.5, NULL, 20.4, 5.6, 150, 400, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (31, 31, 380, 18.5, NULL, 35.2, 3.4, 75, 320, 25.3, NULL);
INSERT INTO `recipe_nutrition` VALUES (32, 32, 250, 12.5, NULL, 30.6, 15.2, 0, 180, 8.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (33, 33, 420, 22.3, NULL, 35.7, 4.2, 55, 450, 20.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (34, 34, 450, 28.5, NULL, 20.3, 6.3, 120, 520, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (35, 35, 180, 5.6, NULL, 25.4, 12.5, 0, 150, 10.2, NULL);
INSERT INTO `recipe_nutrition` VALUES (36, 36, 380, 22.7, NULL, 25.3, 3.5, 90, 580, 25.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (37, 37, 420, 25.4, NULL, 30.5, 4.2, 100, 450, 28.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (38, 38, 250, 8.5, NULL, 35.6, 5.4, 10, 200, 12.3, NULL);
INSERT INTO `recipe_nutrition` VALUES (39, 39, 320, 15.3, NULL, 40.2, 3.6, 45, 380, 22.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (40, 40, 450, 30.5, NULL, 35.7, 4.5, 150, 620, 25.6, NULL);

-- ----------------------------
-- Table structure for recipe_steps
-- ----------------------------
DROP TABLE IF EXISTS `recipe_steps`;
CREATE TABLE `recipe_steps`  (
  `id_step` int NOT NULL AUTO_INCREMENT,
  `id_recipe` int NOT NULL,
  `step_number` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id_step`) USING BTREE,
  INDEX `id_recipe`(`id_recipe` ASC) USING BTREE,
  CONSTRAINT `recipe_steps_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipe_steps
-- ----------------------------
INSERT INTO `recipe_steps` VALUES (1, 1, 1, 'Season salmon with salt and pepper');
INSERT INTO `recipe_steps` VALUES (2, 1, 2, 'Grill salmon for 4-5 minutes each side');
INSERT INTO `recipe_steps` VALUES (3, 2, 1, 'Toast bread until golden');
INSERT INTO `recipe_steps` VALUES (4, 2, 2, 'Mash avocado and spread on toast');
INSERT INTO `recipe_steps` VALUES (5, 3, 1, 'Grill chicken breast');
INSERT INTO `recipe_steps` VALUES (6, 3, 2, 'Chop lettuce and prepare dressing');
INSERT INTO `recipe_steps` VALUES (7, 4, 1, 'Cut tofu and vegetables');
INSERT INTO `recipe_steps` VALUES (8, 4, 2, 'Stir fry in hot pan with soy sauce');
INSERT INTO `recipe_steps` VALUES (9, 5, 1, 'Mash bananas and mix with flour');
INSERT INTO `recipe_steps` VALUES (10, 5, 2, 'Cook pancakes on griddle');
INSERT INTO `recipe_steps` VALUES (11, 6, 1, 'Season salmon with salt and pepper');
INSERT INTO `recipe_steps` VALUES (12, 6, 2, 'Grill salmon for 4-5 minutes each side');
INSERT INTO `recipe_steps` VALUES (13, 7, 1, 'Toast bread until golden');
INSERT INTO `recipe_steps` VALUES (14, 7, 2, 'Mash avocado and spread on toast');
INSERT INTO `recipe_steps` VALUES (15, 8, 1, 'Grill chicken breast');
INSERT INTO `recipe_steps` VALUES (16, 8, 2, 'Chop lettuce and prepare dressing');
INSERT INTO `recipe_steps` VALUES (17, 9, 1, 'Cut tofu and vegetables');
INSERT INTO `recipe_steps` VALUES (18, 9, 2, 'Stir fry in hot pan with soy sauce');
INSERT INTO `recipe_steps` VALUES (19, 10, 1, 'Mash bananas and mix with flour');
INSERT INTO `recipe_steps` VALUES (20, 10, 2, 'Cook pancakes on griddle');
INSERT INTO `recipe_steps` VALUES (21, 11, 1, 'Sauté mushrooms in olive oil');
INSERT INTO `recipe_steps` VALUES (22, 11, 2, 'Add rice and slowly incorporate broth');
INSERT INTO `recipe_steps` VALUES (23, 12, 1, 'Mix chia seeds with almond milk');
INSERT INTO `recipe_steps` VALUES (24, 12, 2, 'Refrigerate overnight and top with fruits');
INSERT INTO `recipe_steps` VALUES (25, 13, 1, 'Slice fresh mozzarella and tomatoes');
INSERT INTO `recipe_steps` VALUES (26, 13, 2, 'Layer on bread and grill');
INSERT INTO `recipe_steps` VALUES (27, 14, 1, 'Marinate tofu in gochujang sauce');
INSERT INTO `recipe_steps` VALUES (28, 14, 2, 'Grill tofu and serve with rice');
INSERT INTO `recipe_steps` VALUES (29, 15, 1, 'Blend frozen berries with yogurt');
INSERT INTO `recipe_steps` VALUES (30, 15, 2, 'Top with granola and seeds');
INSERT INTO `recipe_steps` VALUES (31, 16, 1, 'Brown ground beef with taco seasoning');
INSERT INTO `recipe_steps` VALUES (32, 16, 2, 'Warm tortillas and assemble tacos');
INSERT INTO `recipe_steps` VALUES (33, 17, 1, 'Mix protein powder with eggs');
INSERT INTO `recipe_steps` VALUES (34, 17, 2, 'Cook pancakes on griddle');
INSERT INTO `recipe_steps` VALUES (35, 18, 1, 'Cook quinoa according to package instructions');
INSERT INTO `recipe_steps` VALUES (36, 18, 2, 'Roast mixed vegetables and combine');
INSERT INTO `recipe_steps` VALUES (37, 19, 1, 'Prepare seafood and saffron base');
INSERT INTO `recipe_steps` VALUES (38, 19, 2, 'Cook rice and combine with seafood');
INSERT INTO `recipe_steps` VALUES (39, 20, 1, 'Roast cauliflower with curry paste');
INSERT INTO `recipe_steps` VALUES (40, 20, 2, 'Serve with additional garnishes');
INSERT INTO `recipe_steps` VALUES (41, 21, 1, 'Prepare green curry paste');
INSERT INTO `recipe_steps` VALUES (42, 21, 2, 'Simmer vegetables in coconut milk');
INSERT INTO `recipe_steps` VALUES (43, 22, 1, 'Blend acai powder with frozen fruits');
INSERT INTO `recipe_steps` VALUES (44, 22, 2, 'Top with nuts and seeds');
INSERT INTO `recipe_steps` VALUES (45, 23, 1, 'Arrange various Mediterranean dips');
INSERT INTO `recipe_steps` VALUES (46, 23, 2, 'Serve with fresh bread');
INSERT INTO `recipe_steps` VALUES (47, 24, 1, 'Marinate lamb in herb mixture');
INSERT INTO `recipe_steps` VALUES (48, 24, 2, 'Grill lamb skewers until cooked');
INSERT INTO `recipe_steps` VALUES (49, 25, 1, 'Blend protein powder with fruits');
INSERT INTO `recipe_steps` VALUES (50, 25, 2, 'Add ice and blend until smooth');
INSERT INTO `recipe_steps` VALUES (51, 26, 1, 'Prepare Vietnamese-style sandwich filling');
INSERT INTO `recipe_steps` VALUES (52, 26, 2, 'Toast baguette and assemble sandwich');
INSERT INTO `recipe_steps` VALUES (53, 27, 1, 'Prepare filling for stuffed peppers');
INSERT INTO `recipe_steps` VALUES (54, 27, 2, 'Bake stuffed peppers until golden');
INSERT INTO `recipe_steps` VALUES (55, 28, 1, 'Prepare spicy tomato sauce');
INSERT INTO `recipe_steps` VALUES (56, 28, 2, 'Poach eggs in the sauce');
INSERT INTO `recipe_steps` VALUES (57, 29, 1, 'Prepare sushi rice');
INSERT INTO `recipe_steps` VALUES (58, 29, 2, 'Assemble poke bowl with fresh tuna');
INSERT INTO `recipe_steps` VALUES (59, 30, 1, 'Slow cook lamb with spices');
INSERT INTO `recipe_steps` VALUES (60, 30, 2, 'Add preserved lemons near end of cooking');
INSERT INTO `recipe_steps` VALUES (61, 31, 1, 'Prepare vegetables and meat for bibimbap');
INSERT INTO `recipe_steps` VALUES (62, 31, 2, 'Assemble in a bowl with rice');
INSERT INTO `recipe_steps` VALUES (63, 32, 1, 'Mix chia seeds with coconut milk');
INSERT INTO `recipe_steps` VALUES (64, 32, 2, 'Refrigerate overnight and top with fruits');
INSERT INTO `recipe_steps` VALUES (65, 33, 1, 'Prepare gyros meat');
INSERT INTO `recipe_steps` VALUES (66, 33, 2, 'Assemble with tzatziki and pita');
INSERT INTO `recipe_steps` VALUES (67, 34, 1, 'Marinate chicken in butter chicken sauce');
INSERT INTO `recipe_steps` VALUES (68, 34, 2, 'Simmer in creamy tomato sauce');
INSERT INTO `recipe_steps` VALUES (69, 35, 1, 'Blend spinach with green apple');
INSERT INTO `recipe_steps` VALUES (70, 35, 2, 'Add ice and blend until smooth');
INSERT INTO `recipe_steps` VALUES (71, 36, 1, 'Layer ingredients for Cuban sandwich');
INSERT INTO `recipe_steps` VALUES (72, 36, 2, 'Press and grill until crispy');
INSERT INTO `recipe_steps` VALUES (73, 37, 1, 'Stir fry beef for Lomo Saltado');
INSERT INTO `recipe_steps` VALUES (74, 37, 2, 'Add French fries and serve');
INSERT INTO `recipe_steps` VALUES (75, 38, 1, 'Mix oats with matcha powder');
INSERT INTO `recipe_steps` VALUES (76, 38, 2, 'Refrigerate overnight');
INSERT INTO `recipe_steps` VALUES (77, 39, 1, 'Prepare sushi rice');
INSERT INTO `recipe_steps` VALUES (78, 39, 2, 'Roll into burrito-style wrap');
INSERT INTO `recipe_steps` VALUES (79, 40, 1, 'Prepare rich ramen broth');
INSERT INTO `recipe_steps` VALUES (80, 40, 2, 'Cook noodles and add toppings');

-- ----------------------------
-- Table structure for recipe_vitamin
-- ----------------------------
DROP TABLE IF EXISTS `recipe_vitamin`;
CREATE TABLE `recipe_vitamin`  (
  `id_vitamin` int NOT NULL AUTO_INCREMENT,
  `id_nutrition` int NOT NULL,
  `calcium` float NULL DEFAULT NULL,
  `iron` float NULL DEFAULT NULL,
  `vitamin_a` float NULL DEFAULT NULL,
  `vitamin_c` float NULL DEFAULT NULL,
  `vitamin_d` float NULL DEFAULT NULL,
  `vitamin_e` float NULL DEFAULT NULL,
  `vitamin_k` float NULL DEFAULT NULL,
  `vitamin_b1` float NULL DEFAULT NULL,
  `vitamin_b2` float NULL DEFAULT NULL,
  `vitamin_b3` float NULL DEFAULT NULL,
  `vitamin_b5` float NULL DEFAULT NULL,
  `vitamin_b6` float NULL DEFAULT NULL,
  `vitamin_b12` float NULL DEFAULT NULL,
  `fiber` float NULL DEFAULT NULL,
  PRIMARY KEY (`id_vitamin`) USING BTREE,
  INDEX `id_nutrition`(`id_nutrition` ASC) USING BTREE,
  CONSTRAINT `recipe_vitamin_ibfk_1` FOREIGN KEY (`id_nutrition`) REFERENCES `recipe_nutrition` (`id_nutrition`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipe_vitamin
-- ----------------------------
INSERT INTO `recipe_vitamin` VALUES (1, 1, 50, 2.5, 15, 10, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (2, 2, 75, 3.2, 20, 15, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (3, 3, 100, 2.8, 10, 8, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (4, 4, 80, 3.5, 25, 20, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (5, 5, 120, 4, 30, 25, 8, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (6, 6, 50, 2.5, 15, 10, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (7, 7, 75, 3.2, 20, 15, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (8, 8, 100, 2.8, 10, 8, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (9, 9, 80, 3.5, 25, 20, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (10, 10, 120, 4, 30, 25, 8, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (11, 11, 120, 3.5, 25, 15, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (12, 12, 150, 2.8, 20, 25, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (13, 13, 100, 2.5, 15, 10, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (14, 14, 80, 3.2, 30, 20, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (15, 15, 90, 4, 35, 25, 8, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (16, 16, 110, 3.7, 28, 18, 5, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (17, 17, 130, 2.9, 22, 15, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (18, 18, 95, 3.3, 26, 22, 7, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (19, 19, 140, 4.1, 32, 19, 8, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (20, 20, 105, 3.6, 27, 23, 5, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (21, 21, 95, 3.5, 25, 30, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (22, 22, 120, 2.8, 20, 45, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (23, 23, 80, 3.2, 35, 25, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (24, 24, 110, 4, 15, 10, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (25, 25, 130, 2.5, 40, 35, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (26, 26, 100, 3.7, 28, 40, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (27, 27, 85, 3.3, 32, 20, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (28, 28, 140, 4.2, 22, 15, 8, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (29, 29, 75, 3.6, 38, 50, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (30, 30, 115, 3.9, 25, 35, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (31, 31, 110, 3.5, 25, 30, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (32, 32, 95, 2.8, 20, 45, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (33, 33, 130, 3.2, 35, 25, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (34, 34, 80, 4, 15, 10, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (35, 35, 140, 2.5, 40, 35, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (36, 36, 100, 3.7, 28, 40, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (37, 37, 85, 3.3, 32, 20, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (38, 38, 120, 4.2, 22, 15, 8, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (39, 39, 75, 3.6, 38, 50, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (40, 40, 115, 3.9, 25, 35, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for recipes_contribution
-- ----------------------------
DROP TABLE IF EXISTS `recipes_contribution`;
CREATE TABLE `recipes_contribution`  (
  `id_recipe` int NOT NULL,
  `id_user` int NOT NULL,
  `accept_contribution` tinyint(1) NOT NULL,
  PRIMARY KEY (`id_recipe`, `id_user`) USING BTREE,
  INDEX `id_user`(`id_user` ASC) USING BTREE,
  CONSTRAINT `recipes_contribution_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `recipes_contribution_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipes_contribution
-- ----------------------------
INSERT INTO `recipes_contribution` VALUES (1, 1, 1);
INSERT INTO `recipes_contribution` VALUES (2, 1, 1);
INSERT INTO `recipes_contribution` VALUES (3, 1, 1);
INSERT INTO `recipes_contribution` VALUES (4, 1, 1);
INSERT INTO `recipes_contribution` VALUES (5, 1, 1);
INSERT INTO `recipes_contribution` VALUES (6, 1, 1);
INSERT INTO `recipes_contribution` VALUES (7, 1, 1);
INSERT INTO `recipes_contribution` VALUES (8, 1, 1);
INSERT INTO `recipes_contribution` VALUES (9, 1, 1);
INSERT INTO `recipes_contribution` VALUES (10, 1, 1);
INSERT INTO `recipes_contribution` VALUES (11, 1, 1);
INSERT INTO `recipes_contribution` VALUES (12, 1, 1);
INSERT INTO `recipes_contribution` VALUES (13, 1, 1);
INSERT INTO `recipes_contribution` VALUES (14, 1, 1);
INSERT INTO `recipes_contribution` VALUES (15, 1, 1);
INSERT INTO `recipes_contribution` VALUES (16, 1, 1);
INSERT INTO `recipes_contribution` VALUES (17, 1, 1);
INSERT INTO `recipes_contribution` VALUES (18, 1, 1);
INSERT INTO `recipes_contribution` VALUES (19, 1, 1);
INSERT INTO `recipes_contribution` VALUES (20, 1, 1);
INSERT INTO `recipes_contribution` VALUES (21, 1, 1);
INSERT INTO `recipes_contribution` VALUES (22, 1, 1);
INSERT INTO `recipes_contribution` VALUES (23, 1, 1);
INSERT INTO `recipes_contribution` VALUES (24, 1, 1);
INSERT INTO `recipes_contribution` VALUES (25, 1, 1);
INSERT INTO `recipes_contribution` VALUES (26, 1, 1);
INSERT INTO `recipes_contribution` VALUES (27, 1, 1);
INSERT INTO `recipes_contribution` VALUES (28, 1, 1);
INSERT INTO `recipes_contribution` VALUES (29, 1, 1);
INSERT INTO `recipes_contribution` VALUES (30, 1, 1);
INSERT INTO `recipes_contribution` VALUES (31, 1, 1);
INSERT INTO `recipes_contribution` VALUES (32, 1, 1);
INSERT INTO `recipes_contribution` VALUES (33, 1, 1);
INSERT INTO `recipes_contribution` VALUES (34, 1, 1);
INSERT INTO `recipes_contribution` VALUES (35, 1, 1);
INSERT INTO `recipes_contribution` VALUES (36, 1, 1);
INSERT INTO `recipes_contribution` VALUES (37, 1, 1);
INSERT INTO `recipes_contribution` VALUES (38, 1, 1);
INSERT INTO `recipes_contribution` VALUES (39, 1, 1);
INSERT INTO `recipes_contribution` VALUES (40, 1, 1);

-- ----------------------------
-- Table structure for recipes_favourite
-- ----------------------------
DROP TABLE IF EXISTS `recipes_favourite`;
CREATE TABLE `recipes_favourite`  (
  `id_recipe` int NOT NULL,
  `id_user` int NOT NULL,
  PRIMARY KEY (`id_recipe`, `id_user`) USING BTREE,
  INDEX `id_user`(`id_user` ASC) USING BTREE,
  CONSTRAINT `recipes_favourite_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `recipes_favourite_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipes_favourite
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reset_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `reset_code_expiration` datetime NULL DEFAULT NULL,
  `reset_attempts` int NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  PRIMARY KEY (`id_user`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', 'scrypt:32768:8:1$nSS2bDUhQyY0hHSw$31b06df7e2302c0ed47bfaf6ebc1cda87a153f453f2dc088763573ae35a7709bcb56e41a08dfa0537e6a09770cad4db91332595b3b206c0734e3309612487a12', 'admin@gmail.com', NULL, NULL, 0, NULL);

-- ----------------------------
-- Table structure for user_daily_nutrition_goal
-- ----------------------------
DROP TABLE IF EXISTS `user_daily_nutrition_goal`;
CREATE TABLE `user_daily_nutrition_goal`  (
  `id_goal` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `calories_goal` float NULL DEFAULT NULL,
  `fat_goal` float NULL DEFAULT NULL,
  `protein_goal` float NULL DEFAULT NULL,
  `carbohydrate_goal` float NULL DEFAULT NULL,
  `sugar_goal` float NULL DEFAULT NULL,
  `sodium_goal` float NULL DEFAULT NULL,
  `cholesterol_goal` float NULL DEFAULT NULL,
  `fiber_goal` float NULL DEFAULT NULL,
  PRIMARY KEY (`id_goal`) USING BTREE,
  INDEX `id_user`(`id_user` ASC) USING BTREE,
  CONSTRAINT `user_daily_nutrition_goal_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_daily_nutrition_goal
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
