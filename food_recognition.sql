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

 Date: 11/12/2024 19:32:57
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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of advertising_banners
-- ----------------------------
INSERT INTO `advertising_banners` VALUES (1, 'Summer Sale', 'Get 50% off!', '2024-06-01', '2024-07-01', 1, 'https://example.com/images/summer-sale.jpg');
INSERT INTO `advertising_banners` VALUES (2, 'Winter Specials', 'Hot deals this winter!', '2024-12-01', '2025-01-01', 1, 'https://example.com/images/winter-specials.jpg');

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
INSERT INTO `config` VALUES ('data_recommend_csv', 'recommend-dataset/recipes_export_20241210_195528.csv');
INSERT INTO `config` VALUES ('superadmin_password', 'admin');
INSERT INTO `config` VALUES ('superadmin_username', 'admin');
INSERT INTO `config` VALUES ('test', 'test1t1t1t1');

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
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of csv_export_version
-- ----------------------------
INSERT INTO `csv_export_version` VALUES (2, 'recipes_export_20241125_113454.csv', '2024-11-25 04:34:55', 1, 2, 1.5, 'completed', NULL);
INSERT INTO `csv_export_version` VALUES (3, 'recipes_export_20241125_143100.csv', '2024-11-25 07:31:01', 1, 2, 1.5, 'completed', NULL);
INSERT INTO `csv_export_version` VALUES (4, 'recipes_export_20241127_150220.csv', '2024-11-27 08:02:21', 1, 2, 1.5, 'completed', NULL);
INSERT INTO `csv_export_version` VALUES (5, 'recipes_export_20241127_155926.csv', '2024-11-27 08:59:26', 1, 10, 4.10156, 'completed', NULL);
INSERT INTO `csv_export_version` VALUES (6, 'recipes_export_20241209_195159.csv', '2024-12-09 12:51:59', 1, 10, 3.79883, 'completed', NULL);
INSERT INTO `csv_export_version` VALUES (7, 'recipes_export_20241209_195529.csv', '2024-12-09 12:55:30', 1, 10, 3.79883, 'completed', NULL);
INSERT INTO `csv_export_version` VALUES (8, 'recipes_export_20241210_195528.csv', '2024-12-10 12:55:29', 1, 12, 4.23438, 'completed', NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rating
-- ----------------------------
INSERT INTO `rating` VALUES (1, 1, 1, 5, 'Delicious and easy to make!');
INSERT INTO `rating` VALUES (2, 2, 2, 4, 'Fresh and healthy.');

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
) ENGINE = InnoDB AUTO_INCREMENT = 54 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipe_info
-- ----------------------------
INSERT INTO `recipe_info` VALUES (1, 'Updated Recipe', '20241202_154933_1382146.png', 'Dessert', 'Published', 'This is an updated recipe.');
INSERT INTO `recipe_info` VALUES (2, 'Vegan Salad', '/avt.png', 'Side', 'exported', 'A refreshing vegan salad with a variety of fresh vegetables.');
INSERT INTO `recipe_info` VALUES (3, 'Chicken Caesar Salad', '/avt.png', 'Main', 'exported', 'A classic Caesar salad topped with grilled chicken and croutons.');
INSERT INTO `recipe_info` VALUES (4, 'BBQ Chicken Pizza', '/avt.png', 'Main', 'exported', 'A delicious BBQ chicken pizza with a crispy crust.');
INSERT INTO `recipe_info` VALUES (5, 'Spicy Chicken Tacos', '/avt.png', 'Main', 'exported', 'Spicy chicken tacos with a tangy salsa.');
INSERT INTO `recipe_info` VALUES (6, 'Chicken Alfredo Pasta', '/avt.png', 'Main', 'exported', 'Creamy Alfredo pasta with grilled chicken.');
INSERT INTO `recipe_info` VALUES (7, 'Chicken Fried Rice', '/avt.png', 'Main', 'exported', 'Flavorful fried rice with chunks of chicken.');
INSERT INTO `recipe_info` VALUES (8, 'Spicy Chicken Curry', '/avt.png', 'Main', 'exported', 'A flavorful and spicy chicken curry with a rich blend of spices.');
INSERT INTO `recipe_info` VALUES (9, 'Garlic Chicken Stir Fry', '/avt.png', 'Main', '', 'A quick and flavorful garlic chicken stir fry with fresh vegetables.');
INSERT INTO `recipe_info` VALUES (10, 'Teriyaki Chicken', '/avt.png', 'Main', '', 'Tender chicken glazed with a sweet teriyaki sauce.');
INSERT INTO `recipe_info` VALUES (11, 'Lemon Chicken Piccata', '/avt.png', 'Main', '', 'Chicken piccata with a lemon butter sauce.');
INSERT INTO `recipe_info` VALUES (12, 'Honey Garlic Chicken', '/avt.png', 'Main', '', 'Succulent chicken coated in a honey garlic glaze.');
INSERT INTO `recipe_info` VALUES (13, 'Cajun Chicken Pasta', '/avt.png', 'Main', 'exported', 'Cajun-spiced chicken served over creamy pasta.');
INSERT INTO `recipe_info` VALUES (14, 'Greek Chicken Gyros', '/avt.png', 'Main', '', 'Greek-style chicken gyros with tzatziki sauce.');
INSERT INTO `recipe_info` VALUES (15, 'Chicken Shawarma', '/avt.png', 'Main', 'exported', 'Middle Eastern spiced chicken shawarma.');
INSERT INTO `recipe_info` VALUES (16, 'Chicken Parmigiana', '/avt.png', 'Main', '', 'Breaded chicken breasts topped with marinara sauce and cheese.');
INSERT INTO `recipe_info` VALUES (17, 'Chicken Enchiladas', '/avt.png', 'Main', '', 'Mexican-style chicken enchiladas with a rich enchilada sauce.');
INSERT INTO `recipe_info` VALUES (18, 'Chicken Fajitas', '/avt.png', 'Main', 'exported', 'Sizzling chicken fajitas with bell peppers and onions.');
INSERT INTO `recipe_info` VALUES (19, 'Buffalo Chicken Wings', '/avt.png', 'Main', '', 'Spicy buffalo chicken wings with a tangy dip.');
INSERT INTO `recipe_info` VALUES (20, 'Chicken Pesto Pasta', '/avt.png', 'Main', '', 'Pasta tossed in pesto sauce with grilled chicken.');
INSERT INTO `recipe_info` VALUES (21, 'Chicken Satay', '/avt.png', 'Main', '', 'Grilled chicken satay with a peanut dipping sauce.');
INSERT INTO `recipe_info` VALUES (22, 'Chicken Cacciatore', '/avt.png', 'Main', '', 'Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.Chicken cacciatore cooked with tomatoes, peppers, and onions.');
INSERT INTO `recipe_info` VALUES (23, 'New Recipe', 'http://example.com/image.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (24, 'Updated Recipe', '20241202_155914_1382146.png', 'Dessert', 'Published', 'This is an updated recipe.');
INSERT INTO `recipe_info` VALUES (25, 'New Recipe', '20241114_160224_maxresdefault1-1200x676.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (26, 'New Recipe', '20241114_160741_maxresdefault1-1200x676.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (27, 'New Recipe', '20241114_160743_maxresdefault1-1200x676.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (28, 'New Recipe', '20241114_160805_maxresdefault1-1200x676.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (29, 'New Recipe', '20241114_160806_maxresdefault1-1200x676.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (30, 'New Recipe', '20241114_160811_maxresdefault1-1200x676.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (31, 'New Recipe', '20241114_160813_maxresdefault1-1200x676.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (32, 'New Recipe', '20241114_160814_maxresdefault1-1200x676.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (33, 'New Recipe', '20241114_160815_maxresdefault1-1200x676.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (34, 'New Recipe', '20241114_161702_maxresdefault1-1200x676.jpg', 'Dessert', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (35, 'New Recipe', '20241114_162036_maxresdefault1-1200x676.jpg', 'dinner', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (36, 'New Recipe', 'test', 'breakfast', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (37, 'New Recipe', '20241115_110047_Chicken-Parts.png', 'lunch', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (38, 'New Recipe', 'test', 'dinner', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (44, 'test', '20241120_171645_avt.png', 'dinner', 'pending', 'test');
INSERT INTO `recipe_info` VALUES (45, 'New Recipe', 'test', 'lunch', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (46, 'New Recipe', '20241125_145007_1638156794-1001.png', 'breakfast', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (47, 'New Recipe', '20241125_161915_image_2024_08_07T07_53_56_727Z.png', 'dinner', 'Published', 'This is a new recipe.');
INSERT INTO `recipe_info` VALUES (48, 'Vegan Pancakes', 'url_to_image', 'breakfast', 'active', 'Delicious vegan pancakes.');
INSERT INTO `recipe_info` VALUES (49, 'Chicken Salad', 'url_to_image', 'lunch', 'active', 'Healthy chicken salad.');
INSERT INTO `recipe_info` VALUES (50, 'Spaghetti Bolognese', 'url_to_image', 'dinner', 'active', 'Classic Italian dish.');
INSERT INTO `recipe_info` VALUES (52, 'test', '20241209_195913_lovepik-abstract-background-mobile-phone-wallpaper-image_400624615.jpg', 'test', 'pending', 'test');
INSERT INTO `recipe_info` VALUES (53, 'Test', '20241210_163523_recipe_image.jpg', '1231', 'Published', '23');
INSERT INTO `recipe_info` VALUES (54, 'Chicken fried', '20241211_154207_recipe_image.jpg', 'Dinner', 'public', 'Dinner chicken');
INSERT INTO `recipe_info` VALUES (55, 'Test', '20241211_170404_recipe_image.jpg', 'breakfast', 'public', 'Test');
INSERT INTO `recipe_info` VALUES (56, 'Fire chicken', '20241211_182921_recipe_image.jpg', 'dinner', 'public', 'ababab');
INSERT INTO `recipe_info` VALUES (57, 'TAATATAT', '20241211_183030_recipe_image.jpg', 'dinner', 'Pending Review', 'ababab');

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
) ENGINE = InnoDB AUTO_INCREMENT = 103 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipe_ingredients
-- ----------------------------
INSERT INTO `recipe_ingredients` VALUES (3, 2, 'Lettuce', 100, 'g', 'https://example.com/images/lettuce.jpg');
INSERT INTO `recipe_ingredients` VALUES (4, 2, 'Tomato', 50, 'g', 'https://example.com/images/tomato.jpg');
INSERT INTO `recipe_ingredients` VALUES (7, 2, 'Lettuce', 100, 'g', 'https://example.com/images/lettuce.jpg');
INSERT INTO `recipe_ingredients` VALUES (8, 2, 'Tomato', 50, 'g', 'https://example.com/images/tomato.jpg');
INSERT INTO `recipe_ingredients` VALUES (9, 3, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (10, 3, 'Romaine Lettuce', 100, 'g', 'https://example.com/images/romaine-lettuce.jpg');
INSERT INTO `recipe_ingredients` VALUES (11, 4, 'Chicken Breast', 150, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (12, 4, 'BBQ Sauce', 50, 'ml', 'https://example.com/images/bbq-sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (13, 5, 'Chicken Thighs', 250, 'g', 'https://example.com/images/chicken-thighs.jpg');
INSERT INTO `recipe_ingredients` VALUES (14, 5, 'Taco Shells', 3, 'pieces', 'https://example.com/images/taco-shells.jpg');
INSERT INTO `recipe_ingredients` VALUES (15, 6, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (16, 6, 'Fettuccine', 150, 'g', 'https://example.com/images/fettuccine.jpg');
INSERT INTO `recipe_ingredients` VALUES (17, 7, 'Chicken Breast', 150, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (18, 7, 'Rice', 200, 'g', 'https://example.com/images/rice.jpg');
INSERT INTO `recipe_ingredients` VALUES (19, 8, 'Chicken Thighs', 300, 'g', 'https://example.com/images/chicken-thighs.jpg');
INSERT INTO `recipe_ingredients` VALUES (20, 8, 'Curry Powder', 2, 'tbsp', 'https://example.com/images/curry-powder.jpg');
INSERT INTO `recipe_ingredients` VALUES (21, 9, 'Chicken Breast', 250, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (22, 9, 'Garlic', 3, 'cloves', 'https://example.com/images/garlic.jpg');
INSERT INTO `recipe_ingredients` VALUES (23, 10, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (24, 10, 'Teriyaki Sauce', 50, 'ml', 'https://example.com/images/teriyaki-sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (25, 11, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (26, 11, 'Lemon', 1, 'piece', 'https://example.com/images/lemon.jpg');
INSERT INTO `recipe_ingredients` VALUES (27, 12, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (28, 12, 'Honey', 50, 'ml', 'https://example.com/images/honey.jpg');
INSERT INTO `recipe_ingredients` VALUES (29, 13, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (30, 13, 'Pasta', 150, 'g', 'https://example.com/images/pasta.jpg');
INSERT INTO `recipe_ingredients` VALUES (31, 14, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (32, 14, 'Gyro Bread', 2, 'pieces', 'https://example.com/images/gyro-bread.jpg');
INSERT INTO `recipe_ingredients` VALUES (33, 15, 'Chicken Thighs', 300, 'g', 'https://example.com/images/chicken-thighs.jpg');
INSERT INTO `recipe_ingredients` VALUES (34, 15, 'Spices', 2, 'tbsp', 'https://example.com/images/spices.jpg');
INSERT INTO `recipe_ingredients` VALUES (35, 16, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (36, 16, 'Marinara Sauce', 100, 'ml', 'https://example.com/images/marinara-sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (37, 17, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (38, 17, 'Tortillas', 3, 'pieces', 'https://example.com/images/tortillas.jpg');
INSERT INTO `recipe_ingredients` VALUES (39, 18, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (40, 18, 'Bell Peppers', 100, 'g', 'https://example.com/images/bell-peppers.jpg');
INSERT INTO `recipe_ingredients` VALUES (41, 19, 'Chicken Wings', 300, 'g', 'https://example.com/images/chicken-wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (42, 19, 'Buffalo Sauce', 50, 'ml', 'https://example.com/images/buffalo-sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (43, 20, 'Chicken Breast', 200, 'g', 'https://example.com/images/chicken-breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (44, 20, 'Pesto Sauce', 50, 'ml', 'https://example.com/images/pesto-sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (45, 23, 'Sugar', 100, 'grams', 'http://example.com/sugar.jpg');
INSERT INTO `recipe_ingredients` VALUES (46, 23, 'Flour', 200, 'grams', 'http://example.com/flour.jpg');
INSERT INTO `recipe_ingredients` VALUES (49, 25, 'Sugar', 100, 'grams', '20241114_160224_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (50, 25, 'Flour', 200, 'grams', '20241114_160224_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (51, 26, 'Sugar', 100, 'grams', '20241114_160741_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (52, 26, 'Flour', 200, 'grams', '20241114_160741_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (53, 27, 'Sugar', 100, 'grams', '20241114_160743_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (54, 27, 'Flour', 200, 'grams', '20241114_160743_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (55, 28, 'Sugar', 100, 'grams', '20241114_160805_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (56, 28, 'Flour', 200, 'grams', '20241114_160805_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (57, 29, 'Sugar', 100, 'grams', '20241114_160806_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (58, 29, 'Flour', 200, 'grams', '20241114_160806_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (59, 30, 'Sugar', 100, 'grams', '20241114_160811_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (60, 30, 'Flour', 200, 'grams', '20241114_160811_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (61, 31, 'Sugar', 100, 'grams', '20241114_160813_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (62, 31, 'Flour', 200, 'grams', '20241114_160813_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (63, 32, 'Sugar', 100, 'grams', '20241114_160814_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (64, 32, 'Flour', 200, 'grams', '20241114_160814_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (65, 33, 'Sugar', 100, 'grams', '20241114_160815_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (66, 33, 'Flour', 200, 'grams', '20241114_160815_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (67, 34, 'Sugar', 100, 'grams', '20241114_161702_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (68, 34, 'Flour', 200, 'grams', '20241114_161702_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (69, 35, 'Sugar', 100, 'grams', '20241114_162036_Tomato.png');
INSERT INTO `recipe_ingredients` VALUES (70, 35, 'Flour', 200, 'grams', '20241114_162036_whole_chicken_wings.jpg');
INSERT INTO `recipe_ingredients` VALUES (71, 36, 'Sugar', 100, 'grams', NULL);
INSERT INTO `recipe_ingredients` VALUES (72, 36, 'Flour', 200, 'grams', NULL);
INSERT INTO `recipe_ingredients` VALUES (73, 37, 'Sugar', 100, 'grams', '20241115_110047_Chicken-Parts.png');
INSERT INTO `recipe_ingredients` VALUES (74, 37, 'Flour', 200, 'grams', '20241115_110047_avt.png');
INSERT INTO `recipe_ingredients` VALUES (75, 38, 'Sugar', 100, 'grams', NULL);
INSERT INTO `recipe_ingredients` VALUES (76, 38, 'Flour', 200, 'grams', NULL);
INSERT INTO `recipe_ingredients` VALUES (82, 44, 'test', 1, 'c', '20241120_171645_test.png');
INSERT INTO `recipe_ingredients` VALUES (83, 45, 'Sugar', 100, 'grams', '20241125_144919_Chicken-Parts.png');
INSERT INTO `recipe_ingredients` VALUES (84, 45, 'Flour', 200, 'grams', '20241125_144919_cell-phone-background-9nfnkxvysqtkt21p.jpg');
INSERT INTO `recipe_ingredients` VALUES (85, 46, 'Sugar', 100, 'grams', '20241125_145007_Chicken-Parts.png');
INSERT INTO `recipe_ingredients` VALUES (86, 46, 'Flour', 200, 'grams', '20241125_145007_cell-phone-background-9nfnkxvysqtkt21p.jpg');
INSERT INTO `recipe_ingredients` VALUES (87, 47, 'Sugar', 100, 'grams', '20241125_161915_image_2024_08_07T07_53_56_727Z.png');
INSERT INTO `recipe_ingredients` VALUES (88, 47, 'Flour', 200, 'grams', NULL);
INSERT INTO `recipe_ingredients` VALUES (97, 1, 'Sugar', 100, 'grams', '20241202_154934_1381232.png');
INSERT INTO `recipe_ingredients` VALUES (98, 1, 'Flour', 200, 'grams', '20241202_154934_1381232.png');
INSERT INTO `recipe_ingredients` VALUES (99, 24, 'Sugar', 100, 'grams', '20241202_155914_1381232.png');
INSERT INTO `recipe_ingredients` VALUES (100, 24, 'Flour', 200, 'grams', '20241202_155914_1381232.png');
INSERT INTO `recipe_ingredients` VALUES (101, 52, 'test', 1, 'test', NULL);
INSERT INTO `recipe_ingredients` VALUES (102, 53, 'Chicken meat', 1, 'c', '20241210_163523_ingredient_image_0.jpg');
INSERT INTO `recipe_ingredients` VALUES (103, 54, 'chicken meat', 1, 'c', '20241211_154207_ingredient_image_0.jpg');
INSERT INTO `recipe_ingredients` VALUES (104, 55, 'Chicken meat', 1, '1', '20241211_170404_ingredient_image_0.jpg');
INSERT INTO `recipe_ingredients` VALUES (105, 56, 'Chicken', 1, 'c', '20241211_182921_ingredient_image_0.jpg');
INSERT INTO `recipe_ingredients` VALUES (106, 57, 'Chicken meat', 1, 'c', '20241211_183030_ingredient_image_0.jpg');

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
) ENGINE = InnoDB AUTO_INCREMENT = 40 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipe_nutrition
-- ----------------------------
INSERT INTO `recipe_nutrition` VALUES (2, 2, 200, 5, 0.5, 20, 5, 0, 50, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (3, 23, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (5, 25, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (6, 26, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (7, 27, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (8, 28, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (9, 29, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (10, 30, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (11, 31, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (12, 32, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (13, 33, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (14, 34, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (15, 35, 10, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (16, 36, 10, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (17, 37, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (18, 38, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (24, 44, 100, 1, 1, 1, 0, 0, 0, 1, 0);
INSERT INTO `recipe_nutrition` VALUES (25, 45, 10, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (26, 46, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (27, 47, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (28, 48, 350, 8, 2, 60, 15, 0, 150, 10, 0);
INSERT INTO `recipe_nutrition` VALUES (29, 49, 400, 15, 3, 40, 5, 50, 200, 25, 0);
INSERT INTO `recipe_nutrition` VALUES (30, 50, 600, 20, 6, 80, 10, 75, 250, 30, 0);
INSERT INTO `recipe_nutrition` VALUES (36, 1, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (37, 24, 300, 10, 2, 50, 20, 0, 5, 5, 0);
INSERT INTO `recipe_nutrition` VALUES (38, 52, 1000, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `recipe_nutrition` VALUES (39, 53, 1200, 30, 40, 20, 10, 300, 0, 600, 0);
INSERT INTO `recipe_nutrition` VALUES (40, 54, 450, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_nutrition` VALUES (41, 55, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_nutrition` VALUES (42, 56, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_nutrition` VALUES (43, 57, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 113 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipe_steps
-- ----------------------------
INSERT INTO `recipe_steps` VALUES (4, 2, 1, 'Chop lettuce and tomato.');
INSERT INTO `recipe_steps` VALUES (5, 2, 2, 'Mix vegetables in a bowl.');
INSERT INTO `recipe_steps` VALUES (9, 2, 1, 'Chop lettuce and tomato.');
INSERT INTO `recipe_steps` VALUES (10, 2, 2, 'Mix vegetables in a bowl.');
INSERT INTO `recipe_steps` VALUES (11, 3, 1, 'Grill the chicken breast and slice into strips.');
INSERT INTO `recipe_steps` VALUES (12, 3, 2, 'Toss lettuce with Caesar dressing and top with chicken and croutons.');
INSERT INTO `recipe_steps` VALUES (13, 4, 1, 'Spread BBQ sauce on pizza crust and add chicken slices.');
INSERT INTO `recipe_steps` VALUES (14, 4, 2, 'Bake in the oven until the crust is golden brown.');
INSERT INTO `recipe_steps` VALUES (15, 5, 1, 'Cook chicken with taco seasoning.');
INSERT INTO `recipe_steps` VALUES (16, 5, 2, 'Assemble tacos with chicken and salsa.');
INSERT INTO `recipe_steps` VALUES (17, 6, 1, 'Cook fettuccine according to package instructions.');
INSERT INTO `recipe_steps` VALUES (18, 6, 2, 'Prepare Alfredo sauce and mix with grilled chicken.');
INSERT INTO `recipe_steps` VALUES (19, 7, 1, 'Cook rice and stir-fry with chicken and vegetables.');
INSERT INTO `recipe_steps` VALUES (20, 8, 1, 'Cook chicken with spices until tender.');
INSERT INTO `recipe_steps` VALUES (21, 8, 2, 'Serve with rice.');
INSERT INTO `recipe_steps` VALUES (22, 9, 1, 'Stir-fry chicken with garlic and vegetables.');
INSERT INTO `recipe_steps` VALUES (23, 10, 1, 'Cook chicken in teriyaki sauce.');
INSERT INTO `recipe_steps` VALUES (24, 11, 1, 'Cook chicken in lemon butter sauce.');
INSERT INTO `recipe_steps` VALUES (25, 12, 1, 'Glaze chicken with honey garlic sauce.');
INSERT INTO `recipe_steps` VALUES (26, 13, 1, 'Cook pasta and toss with Cajun-spiced chicken.');
INSERT INTO `recipe_steps` VALUES (27, 14, 1, 'Assemble gyros with chicken and tzatziki sauce.');
INSERT INTO `recipe_steps` VALUES (28, 15, 1, 'Cook chicken shawarma with spices.');
INSERT INTO `recipe_steps` VALUES (29, 16, 1, 'Bread chicken breasts and bake with marinara sauce.');
INSERT INTO `recipe_steps` VALUES (30, 17, 1, 'Roll chicken in tortillas with enchilada sauce.');
INSERT INTO `recipe_steps` VALUES (31, 18, 1, 'Cook chicken with bell peppers and onions.');
INSERT INTO `recipe_steps` VALUES (32, 19, 1, 'Fry chicken wings and coat with buffalo sauce.');
INSERT INTO `recipe_steps` VALUES (33, 20, 1, 'Toss pasta with pesto sauce and grilled chicken.');
INSERT INTO `recipe_steps` VALUES (34, 23, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (35, 23, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (36, 23, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (40, 25, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (41, 25, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (42, 25, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (43, 26, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (44, 26, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (45, 26, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (46, 27, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (47, 27, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (48, 27, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (49, 28, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (50, 28, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (51, 28, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (52, 29, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (53, 29, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (54, 29, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (55, 30, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (56, 30, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (57, 30, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (58, 31, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (59, 31, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (60, 31, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (61, 32, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (62, 32, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (63, 32, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (64, 33, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (65, 33, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (66, 33, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (67, 34, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (68, 34, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (69, 34, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (70, 35, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (71, 35, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (72, 35, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (73, 36, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (74, 36, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (75, 36, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (76, 37, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (77, 37, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (78, 37, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (79, 38, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (80, 38, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (81, 38, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (82, 44, 1, 'test');
INSERT INTO `recipe_steps` VALUES (83, 45, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (84, 45, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (85, 45, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (86, 46, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (87, 46, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (88, 46, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (89, 47, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (90, 47, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (91, 47, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (104, 1, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (105, 1, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (106, 1, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (107, 24, 1, 'Mix the dry ingredients.');
INSERT INTO `recipe_steps` VALUES (108, 24, 2, 'Add the wet ingredients and mix well.');
INSERT INTO `recipe_steps` VALUES (109, 24, 3, 'Bake in the oven at 180°C for 25 minutes.');
INSERT INTO `recipe_steps` VALUES (110, 52, 1, 'test');
INSERT INTO `recipe_steps` VALUES (111, 53, 1, 'Cooking');
INSERT INTO `recipe_steps` VALUES (112, 53, 2, 'eating');
INSERT INTO `recipe_steps` VALUES (113, 54, 1, 'Cooking');
INSERT INTO `recipe_steps` VALUES (114, 55, 1, 'Cooking');
INSERT INTO `recipe_steps` VALUES (115, 56, 1, 'Cooking');
INSERT INTO `recipe_steps` VALUES (116, 57, 1, 'Cooking');

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
) ENGINE = InnoDB AUTO_INCREMENT = 34 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recipe_vitamin
-- ----------------------------
INSERT INTO `recipe_vitamin` VALUES (2, 2, 10, 8, 600, 30, 5, 3, 80, 0.3, 0.2, 5, 1, 0.4, 0.001, 4);
INSERT INTO `recipe_vitamin` VALUES (3, 3, 10, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (5, 5, 10, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (6, 6, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (7, 7, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (8, 8, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (9, 9, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (10, 10, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (11, 11, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (12, 12, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (13, 13, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (14, 14, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (15, 15, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (16, 16, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (17, 17, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (18, 18, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (19, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `recipe_vitamin` VALUES (20, 25, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (21, 26, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (22, 27, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (23, 28, 100, 2, 500, 30, 10, 2, 1, 1, 1, 1, 1, 1, 0, 5);
INSERT INTO `recipe_vitamin` VALUES (24, 29, 150, 5, 700, 50, 15, 3, 2, 2, 2, 2, 2, 2, 0, 10);
INSERT INTO `recipe_vitamin` VALUES (25, 30, 200, 7, 900, 70, 20, 4, 3, 3, 3, 3, 3, 3, 0, 15);
INSERT INTO `recipe_vitamin` VALUES (30, 36, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (31, 37, 0, 2, 5, 10, 1, 1, 0.5, 0.3, 0.2, 0.4, 0.6, 0.1, 0.01, 2);
INSERT INTO `recipe_vitamin` VALUES (32, 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `recipe_vitamin` VALUES (33, 39, 100, 20, 100, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100);
INSERT INTO `recipe_vitamin` VALUES (34, 40, 100, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (35, 41, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (36, 42, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (37, 43, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

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
INSERT INTO `recipes_contribution` VALUES (2, 2, 1);
INSERT INTO `recipes_contribution` VALUES (35, 1, 1);
INSERT INTO `recipes_contribution` VALUES (36, 1, 1);
INSERT INTO `recipes_contribution` VALUES (37, 1, 1);
INSERT INTO `recipes_contribution` VALUES (38, 1, 1);
INSERT INTO `recipes_contribution` VALUES (44, 1, 1);
INSERT INTO `recipes_contribution` VALUES (45, 1, 1);
INSERT INTO `recipes_contribution` VALUES (46, 1, 1);
INSERT INTO `recipes_contribution` VALUES (47, 1, 1);
INSERT INTO `recipes_contribution` VALUES (52, 1, 1);
INSERT INTO `recipes_contribution` VALUES (53, 14, 1);
INSERT INTO `recipes_contribution` VALUES (54, 14, 0);
INSERT INTO `recipes_contribution` VALUES (55, 14, 0);
INSERT INTO `recipes_contribution` VALUES (56, 14, 0);
INSERT INTO `recipes_contribution` VALUES (57, 14, 0);

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
INSERT INTO `recipes_favourite` VALUES (1, 1);
INSERT INTO `recipes_favourite` VALUES (34, 1);
INSERT INTO `recipes_favourite` VALUES (35, 1);
INSERT INTO `recipes_favourite` VALUES (2, 2);
INSERT INTO `recipes_favourite` VALUES (37, 14);

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
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'test', 'scrypt:32768:8:1$si4WYYr5ogAEyzO1$fba144f822f4f9e0b9592153ea28d7b722ab130d1845967f5e2f3062a756b93848908f8f4efe0181ac1f4a4376b92ad7decf223755c55f8dacff9db53cc17153', 'test@gmail.com', NULL, NULL, 0, NULL);
INSERT INTO `user` VALUES (2, 'test1', 'scrypt:32768:8:1$f2s4CKX04Qb9NQn1$b79953f27435a585815548f7bce07caa38536f17d04824f127c744ea0f899942b50fa6f960841716b3b23f92db0d3b63744158b96ba9c79a728c7c45da118be0', 'baoquoc.job@gmail.com', '606826', '2024-11-25 08:07:40', 0, NULL);
INSERT INTO `user` VALUES (3, 'john_doe', 'hashed_password_1', 'john_doe@example.com', NULL, NULL, 0, 'active');
INSERT INTO `user` VALUES (4, 'jane_smith', 'hashed_password_2', 'jane_smith@example.com', NULL, NULL, 0, 'active');
INSERT INTO `user` VALUES (5, 'newuser', 'scrypt:32768:8:1$DNB3pTOpHGOhvVHp$b506b46ac3269cffc9994b0e6c19fdcda3a1b6c98114ffda83e842f21edce459faabb11a8e1767755ef445e3ade0c966d9bd7b77b4f94fba8717f4be2b8679e8', 'newuser@example.com', NULL, NULL, 0, NULL);
INSERT INTO `user` VALUES (9, 'junq29', 'scrypt:32768:8:1$7KQ4dpFD9jCy61RF$58f69d08c636e80494702ebadf2b8c27c8445c6003dfe015615aeba4414d6eb7be1d422457fbe9c4fdaf201eb0bb7fbfacb75cd65309264adc4d8b622dae4546', 'leesintocbien@gmail.com', '972848', '2024-11-04 04:46:21', 0, NULL);
INSERT INTO `user` VALUES (10, 'baoquoc', 'scrypt:32768:8:1$lQw17qBkVCxUP1h8$5e16a84bc979f2b30a1f28d9657557e3ec3d50bb87111d89a14eb969e7c7a5d0dbcf5917436b02bf8636bde2f59409d9f71ef5f1c5415de46da9effe56a387ab', 'tranbaoquoc@luvina.net', '582701', '2024-11-04 08:09:50', 0, NULL);
INSERT INTO `user` VALUES (11, 'admin', 'scrypt:32768:8:1$VeDEuApRep7q8WFQ$0d808cb5c25d360a37b449a0d55cab2d91678eb65e317a236f9963043cb7bdbc5ab1c4f94e8c21d7d8ad1a42b1cd48f1bf592f87f300dafbe20d08e6bf871ed7', 'admin@gmail.com', NULL, NULL, 0, NULL);
INSERT INTO `user` VALUES (13, 'newuser1', 'scrypt:32768:8:1$DRvQfoNhJ0SpxUCw$a9bab758a5a72fe70fbf776c3fee18259c45b9dd4d7cf314ae929f658c647a332d7fdc90d8e55082df07efaf8f2fbcca7a1ce6f263fd8397f62a6e5d8789bd42', 'newuser1@example.com', NULL, NULL, 0, NULL);
INSERT INTO `user` VALUES (14, 'testuser', 'scrypt:32768:8:1$dBB3kOposankFrzn$0e8cd4e827c4de1b10ac1846e4e4a7200c0912bdcaecf91a1e7870095e49319277c0e77e60feec36f85ef7bfd63f415a2406b2a80045e783d94a33f41d570f9a', 'test123213213@gmail.com', NULL, NULL, 0, NULL);
INSERT INTO `user` VALUES (15, 'tesa', 'scrypt:32768:8:1$eTrE1Pi5LckrBjuX$709029224eefd2caa23e96f9c3b963270ecc34ff4b1b288eb834083ca9db33f8796c8f1f1b44aae0093251351509932c05fe5966f9d787eba396943d66ed33e6', 'test@gamil.com', NULL, NULL, 0, NULL);
INSERT INTO `user` VALUES (16, 'testuser2', 'scrypt:32768:8:1$qJzuI87J2VXhrJkX$71bb7be7b71494414bb4e3af08ab18465a1c52caea68ead82b33f4deeaf68571f5fa45feac91388cd0bac79599c9c270eeee33bcde159f11a3154bc086660093', 'testuser2@gmail.com', NULL, NULL, 0, NULL);
INSERT INTO `user` VALUES (17, 'testuser3', 'scrypt:32768:8:1$tOTU7hP1hbAh1Ccp$2506e267711da49599dbf58e5db77ce57476994a04c5b02b429dc7226adc3734201deb13493987cf43e133271e551fc7f34fd8931776a536a9bafa578da348bf', 'newuser1123@example.com', NULL, NULL, 0, NULL);
INSERT INTO `user` VALUES (18, 'testuser4', 'scrypt:32768:8:1$FAtm3N5pn4B4ODrr$df848c5d4a69cc99bd4f98d1842a4490f91f9e08f4824a0b29c2def389c67fe2792a04f02157d8a914e7ff2e9379ad3e7b97b9cec70d86777eacd9dc31e00ba0', 'testuser4@gmail.com', NULL, NULL, 0, NULL);

SET FOREIGN_KEY_CHECKS = 1;
