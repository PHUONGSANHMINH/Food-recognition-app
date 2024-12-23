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

 Date: 23/12/2024 16:56:14
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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of config
-- ----------------------------
INSERT INTO `config` VALUES ('data_recommend_csv', 'recommend-dataset/recipes_export_20241219_004551.csv');
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
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of csv_export_version
-- ----------------------------
INSERT INTO `csv_export_version` VALUES (1, 'recipes_export_20241216_150643.csv', '2024-12-16 08:06:43', 1, 40, 14.5557, 'completed', NULL);
INSERT INTO `csv_export_version` VALUES (2, 'recipes_export_20241217_162747.csv', '2024-12-17 09:27:48', 1, 60, 22.0938, 'completed', NULL);
INSERT INTO `csv_export_version` VALUES (3, 'recipes_export_20241219_004551.csv', '2024-12-18 17:45:52', 1, 59, 21.6768, 'completed', NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 71 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

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
INSERT INTO `rating` VALUES (51, 41, 1, 5, 'Authentic Indian flavors!');
INSERT INTO `rating` VALUES (52, 42, 1, 4, 'Crispy and delicious');
INSERT INTO `rating` VALUES (53, 43, 1, 5, 'Perfect lunch wrap');
INSERT INTO `rating` VALUES (54, 44, 1, 4, 'Spicy and colorful');
INSERT INTO `rating` VALUES (55, 45, 1, 5, 'Great post-workout drink');
INSERT INTO `rating` VALUES (56, 46, 1, 4, 'Spicy buffalo goodness');
INSERT INTO `rating` VALUES (57, 47, 1, 5, 'Tasty teriyaki');
INSERT INTO `rating` VALUES (58, 48, 1, 4, 'Protein-packed breakfast');
INSERT INTO `rating` VALUES (59, 49, 1, 5, 'Creamy pesto delight');
INSERT INTO `rating` VALUES (60, 50, 1, 4, 'Comforting curry');
INSERT INTO `rating` VALUES (61, 51, 1, 5, 'Spicy Korean chicken perfection!');
INSERT INTO `rating` VALUES (62, 52, 1, 4, 'Hearty breakfast option');
INSERT INTO `rating` VALUES (63, 53, 1, 5, 'Fresh and light salad');
INSERT INTO `rating` VALUES (64, 54, 1, 4, 'Crispy and indulgent');
INSERT INTO `rating` VALUES (65, 55, 1, 5, 'Protein-packed breakfast');
INSERT INTO `rating` VALUES (66, 56, 1, 4, 'Tender BBQ chicken');
INSERT INTO `rating` VALUES (67, 57, 1, 5, 'Classic Chinese-style dish');
INSERT INTO `rating` VALUES (68, 58, 1, 4, 'Interesting breakfast twist');
INSERT INTO `rating` VALUES (69, 59, 1, 5, 'Authentic Greek flavors');
INSERT INTO `rating` VALUES (70, 60, 1, 4, 'Rich and aromatic');
INSERT INTO `rating` VALUES (71, 63, 1, 5, 'Light and refreshing salad');
INSERT INTO `rating` VALUES (72, 64, 1, 4, 'Crunchy and flavorful');
INSERT INTO `rating` VALUES (73, 65, 1, 5, 'Perfect for protein-packed mornings');
INSERT INTO `rating` VALUES (74, 66, 1, 4, 'Delicious BBQ sandwich');
INSERT INTO `rating` VALUES (75, 67, 1, 5, 'Balanced sweet and savory pork');
INSERT INTO `rating` VALUES (76, 68, 1, 4, 'Unique breakfast');
INSERT INTO `rating` VALUES (77, 69, 1, 5, 'Classic Greek flavor with pork');
INSERT INTO `rating` VALUES (78, 70, 1, 4, 'Rich and caramelized pork');
INSERT INTO `rating` VALUES (79, 71, 1, 5, 'Rich and delicious ramen!');
INSERT INTO `rating` VALUES (80, 72, 1, 4, 'Easy and quick fried rice');
INSERT INTO `rating` VALUES (81, 73, 1, 5, 'Fresh and healthy');
INSERT INTO `rating` VALUES (82, 74, 1, 4, 'Savory stir-fry, great flavors');
INSERT INTO `rating` VALUES (83, 75, 1, 5, 'Perfect crispy pork belly');
INSERT INTO `rating` VALUES (84, 76, 1, 4, 'Juicy dumplings, family favorite');
INSERT INTO `rating` VALUES (85, 77, 1, 5, 'Classic sweet and sour flavor');
INSERT INTO `rating` VALUES (86, 78, 1, 4, 'Crispy and flavorful');
INSERT INTO `rating` VALUES (87, 79, 1, 5, 'Comforting Vietnamese pho');
INSERT INTO `rating` VALUES (88, 80, 1, 5, 'Amazing Thai flavors!');
INSERT INTO `rating` VALUES (89, 81, 1, 5, 'Crispy and flavorful bánh xèo');
INSERT INTO `rating` VALUES (90, 82, 1, 5, 'Perfectly grilled pork and fragrant rice');
INSERT INTO `rating` VALUES (91, 83, 1, 4, 'Rich and spicy Bún Bò Huế');
INSERT INTO `rating` VALUES (92, 84, 1, 5, 'Fresh and healthy spring rolls');
INSERT INTO `rating` VALUES (93, 85, 1, 4, 'Unique and flavorful turmeric fish');
INSERT INTO `rating` VALUES (94, 86, 1, 5, 'Refreshing and sweet iced coffee');
INSERT INTO `rating` VALUES (95, 87, 1, 5, 'Delicious bánh mì with perfect seasoning');
INSERT INTO `rating` VALUES (96, 88, 1, 4, 'Comforting and flavorful cháo lòng');
INSERT INTO `rating` VALUES (97, 89, 1, 5, 'Balanced sweet and sour flavors in canh chua');
INSERT INTO `rating` VALUES (98, 90, 1, 4, 'Crispy spring rolls, perfect appetizer');
INSERT INTO `rating` VALUES (99, 91, 1, 5, 'Delicious and tender grilled pork');
INSERT INTO `rating` VALUES (100, 92, 1, 5, 'Hearty and flavorful beef stew');
INSERT INTO `rating` VALUES (101, 93, 1, 4, 'Light and refreshing rice rolls');
INSERT INTO `rating` VALUES (102, 94, 1, 5, 'Flavorful stir-fried noodles');
INSERT INTO `rating` VALUES (103, 95, 1, 4, 'Tasty banana blossom salad');
INSERT INTO `rating` VALUES (104, 96, 1, 5, 'Rich and comforting claypot fish');
INSERT INTO `rating` VALUES (105, 97, 1, 5, 'Unique and savory shrimp paste on sugarcane');
INSERT INTO `rating` VALUES (106, 98, 1, 5, 'Perfectly cooked chicken with fragrant rice');
INSERT INTO `rating` VALUES (107, 99, 1, 5, 'Rich and flavorful braised pork');
INSERT INTO `rating` VALUES (108, 100, 1, 5, 'Sweet and satisfying sticky rice with mango');
INSERT INTO `rating` VALUES (109, 101, 1, 5, 'Delicious and flavorful hot pot');
INSERT INTO `rating` VALUES (110, 102, 1, 4, 'Sweet and soft sweet potato cake');
INSERT INTO `rating` VALUES (111, 103, 1, 5, 'Clear and tasty pork mushroom soup');
INSERT INTO `rating` VALUES (112, 104, 1, 5, 'Fresh and tangy beef salad');
INSERT INTO `rating` VALUES (113, 105, 1, 5, 'Perfect sticky rice with peanuts');
INSERT INTO `rating` VALUES (114, 106, 1, 5, 'Crispy and savory grilled rice paper');
INSERT INTO `rating` VALUES (115, 107, 1, 5, 'Tender and flavorful grilled squid');
INSERT INTO `rating` VALUES (116, 108, 1, 4, 'Light and healthy cabbage rolls');
INSERT INTO `rating` VALUES (117, 109, 1, 5, 'Delicious steamed fish with ginger');
INSERT INTO `rating` VALUES (118, 110, 1, 5, 'Hearty and flavorful meatball soup');

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
) ENGINE = InnoDB AUTO_INCREMENT = 63 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

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
INSERT INTO `recipe_info` VALUES (41, 'Chicken Tikka Masala', 'chicken_tikka.jpg', 'dinner', 'Published', 'Classic Indian dish with tender chicken in creamy tomato sauce');
INSERT INTO `recipe_info` VALUES (42, 'Chicken and Waffle Breakfast', 'chicken_waffle.jpg', 'breakfast', 'Published', 'Southern-style crispy chicken served with fluffy waffles');
INSERT INTO `recipe_info` VALUES (43, 'Chicken Caesar Wrap', 'caesar_wrap.jpg', 'lunch', 'Published', 'Grilled chicken Caesar salad wrapped in a tortilla');
INSERT INTO `recipe_info` VALUES (44, 'Chicken Fajitas', 'chicken_fajitas.jpg', 'dinner', 'Published', 'Sizzling Mexican-style chicken with peppers and onions');
INSERT INTO `recipe_info` VALUES (45, 'Chicken Protein Smoothie', 'chicken_protein.jpg', 'breakfast', 'Published', 'High-protein smoothie with chicken and fruits');
INSERT INTO `recipe_info` VALUES (46, 'Buffalo Chicken Sandwich', 'buffalo_chicken.jpg', 'lunch', 'Published', 'Spicy buffalo chicken on a crispy roll');
INSERT INTO `recipe_info` VALUES (47, 'Chicken Teriyaki Bowl', 'chicken_teriyaki.jpg', 'dinner', 'Published', 'Japanese-inspired teriyaki chicken over rice');
INSERT INTO `recipe_info` VALUES (48, 'Chicken and Spinach Frittata', 'chicken_frittata.jpg', 'breakfast', 'Published', 'Protein-packed egg dish with chicken and spinach');
INSERT INTO `recipe_info` VALUES (49, 'Chicken Pesto Pasta', 'chicken_pesto.jpg', 'lunch', 'Published', 'Creamy pesto pasta with grilled chicken');
INSERT INTO `recipe_info` VALUES (50, 'Coconut Curry Chicken', 'coconut_curry_chicken.jpg', 'dinner', 'Published', 'Creamy coconut curry with tender chicken pieces');
INSERT INTO `recipe_info` VALUES (51, 'Korean Gochujang Chicken', 'korean_chicken.jpg', 'dinner', 'Published', 'Spicy Korean-style chicken with gochujang sauce');
INSERT INTO `recipe_info` VALUES (52, 'Chicken Breakfast Quesadilla', 'chicken_quesadilla.jpg', 'breakfast', 'Published', 'Hearty breakfast quesadilla with scrambled chicken');
INSERT INTO `recipe_info` VALUES (53, 'Mediterranean Chicken Salad', 'med_chicken_salad.jpg', 'lunch', 'Published', 'Grilled chicken with Mediterranean ingredients');
INSERT INTO `recipe_info` VALUES (54, 'Chicken Chimichanga', 'chicken_chimichanga.jpg', 'dinner', 'Published', 'Deep-fried chicken and cheese burrito');
INSERT INTO `recipe_info` VALUES (55, 'Chicken Protein Pancakes', 'chicken_pancakes.jpg', 'breakfast', 'Published', 'High-protein pancakes with shredded chicken');
INSERT INTO `recipe_info` VALUES (56, 'BBQ Chicken Sandwich', 'bbq_chicken_sandwich.jpg', 'lunch', 'Published', 'Slow-cooked BBQ pulled chicken sandwich');
INSERT INTO `recipe_info` VALUES (57, 'Cashew Chicken', 'cashew_chicken.jpg', 'dinner', 'Published', 'Chinese-style stir-fried chicken with cashews');
INSERT INTO `recipe_info` VALUES (58, 'Chicken Shakshuka', 'chicken_shakshuka.jpg', 'breakfast', 'Published', 'Middle Eastern-inspired chicken and egg dish');
INSERT INTO `recipe_info` VALUES (59, 'Greek Chicken Gyros', 'greek_chicken_gyros.jpg', 'lunch', 'Published', 'Traditional Greek chicken gyros with tzatziki');
INSERT INTO `recipe_info` VALUES (60, 'Moroccan Spiced Chicken', 'moroccan_chicken.jpg', 'dinner', 'Published', 'Slow-cooked chicken with aromatic Moroccan spices');
INSERT INTO `recipe_info` VALUES (61, 'Korean Spicy Pork', 'korean_pork.jpg', 'lunch', 'Published', 'Chicken');
INSERT INTO `recipe_info` VALUES (62, 'Pork Breakfast Burrito', 'pork_burrito.jpg', 'breakfast', 'Published', 'Pork');
INSERT INTO `recipe_info` VALUES (63, 'Mediterranean Pork Salad', 'med_pork_salad.jpg', 'lunch', 'Published', 'Grilled pork with Mediterranean ingredients');
INSERT INTO `recipe_info` VALUES (64, 'Pork Chimichanga', 'pork_chimichanga.jpg', 'dinner', 'Published', 'Deep-fried pork and cheese burrito');
INSERT INTO `recipe_info` VALUES (65, 'Pork Protein Pancakes', 'pork_pancakes.jpg', 'breakfast', 'Published', 'High-protein pancakes with shredded pork');
INSERT INTO `recipe_info` VALUES (66, 'BBQ Pulled Pork Sandwich', 'bbq_pork_sandwich.jpg', 'lunch', 'Published', 'Slow-cooked BBQ pulled pork sandwich');
INSERT INTO `recipe_info` VALUES (67, 'Honey Garlic Pork', 'honey_garlic_pork.jpg', 'dinner', 'Published', 'Sweet and savory honey garlic pork stir-fry');
INSERT INTO `recipe_info` VALUES (68, 'Pork Shakshuka', 'pork_shakshuka.jpg', 'breakfast', 'Published', 'Middle Eastern-inspired pork and egg dish');
INSERT INTO `recipe_info` VALUES (69, 'Greek Pork Gyros', 'greek_pork_gyros.jpg', 'lunch', 'Published', 'Traditional Greek pork gyros with tzatziki');
INSERT INTO `recipe_info` VALUES (70, 'Vietnamese Caramelized Pork', 'vietnamese_pork.jpg', 'dinner', 'Published', 'Rich and flavorful Vietnamese caramelized pork');
INSERT INTO `recipe_info` VALUES (71, 'Pork Ramen', 'pork_ramen.jpg', 'dinner', 'Published', 'Japanese-style ramen with pork chashu');
INSERT INTO `recipe_info` VALUES (72, 'Pork Fried Rice', 'pork_fried_rice.jpg', 'lunch', 'Published', 'Quick and easy pork fried rice');
INSERT INTO `recipe_info` VALUES (73, 'Pork Spring Rolls', 'pork_spring_rolls.jpg', 'dinner', 'Published', 'Vietnamese fresh spring rolls with pork');
INSERT INTO `recipe_info` VALUES (74, 'Pork and Eggplant Stir-fry', 'pork_eggplant.jpg', 'dinner', 'Published', 'Savory pork stir-fried with eggplant and spices');
INSERT INTO `recipe_info` VALUES (75, 'Crispy Pork Belly', 'crispy_pork_belly.jpg', 'dinner', 'Published', 'Crispy-skinned pork belly with tender meat');
INSERT INTO `recipe_info` VALUES (76, 'Pork Dumplings', 'pork_dumplings.jpg', 'lunch', 'Published', 'Juicy pork-filled dumplings');
INSERT INTO `recipe_info` VALUES (77, 'Sweet and Sour Pork', 'sweet_sour_pork.jpg', 'dinner', 'Published', 'Classic sweet and sour pork with pineapple');
INSERT INTO `recipe_info` VALUES (78, 'Pork Katsu', 'pork_katsu.jpg', 'lunch', 'Published', 'Japanese-style breaded pork cutlet');
INSERT INTO `recipe_info` VALUES (79, 'Pork Pho', 'pork_pho.jpg', 'dinner', 'Published', 'Vietnamese noodle soup with pork');
INSERT INTO `recipe_info` VALUES (80, 'Spicy Thai Basil Pork', 'thai_basil_pork.jpg', 'lunch', 'Published', 'Spicy stir-fried pork with Thai basil and chili');
INSERT INTO `recipe_info` VALUES (81, 'Vietnamese Pancake', 'banh_xeo.jpg', 'dinner', 'Published', 'Vietnamese crispy pancake with shrimp and pork');
INSERT INTO `recipe_info` VALUES (82, 'Broken Rice with Grilled Pork', 'com_tam.jpg', 'lunch', 'Published', 'Fragrant broken rice served with grilled pork chop');
INSERT INTO `recipe_info` VALUES (83, 'Spicy Beef Noodle Soup', 'bun_bo_hue.jpg', 'dinner', 'Published', 'Spicy beef noodle soup from Central Vietnam');
INSERT INTO `recipe_info` VALUES (84, 'Fresh Spring Rolls', 'goi_cuon.jpg', 'dinner', 'Published', 'Fresh spring rolls with shrimp and pork');
INSERT INTO `recipe_info` VALUES (85, 'Grilled Turmeric Fish', 'cha_ca.jpg', 'dinner', 'Published', 'Grilled turmeric fish with dill and noodles');
INSERT INTO `recipe_info` VALUES (86, 'Grilled Pork Vermicelli', 'bun_thit_nuong.jpg', 'lunch', 'Published', 'Vietnamese vermicelli served with grilled pork and vegetables');
INSERT INTO `recipe_info` VALUES (87, 'Grilled Banh Mi', 'grilled_banh_mi.jpg', 'lunch', 'Published', 'Vietnamese sandwich with grilled pork');
INSERT INTO `recipe_info` VALUES (88, 'Pork Offal Porridge', 'chao_long.jpg', 'dinner', 'Published', 'Rice porridge with pork offal and herbs');
INSERT INTO `recipe_info` VALUES (89, 'Sweet and Sour Fish Soup', 'canh_chua.jpg', 'dinner', 'Published', 'Vietnamese sweet and sour soup with fish');
INSERT INTO `recipe_info` VALUES (90, 'Crispy Spring Rolls', 'nem_ran.jpg', 'lunch', 'Published', 'Crispy fried spring rolls with pork filling');
INSERT INTO `recipe_info` VALUES (91, 'Vietnamese Grilled Pork Skewers', 'nem_nuong.jpg', 'lunch', 'Published', 'Grilled pork skewers served with fresh herbs and rice noodles');
INSERT INTO `recipe_info` VALUES (92, 'Beef Stew', 'bo_kho.jpg', 'dinner', 'Published', 'Vietnamese beef stew with lemongrass and spices');
INSERT INTO `recipe_info` VALUES (93, 'Hue-Style Pork Rolls', 'banh_cuon_hue.jpg', 'lunch', 'Published', 'Steamed rice rolls filled with pork and herbs');
INSERT INTO `recipe_info` VALUES (94, 'Vietnamese Fried Noodles', 'mi_xao.jpg', 'dinner', 'Published', 'Stir-fried noodles with pork, shrimp, and vegetables');
INSERT INTO `recipe_info` VALUES (95, 'Banana Blossom Salad', 'nom_hoa_chuoi.jpg', 'lunch', 'Published', 'Refreshing salad made with banana blossoms, herbs, and peanuts');
INSERT INTO `recipe_info` VALUES (96, 'Claypot Fish', 'ca_kho_to.jpg', 'dinner', 'Published', 'Caramelized fish simmered in clay pot with herbs and sauce');
INSERT INTO `recipe_info` VALUES (97, 'Prawn Paste on Sugarcane', 'chao_tom.jpg', 'breakfast', 'Published', 'Grilled shrimp paste wrapped around sugarcane sticks');
INSERT INTO `recipe_info` VALUES (98, 'Chicken Rice', 'com_ga.jpg', 'lunch', 'Published', 'Crispy chicken served with fragrant rice');
INSERT INTO `recipe_info` VALUES (99, 'Braised Pork with Eggs', 'thit_kho_trung.jpg', 'dinner', 'Published', 'Pork belly braised with eggs and caramelized sauce');
INSERT INTO `recipe_info` VALUES (100, 'Sticky Rice with Mango', 'xoi_xoai.jpg', 'dinner', 'Published', 'Sweet sticky rice served with ripe mango slices');
INSERT INTO `recipe_info` VALUES (101, 'Vietnamese Hot Pot', 'lau.jpg', 'dinner', 'Published', 'Vietnamese hot pot with various meats and vegetables');
INSERT INTO `recipe_info` VALUES (102, 'Sweet Potato Cake', 'banh_khoai_mi.jpg', 'breakfast', 'Published', 'Vietnamese cake made from sweet potato and coconut milk');
INSERT INTO `recipe_info` VALUES (103, 'Pork and Mushroom Soup', 'canh_nam_huong.jpg', 'dinner', 'Published', 'Clear soup with pork and mushrooms');
INSERT INTO `recipe_info` VALUES (104, 'Vietnamese Beef Salad', 'goi_bo.jpg', 'lunch', 'Published', 'Fresh and tangy salad with beef, herbs, and lime dressing');
INSERT INTO `recipe_info` VALUES (105, 'Sticky Rice with Peanuts', 'xoi_lac.jpg', 'breakfast', 'Published', 'Sticky rice topped with roasted peanuts and sesame seeds');
INSERT INTO `recipe_info` VALUES (106, 'Grilled Pork with Rice Paper', 'banh_trang_nuong.jpg', 'lunch', 'Published', 'Grilled rice paper with pork, egg, and herbs');
INSERT INTO `recipe_info` VALUES (107, 'Vietnamese Grilled Squid', 'muc_nuong.jpg', 'dinner', 'Published', 'Grilled squid with lemongrass and chili');
INSERT INTO `recipe_info` VALUES (108, 'Cabbage Rolls', 'cai_cuon.jpg', 'lunch', 'Published', 'Stuffed cabbage leaves with pork and vegetables');
INSERT INTO `recipe_info` VALUES (109, 'Steamed Fish with Ginger', 'ca_hap_gung.jpg', 'dinner', 'Published', 'Steamed fish with ginger and herbs');
INSERT INTO `recipe_info` VALUES (110, 'Vietnamese Meatball Soup', 'canh_cha.jpg', 'dinner', 'Published', 'Soup with meatballs, noodles, and herbs');

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
) ENGINE = InnoDB AUTO_INCREMENT = 123 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

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
INSERT INTO `recipe_ingredients` VALUES (81, 41, 'Chicken Breast', 300, 'g', 'chicken_breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (82, 41, 'Tomato Sauce', 200, 'ml', 'tomato_sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (83, 42, 'Chicken Thighs', 250, 'g', 'chicken_thighs.jpg');
INSERT INTO `recipe_ingredients` VALUES (84, 42, 'Waffle Mix', 150, 'g', 'waffle_mix.jpg');
INSERT INTO `recipe_ingredients` VALUES (85, 43, 'Grilled Chicken', 200, 'g', 'grilled_chicken.jpg');
INSERT INTO `recipe_ingredients` VALUES (86, 43, 'Tortilla', 1, 'piece', 'tortilla.jpg');
INSERT INTO `recipe_ingredients` VALUES (87, 44, 'Chicken Strips', 250, 'g', 'chicken_strips.jpg');
INSERT INTO `recipe_ingredients` VALUES (88, 44, 'Bell Peppers', 2, 'piece', 'bell_peppers.jpg');
INSERT INTO `recipe_ingredients` VALUES (89, 45, 'Chicken Breast', 150, 'g', 'chicken_breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (90, 45, 'Protein Powder', 30, 'g', 'protein_powder.jpg');
INSERT INTO `recipe_ingredients` VALUES (91, 46, 'Chicken Breast', 200, 'g', 'chicken_breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (92, 46, 'Buffalo Sauce', 50, 'ml', 'buffalo_sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (93, 47, 'Chicken Thighs', 300, 'g', 'chicken_thighs.jpg');
INSERT INTO `recipe_ingredients` VALUES (94, 47, 'Teriyaki Sauce', 100, 'ml', 'teriyaki_sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (95, 48, 'Chicken', 150, 'g', 'chicken.jpg');
INSERT INTO `recipe_ingredients` VALUES (96, 48, 'Eggs', 4, 'piece', 'eggs.jpg');
INSERT INTO `recipe_ingredients` VALUES (97, 49, 'Chicken Breast', 250, 'g', 'chicken_breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (98, 49, 'Pesto Sauce', 75, 'ml', 'pesto_sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (99, 50, 'Chicken Thighs', 300, 'g', 'chicken_thighs.jpg');
INSERT INTO `recipe_ingredients` VALUES (100, 50, 'Coconut Milk', 200, 'ml', 'coconut_milk.jpg');
INSERT INTO `recipe_ingredients` VALUES (101, 51, 'Chicken Thighs', 300, 'g', 'chicken_thighs.jpg');
INSERT INTO `recipe_ingredients` VALUES (102, 51, 'Gochujang Sauce', 50, 'ml', 'gochujang_sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (103, 52, 'Chicken Breast', 200, 'g', 'chicken_breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (104, 52, 'Tortilla', 2, 'piece', 'tortilla.jpg');
INSERT INTO `recipe_ingredients` VALUES (105, 53, 'Grilled Chicken', 250, 'g', 'grilled_chicken.jpg');
INSERT INTO `recipe_ingredients` VALUES (106, 53, 'Mixed Salad Greens', 100, 'g', 'salad_greens.jpg');
INSERT INTO `recipe_ingredients` VALUES (107, 54, 'Chicken', 300, 'g', 'chicken.jpg');
INSERT INTO `recipe_ingredients` VALUES (108, 54, 'Tortilla', 2, 'piece', 'tortilla.jpg');
INSERT INTO `recipe_ingredients` VALUES (109, 55, 'Chicken Breast', 150, 'g', 'chicken_breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (110, 55, 'Protein Powder', 30, 'g', 'protein_powder.jpg');
INSERT INTO `recipe_ingredients` VALUES (111, 56, 'Chicken Breast', 250, 'g', 'chicken_breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (112, 56, 'BBQ Sauce', 100, 'ml', 'bbq_sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (113, 57, 'Chicken Breast', 300, 'g', 'chicken_breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (114, 57, 'Cashews', 100, 'g', 'cashews.jpg');
INSERT INTO `recipe_ingredients` VALUES (115, 58, 'Chicken', 200, 'g', 'chicken.jpg');
INSERT INTO `recipe_ingredients` VALUES (116, 58, 'Eggs', 4, 'piece', 'eggs.jpg');
INSERT INTO `recipe_ingredients` VALUES (117, 59, 'Chicken Breast', 250, 'g', 'chicken_breast.jpg');
INSERT INTO `recipe_ingredients` VALUES (118, 59, 'Pita Bread', 2, 'piece', 'pita_bread.jpg');
INSERT INTO `recipe_ingredients` VALUES (119, 60, 'Chicken Thighs', 400, 'g', 'chicken_thighs.jpg');
INSERT INTO `recipe_ingredients` VALUES (120, 60, 'Moroccan Spice Mix', 30, 'g', 'moroccan_spices.jpg');
INSERT INTO `recipe_ingredients` VALUES (121, 61, 'Pork Belly', 300, 'g', 'pork_belly.jpg');
INSERT INTO `recipe_ingredients` VALUES (122, 62, 'Pork Sausage', 200, 'g', 'pork_sausage.jpg');
INSERT INTO `recipe_ingredients` VALUES (123, 63, 'Grilled Pork', 250, 'g', 'grilled_pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (124, 63, 'Mixed Salad Greens', 100, 'g', 'salad_greens.jpg');
INSERT INTO `recipe_ingredients` VALUES (125, 64, 'Pork', 300, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (126, 64, 'Tortilla', 2, 'piece', 'tortilla.jpg');
INSERT INTO `recipe_ingredients` VALUES (127, 65, 'Pork Belly', 150, 'g', 'pork_belly.jpg');
INSERT INTO `recipe_ingredients` VALUES (128, 65, 'Protein Powder', 30, 'g', 'protein_powder.jpg');
INSERT INTO `recipe_ingredients` VALUES (129, 66, 'Pulled Pork', 250, 'g', 'pulled_pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (130, 66, 'BBQ Sauce', 100, 'ml', 'bbq_sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (131, 67, 'Pork Tenderloin', 300, 'g', 'pork_tenderloin.jpg');
INSERT INTO `recipe_ingredients` VALUES (132, 67, 'Honey', 50, 'ml', 'honey.jpg');
INSERT INTO `recipe_ingredients` VALUES (133, 68, 'Pork', 200, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (134, 68, 'Eggs', 4, 'piece', 'eggs.jpg');
INSERT INTO `recipe_ingredients` VALUES (135, 69, 'Pork Belly', 250, 'g', 'pork_belly.jpg');
INSERT INTO `recipe_ingredients` VALUES (136, 69, 'Pita Bread', 2, 'piece', 'pita_bread.jpg');
INSERT INTO `recipe_ingredients` VALUES (137, 70, 'Pork Belly', 400, 'g', 'pork_belly.jpg');
INSERT INTO `recipe_ingredients` VALUES (138, 70, 'Caramel Sauce', 30, 'g', 'caramel_sauce.jpg');
INSERT INTO `recipe_ingredients` VALUES (139, 71, 'Pork Belly', 200, 'g', 'pork_belly.jpg');
INSERT INTO `recipe_ingredients` VALUES (140, 71, 'Ramen Noodles', 150, 'g', 'ramen_noodles.jpg');
INSERT INTO `recipe_ingredients` VALUES (141, 72, 'Pork', 150, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (142, 72, 'Cooked Rice', 250, 'g', 'cooked_rice.jpg');
INSERT INTO `recipe_ingredients` VALUES (143, 73, 'Boiled Pork', 100, 'g', 'boiled_pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (144, 73, 'Rice Paper', 10, 'piece', 'rice_paper.jpg');
INSERT INTO `recipe_ingredients` VALUES (145, 74, 'Minced Pork', 200, 'g', 'minced_pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (146, 74, 'Eggplant', 150, 'g', 'eggplant.jpg');
INSERT INTO `recipe_ingredients` VALUES (147, 75, 'Pork Belly', 300, 'g', 'pork_belly.jpg');
INSERT INTO `recipe_ingredients` VALUES (148, 75, 'Salt', 10, 'g', 'salt.jpg');
INSERT INTO `recipe_ingredients` VALUES (149, 76, 'Ground Pork', 250, 'g', 'ground_pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (150, 76, 'Dumpling Wrappers', 20, 'piece', 'dumpling_wrappers.jpg');
INSERT INTO `recipe_ingredients` VALUES (151, 77, 'Pork Tenderloin', 250, 'g', 'pork_tenderloin.jpg');
INSERT INTO `recipe_ingredients` VALUES (152, 77, 'Pineapple', 100, 'g', 'pineapple.jpg');
INSERT INTO `recipe_ingredients` VALUES (153, 78, 'Pork Cutlet', 200, 'g', 'pork_cutlet.jpg');
INSERT INTO `recipe_ingredients` VALUES (154, 78, 'Breadcrumbs', 100, 'g', 'breadcrumbs.jpg');
INSERT INTO `recipe_ingredients` VALUES (155, 79, 'Pork Bones', 300, 'g', 'pork_bones.jpg');
INSERT INTO `recipe_ingredients` VALUES (156, 79, 'Rice Noodles', 200, 'g', 'rice_noodles.jpg');
INSERT INTO `recipe_ingredients` VALUES (157, 80, 'Minced Pork', 200, 'g', 'minced_pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (158, 80, 'Thai Basil', 50, 'g', 'thai_basil.jpg');
INSERT INTO `recipe_ingredients` VALUES (159, 81, 'Rice Flour', 200, 'g', 'rice_flour.jpg');
INSERT INTO `recipe_ingredients` VALUES (160, 81, 'Shrimp', 100, 'g', 'shrimp.jpg');
INSERT INTO `recipe_ingredients` VALUES (161, 82, 'Broken Rice', 250, 'g', 'broken_rice.jpg');
INSERT INTO `recipe_ingredients` VALUES (162, 82, 'Pork Chop', 200, 'g', 'pork_chop.jpg');
INSERT INTO `recipe_ingredients` VALUES (163, 83, 'Beef Shank', 300, 'g', 'beef_shank.jpg');
INSERT INTO `recipe_ingredients` VALUES (164, 83, 'Rice Noodles', 200, 'g', 'rice_noodles.jpg');
INSERT INTO `recipe_ingredients` VALUES (165, 84, 'Rice Paper', 10, 'piece', 'rice_paper.jpg');
INSERT INTO `recipe_ingredients` VALUES (166, 84, 'Shrimp', 100, 'g', 'shrimp.jpg');
INSERT INTO `recipe_ingredients` VALUES (167, 85, 'Catfish', 200, 'g', 'catfish.jpg');
INSERT INTO `recipe_ingredients` VALUES (168, 85, 'Turmeric', 10, 'g', 'turmeric.jpg');
INSERT INTO `recipe_ingredients` VALUES (169, 86, 'Vermicelli', 200, 'g', 'vermicelli.jpg');
INSERT INTO `recipe_ingredients` VALUES (170, 86, 'Grilled Pork', 150, 'g', 'grilled_pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (171, 87, 'Baguette', 1, 'piece', 'baguette.jpg');
INSERT INTO `recipe_ingredients` VALUES (172, 87, 'Grilled Pork', 150, 'g', 'grilled_pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (173, 88, 'Rice', 250, 'g', 'rice.jpg');
INSERT INTO `recipe_ingredients` VALUES (174, 88, 'Pork Liver', 100, 'g', 'pork_liver.jpg');
INSERT INTO `recipe_ingredients` VALUES (175, 89, 'Fish', 200, 'g', 'fish.jpg');
INSERT INTO `recipe_ingredients` VALUES (176, 89, 'Tamarind', 50, 'g', 'tamarind.jpg');
INSERT INTO `recipe_ingredients` VALUES (177, 90, 'Pork', 200, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (178, 90, 'Spring Roll Wrappers', 20, 'piece', 'spring_roll_wrappers.jpg');
INSERT INTO `recipe_ingredients` VALUES (179, 91, 'Pork', 200, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (180, 91, 'Rice Noodles', 150, 'g', 'rice_noodles.jpg');
INSERT INTO `recipe_ingredients` VALUES (181, 92, 'Beef', 300, 'g', 'beef.jpg');
INSERT INTO `recipe_ingredients` VALUES (182, 92, 'Carrot', 100, 'g', 'carrot.jpg');
INSERT INTO `recipe_ingredients` VALUES (183, 93, 'Rice Paper', 20, 'piece', 'rice_paper.jpg');
INSERT INTO `recipe_ingredients` VALUES (184, 93, 'Pork', 200, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (185, 94, 'Egg Noodles', 200, 'g', 'egg_noodles.jpg');
INSERT INTO `recipe_ingredients` VALUES (186, 94, 'Shrimp', 100, 'g', 'shrimp.jpg');
INSERT INTO `recipe_ingredients` VALUES (187, 95, 'Banana Blossom', 100, 'g', 'banana_blossom.jpg');
INSERT INTO `recipe_ingredients` VALUES (188, 95, 'Peanuts', 50, 'g', 'peanuts.jpg');
INSERT INTO `recipe_ingredients` VALUES (189, 96, 'Fish', 200, 'g', 'fish.jpg');
INSERT INTO `recipe_ingredients` VALUES (190, 96, 'Herbs', 50, 'g', 'herbs.jpg');
INSERT INTO `recipe_ingredients` VALUES (191, 97, 'Shrimp Paste', 100, 'g', 'shrimp_paste.jpg');
INSERT INTO `recipe_ingredients` VALUES (192, 97, 'Sugarcane', 2, 'stick', 'sugarcane.jpg');
INSERT INTO `recipe_ingredients` VALUES (193, 98, 'Chicken', 300, 'g', 'chicken.jpg');
INSERT INTO `recipe_ingredients` VALUES (194, 98, 'Rice', 250, 'g', 'rice.jpg');
INSERT INTO `recipe_ingredients` VALUES (195, 99, 'Pork Belly', 250, 'g', 'pork_belly.jpg');
INSERT INTO `recipe_ingredients` VALUES (196, 99, 'Egg', 3, 'piece', 'egg.jpg');
INSERT INTO `recipe_ingredients` VALUES (197, 100, 'Mango', 1, 'piece', 'mango.jpg');
INSERT INTO `recipe_ingredients` VALUES (198, 101, 'Pork', 250, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (199, 101, 'Beef', 300, 'g', 'beef.jpg');
INSERT INTO `recipe_ingredients` VALUES (200, 102, 'Sweet Potato', 200, 'g', 'sweet_potato.jpg');
INSERT INTO `recipe_ingredients` VALUES (201, 102, 'Coconut Milk', 100, 'ml', 'coconut_milk.jpg');
INSERT INTO `recipe_ingredients` VALUES (202, 103, 'Pork', 200, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (203, 103, 'Mushrooms', 150, 'g', 'mushrooms.jpg');
INSERT INTO `recipe_ingredients` VALUES (204, 104, 'Beef', 200, 'g', 'beef.jpg');
INSERT INTO `recipe_ingredients` VALUES (205, 104, 'Lime', 2, 'piece', 'lime.jpg');
INSERT INTO `recipe_ingredients` VALUES (206, 105, 'Sticky Rice', 250, 'g', 'sticky_rice.jpg');
INSERT INTO `recipe_ingredients` VALUES (207, 105, 'Peanuts', 100, 'g', 'peanuts.jpg');
INSERT INTO `recipe_ingredients` VALUES (208, 106, 'Rice Paper', 10, 'piece', 'rice_paper.jpg');
INSERT INTO `recipe_ingredients` VALUES (209, 106, 'Pork', 100, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (210, 107, 'Squid', 300, 'g', 'squid.jpg');
INSERT INTO `recipe_ingredients` VALUES (211, 107, 'Lemongrass', 2, 'stalk', 'lemongrass.jpg');
INSERT INTO `recipe_ingredients` VALUES (212, 108, 'Cabbage', 1, 'head', 'cabbage.jpg');
INSERT INTO `recipe_ingredients` VALUES (213, 108, 'Pork', 150, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (214, 109, 'Fish', 250, 'g', 'fish.jpg');
INSERT INTO `recipe_ingredients` VALUES (215, 109, 'Ginger', 50, 'g', 'ginger.jpg');
INSERT INTO `recipe_ingredients` VALUES (216, 110, 'Pork', 200, 'g', 'pork.jpg');
INSERT INTO `recipe_ingredients` VALUES (217, 110, 'Noodles', 100, 'g', 'noodles.jpg');

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
) ENGINE = InnoDB AUTO_INCREMENT = 63 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

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
INSERT INTO `recipe_nutrition` VALUES (41, 41, 420, 22.5, NULL, 25.3, 6.3, 120, 520, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (42, 42, 580, 35.4, NULL, 45.2, 10.2, 150, 450, 30.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (43, 43, 650, 15.3, NULL, 25.6, 3.4, 90, 380, 28.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (44, 44, 400, 20.5, NULL, 20.3, 4.5, 100, 450, 35.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (45, 45, 450, 8.5, NULL, 20.4, 5.6, 75, 200, 40.2, NULL);
INSERT INTO `recipe_nutrition` VALUES (46, 46, 480, 22.3, NULL, 15.6, 3.2, 85, 580, 30.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (47, 47, 520, 25.4, NULL, 35.7, 7.3, 110, 520, 28.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (48, 48, 420, 18.7, NULL, 10.5, 2.5, 250, 350, 35.2, NULL);
INSERT INTO `recipe_nutrition` VALUES (49, 49, 480, 20.6, NULL, 25.3, 4.2, 95, 420, 30.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (50, 50, 550, 30.5, NULL, 20.4, 5.6, 130, 480, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (51, 51, 480, 22.5, NULL, 20.3, 6.3, 120, 520, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (52, 52, 520, 25.4, NULL, 30.5, 4.5, 90, 450, 30.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (53, 53, 420, 15.3, NULL, 10.2, 3.4, 95, 380, 35.2, NULL);
INSERT INTO `recipe_nutrition` VALUES (54, 54, 550, 28.6, NULL, 35.7, 5.6, 130, 550, 28.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (55, 55, 400, 12.5, NULL, 25.3, 3.2, 75, 250, 40.2, NULL);
INSERT INTO `recipe_nutrition` VALUES (56, 56, 480, 20.5, NULL, 25.6, 7.3, 110, 580, 35.4, NULL);
INSERT INTO `recipe_nutrition` VALUES (57, 57, 500, 22.3, NULL, 20.4, 4.2, 100, 450, 30.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (58, 58, 450, 18.7, NULL, 15.3, 3.5, 250, 420, 35.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (59, 59, 440, 15.6, NULL, 25.7, 3.8, 85, 400, 30.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (60, 60, 520, 30.5, NULL, 20.3, 5.6, 140, 480, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (61, 61, 550, 28.5, NULL, 20.3, 35.7, 140, 480, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (62, 62, 580, 28.5, 0, 20.3, 35.7, 140, 480, 35.7, 0);
INSERT INTO `recipe_nutrition` VALUES (63, 63, 570, 18.3, NULL, 12.2, 4.4, 100, 400, 38.2, NULL);
INSERT INTO `recipe_nutrition` VALUES (64, 64, 560, 30.6, NULL, 35.7, 7.5, 135, 570, 30.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (65, 65, 510, 15.5, NULL, 25.3, 4.3, 80, 270, 40.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (66, 66, 510, 22.8, NULL, 28.6, 9.3, 115, 590, 37.4, NULL);
INSERT INTO `recipe_nutrition` VALUES (67, 67, 520, 24.3, NULL, 18.4, 6.2, 105, 470, 32.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (68, 68, 560, 20.7, NULL, 15.7, 5, 260, 430, 37.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (69, 69, 550, 16.7, NULL, 28.7, 4.6, 90, 420, 32, NULL);
INSERT INTO `recipe_nutrition` VALUES (70, 70, 540, 32.8, NULL, 18.3, 9.6, 150, 490, 36.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (71, 71, 650, 25.5, NULL, 50.3, 8.5, 120, 650, 35.7, NULL);
INSERT INTO `recipe_nutrition` VALUES (72, 72, 550, 15.4, NULL, 55.5, 3.8, 85, 480, 22.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (73, 73, 580, 12.3, NULL, 30.4, 2.3, 55, 320, 15.6, NULL);
INSERT INTO `recipe_nutrition` VALUES (74, 74, 520, 18.7, NULL, 20.3, 4, 90, 370, 25.5, NULL);
INSERT INTO `recipe_nutrition` VALUES (75, 75, 580, 42.5, NULL, 10.3, 3.6, 160, 450, 30, NULL);
INSERT INTO `recipe_nutrition` VALUES (76, 76, 420, 20, NULL, 35, 5, 80, 400, 28, NULL);
INSERT INTO `recipe_nutrition` VALUES (77, 77, 590, 15, NULL, 30, 6, 110, 450, 35, NULL);
INSERT INTO `recipe_nutrition` VALUES (78, 78, 450, 22.5, NULL, 40, 3.5, 90, 360, 25, NULL);
INSERT INTO `recipe_nutrition` VALUES (79, 79, 500, 10.5, NULL, 45, 2.5, 60, 280, 20, NULL);
INSERT INTO `recipe_nutrition` VALUES (80, 80, 480, 12.5, NULL, 15, 4.5, 85, 300, 35, NULL);
INSERT INTO `recipe_nutrition` VALUES (81, 81, 450, 12, NULL, 55, 3, 80, 300, 20, NULL);
INSERT INTO `recipe_nutrition` VALUES (82, 82, 600, 25, NULL, 45, 4, 100, 550, 35, NULL);
INSERT INTO `recipe_nutrition` VALUES (83, 83, 700, 18, NULL, 60, 5, 110, 700, 40, NULL);
INSERT INTO `recipe_nutrition` VALUES (84, 84, 500, 5, NULL, 40, 2, 70, 250, 15, NULL);
INSERT INTO `recipe_nutrition` VALUES (85, 85, 480, 10, NULL, 30, 1.5, 90, 400, 25, NULL);
INSERT INTO `recipe_nutrition` VALUES (86, 86, 450, 15, NULL, 50, 3, 85, 400, 25, NULL);
INSERT INTO `recipe_nutrition` VALUES (87, 87, 500, 20, NULL, 40, 3, 85, 500, 25, NULL);
INSERT INTO `recipe_nutrition` VALUES (88, 88, 400, 12, NULL, 55, 2.5, 50, 350, 15, NULL);
INSERT INTO `recipe_nutrition` VALUES (89, 89, 550, 5, NULL, 30, 2, 80, 250, 25, NULL);
INSERT INTO `recipe_nutrition` VALUES (90, 90, 420, 15, NULL, 35, 2, 85, 300, 20, NULL);
INSERT INTO `recipe_nutrition` VALUES (91, 91, 550, 20, NULL, 40, 4, 100, 450, 30, NULL);
INSERT INTO `recipe_nutrition` VALUES (92, 92, 700, 25, NULL, 40, 5, 110, 600, 50, NULL);
INSERT INTO `recipe_nutrition` VALUES (93, 93, 400, 10, NULL, 60, 6, 80, 350, 20, NULL);
INSERT INTO `recipe_nutrition` VALUES (94, 94, 600, 15, NULL, 50, 7, 90, 500, 25, NULL);
INSERT INTO `recipe_nutrition` VALUES (95, 95, 450, 15, NULL, 40, 8, 60, 300, 10, NULL);
INSERT INTO `recipe_nutrition` VALUES (96, 96, 500, 10, NULL, 35, 2, 75, 400, 40, NULL);
INSERT INTO `recipe_nutrition` VALUES (97, 97, 450, 20, NULL, 30, 6, 80, 350, 30, NULL);
INSERT INTO `recipe_nutrition` VALUES (98, 98, 650, 25, NULL, 50, 3, 95, 500, 35, NULL);
INSERT INTO `recipe_nutrition` VALUES (99, 99, 700, 30, NULL, 40, 4, 120, 550, 50, NULL);
INSERT INTO `recipe_nutrition` VALUES (100, 100, 500, 5, NULL, 70, 20, 40, 250, 5, NULL);
INSERT INTO `recipe_nutrition` VALUES (101, 101, 600, 25, NULL, 40, 5, 110, 550, 35, NULL);
INSERT INTO `recipe_nutrition` VALUES (102, 102, 450, 15, NULL, 50, 30, 50, 100, 5, NULL);
INSERT INTO `recipe_nutrition` VALUES (103, 103, 400, 10, NULL, 45, 3, 80, 300, 25, NULL);
INSERT INTO `recipe_nutrition` VALUES (104, 104, 450, 20, NULL, 30, 5, 90, 400, 30, NULL);
INSERT INTO `recipe_nutrition` VALUES (105, 105, 450, 5, NULL, 65, 12, 30, 150, 8, NULL);
INSERT INTO `recipe_nutrition` VALUES (106, 106, 500, 15, NULL, 40, 4, 70, 400, 25, NULL);
INSERT INTO `recipe_nutrition` VALUES (107, 107, 550, 20, NULL, 35, 3, 85, 350, 30, NULL);
INSERT INTO `recipe_nutrition` VALUES (108, 108, 400, 10, NULL, 30, 2, 60, 250, 15, NULL);
INSERT INTO `recipe_nutrition` VALUES (109, 109, 500, 8, NULL, 40, 2, 75, 200, 25, NULL);
INSERT INTO `recipe_nutrition` VALUES (110, 110, 500, 18, NULL, 45, 5, 80, 350, 30, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 123 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

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
INSERT INTO `recipe_steps` VALUES (81, 41, 1, 'Marinate chicken in tikka masala spices');
INSERT INTO `recipe_steps` VALUES (82, 41, 2, 'Cook in creamy tomato sauce');
INSERT INTO `recipe_steps` VALUES (83, 42, 1, 'Fry chicken until crispy');
INSERT INTO `recipe_steps` VALUES (84, 42, 2, 'Prepare waffles and serve together');
INSERT INTO `recipe_steps` VALUES (85, 43, 1, 'Grill chicken with Caesar seasoning');
INSERT INTO `recipe_steps` VALUES (86, 43, 2, 'Wrap in tortilla with Caesar dressing');
INSERT INTO `recipe_steps` VALUES (87, 44, 1, 'Slice chicken and vegetables');
INSERT INTO `recipe_steps` VALUES (88, 44, 2, 'Sauté and serve sizzling');
INSERT INTO `recipe_steps` VALUES (89, 45, 1, 'Grill chicken breast');
INSERT INTO `recipe_steps` VALUES (90, 45, 2, 'Blend with protein powder and fruits');
INSERT INTO `recipe_steps` VALUES (91, 46, 1, 'Coat chicken in buffalo sauce');
INSERT INTO `recipe_steps` VALUES (92, 46, 2, 'Grill and serve on roll');
INSERT INTO `recipe_steps` VALUES (93, 47, 1, 'Marinate chicken in teriyaki sauce');
INSERT INTO `recipe_steps` VALUES (94, 47, 2, 'Grill and serve over rice');
INSERT INTO `recipe_steps` VALUES (95, 48, 1, 'Cook chicken and chop');
INSERT INTO `recipe_steps` VALUES (96, 48, 2, 'Mix with eggs and bake frittata');
INSERT INTO `recipe_steps` VALUES (97, 49, 1, 'Grill chicken breast');
INSERT INTO `recipe_steps` VALUES (98, 49, 2, 'Toss with pesto pasta');
INSERT INTO `recipe_steps` VALUES (99, 50, 1, 'Prepare coconut curry sauce');
INSERT INTO `recipe_steps` VALUES (100, 50, 2, 'Simmer chicken in sauce');
INSERT INTO `recipe_steps` VALUES (101, 51, 1, 'Marinate chicken in gochujang sauce');
INSERT INTO `recipe_steps` VALUES (102, 51, 2, 'Grill or bake until crispy');
INSERT INTO `recipe_steps` VALUES (103, 52, 1, 'Scramble chicken with eggs');
INSERT INTO `recipe_steps` VALUES (104, 52, 2, 'Fill and grill quesadilla');
INSERT INTO `recipe_steps` VALUES (105, 53, 1, 'Grill chicken and slice');
INSERT INTO `recipe_steps` VALUES (106, 53, 2, 'Prepare Mediterranean salad');
INSERT INTO `recipe_steps` VALUES (107, 54, 1, 'Prepare chicken filling');
INSERT INTO `recipe_steps` VALUES (108, 54, 2, 'Deep fry chimichanga');
INSERT INTO `recipe_steps` VALUES (109, 55, 1, 'Shred chicken');
INSERT INTO `recipe_steps` VALUES (110, 55, 2, 'Mix into pancake batter');
INSERT INTO `recipe_steps` VALUES (111, 56, 1, 'Slow cook chicken in BBQ sauce');
INSERT INTO `recipe_steps` VALUES (112, 56, 2, 'Shred and serve on sandwich');
INSERT INTO `recipe_steps` VALUES (113, 57, 1, 'Stir fry chicken');
INSERT INTO `recipe_steps` VALUES (114, 57, 2, 'Add cashews and sauce');
INSERT INTO `recipe_steps` VALUES (115, 58, 1, 'Prepare spicy tomato base');
INSERT INTO `recipe_steps` VALUES (116, 58, 2, 'Add chicken and poach eggs');
INSERT INTO `recipe_steps` VALUES (117, 59, 1, 'Grill and slice chicken');
INSERT INTO `recipe_steps` VALUES (118, 59, 2, 'Assemble in pita with tzatziki');
INSERT INTO `recipe_steps` VALUES (119, 60, 1, 'Marinate chicken in Moroccan spices');
INSERT INTO `recipe_steps` VALUES (120, 60, 2, 'Slow cook until tender');
INSERT INTO `recipe_steps` VALUES (121, 61, 1, 'Cook');
INSERT INTO `recipe_steps` VALUES (122, 62, 1, 'cuck');
INSERT INTO `recipe_steps` VALUES (123, 63, 1, 'Grill pork and slice');
INSERT INTO `recipe_steps` VALUES (124, 63, 2, 'Prepare Mediterranean salad');
INSERT INTO `recipe_steps` VALUES (125, 64, 1, 'Prepare pork filling');
INSERT INTO `recipe_steps` VALUES (126, 64, 2, 'Deep fry chimichanga');
INSERT INTO `recipe_steps` VALUES (127, 65, 1, 'Shred pork');
INSERT INTO `recipe_steps` VALUES (128, 65, 2, 'Mix into pancake batter');
INSERT INTO `recipe_steps` VALUES (129, 66, 1, 'Slow cook pork in BBQ sauce');
INSERT INTO `recipe_steps` VALUES (130, 66, 2, 'Shred and serve on sandwich');
INSERT INTO `recipe_steps` VALUES (131, 67, 1, 'Stir fry pork with honey and garlic');
INSERT INTO `recipe_steps` VALUES (132, 67, 2, 'Serve over rice');
INSERT INTO `recipe_steps` VALUES (133, 68, 1, 'Prepare tomato base with spices');
INSERT INTO `recipe_steps` VALUES (134, 68, 2, 'Add pork and poach eggs');
INSERT INTO `recipe_steps` VALUES (135, 69, 1, 'Grill and slice pork');
INSERT INTO `recipe_steps` VALUES (136, 69, 2, 'Assemble in pita with tzatziki');
INSERT INTO `recipe_steps` VALUES (137, 70, 1, 'Caramelize pork with sauce');
INSERT INTO `recipe_steps` VALUES (138, 70, 2, 'Serve over steamed rice');
INSERT INTO `recipe_steps` VALUES (139, 71, 1, 'Prepare pork belly and chashu');
INSERT INTO `recipe_steps` VALUES (140, 71, 2, 'Assemble ramen with broth and toppings');
INSERT INTO `recipe_steps` VALUES (141, 72, 1, 'Stir fry pork with rice and vegetables');
INSERT INTO `recipe_steps` VALUES (142, 72, 2, 'Season and serve hot');
INSERT INTO `recipe_steps` VALUES (143, 73, 1, 'Boil pork and slice');
INSERT INTO `recipe_steps` VALUES (144, 73, 2, 'Assemble spring rolls with rice paper');
INSERT INTO `recipe_steps` VALUES (145, 74, 1, 'Stir fry minced pork and eggplant');
INSERT INTO `recipe_steps` VALUES (146, 74, 2, 'Add sauce and serve with rice');
INSERT INTO `recipe_steps` VALUES (147, 75, 1, 'Season and bake pork belly until crispy');
INSERT INTO `recipe_steps` VALUES (148, 75, 2, 'Slice and serve with dipping sauce');
INSERT INTO `recipe_steps` VALUES (149, 76, 1, 'Fill dumpling wrappers with pork filling');
INSERT INTO `recipe_steps` VALUES (150, 76, 2, 'Steam or fry until cooked');
INSERT INTO `recipe_steps` VALUES (151, 77, 1, 'Stir fry pork with sweet and sour sauce');
INSERT INTO `recipe_steps` VALUES (152, 77, 2, 'Serve with rice');
INSERT INTO `recipe_steps` VALUES (153, 78, 1, 'Bread pork cutlet and fry');
INSERT INTO `recipe_steps` VALUES (154, 78, 2, 'Serve with shredded cabbage and tonkatsu sauce');
INSERT INTO `recipe_steps` VALUES (155, 79, 1, 'Prepare broth using pork bones');
INSERT INTO `recipe_steps` VALUES (156, 79, 2, 'Assemble pho with rice noodles and toppings');
INSERT INTO `recipe_steps` VALUES (157, 80, 1, 'Stir fry minced pork with chili and basil');
INSERT INTO `recipe_steps` VALUES (158, 80, 2, 'Serve with steamed rice');
INSERT INTO `recipe_steps` VALUES (159, 81, 1, 'Mix rice flour with water to form batter');
INSERT INTO `recipe_steps` VALUES (160, 81, 2, 'Fry batter with shrimp and pork filling');
INSERT INTO `recipe_steps` VALUES (161, 82, 1, 'Grill pork chop until cooked');
INSERT INTO `recipe_steps` VALUES (162, 82, 2, 'Serve with broken rice and fish sauce');
INSERT INTO `recipe_steps` VALUES (163, 83, 1, 'Prepare broth with beef bones and spices');
INSERT INTO `recipe_steps` VALUES (164, 83, 2, 'Assemble noodles and toppings in a bowl');
INSERT INTO `recipe_steps` VALUES (165, 84, 1, 'Boil shrimp and pork, slice thinly');
INSERT INTO `recipe_steps` VALUES (166, 84, 2, 'Wrap with rice paper and serve with dipping sauce');
INSERT INTO `recipe_steps` VALUES (167, 85, 1, 'Marinate fish with turmeric and spices');
INSERT INTO `recipe_steps` VALUES (168, 85, 2, 'Grill fish and serve with noodles');
INSERT INTO `recipe_steps` VALUES (169, 86, 1, 'Grill the pork and wash the vegetables');
INSERT INTO `recipe_steps` VALUES (170, 86, 2, 'Arrange ingredients in bowl and serve with sauce.');
INSERT INTO `recipe_steps` VALUES (171, 87, 1, 'Grill pork and prepare baguette');
INSERT INTO `recipe_steps` VALUES (172, 87, 2, 'Assemble sandwich with vegetables and sauce');
INSERT INTO `recipe_steps` VALUES (173, 88, 1, 'Cook rice porridge with pork offal');
INSERT INTO `recipe_steps` VALUES (174, 88, 2, 'Season with herbs and serve hot');
INSERT INTO `recipe_steps` VALUES (175, 89, 1, 'Cook fish in tamarind-based broth');
INSERT INTO `recipe_steps` VALUES (176, 89, 2, 'Add vegetables and season to taste');
INSERT INTO `recipe_steps` VALUES (177, 90, 1, 'Prepare pork filling for spring rolls');
INSERT INTO `recipe_steps` VALUES (178, 90, 2, 'Wrap and fry spring rolls until crispy');
INSERT INTO `recipe_steps` VALUES (179, 91, 1, 'Grill pork skewers over medium heat');
INSERT INTO `recipe_steps` VALUES (180, 91, 2, 'Serve with rice noodles, herbs, and dipping sauce');
INSERT INTO `recipe_steps` VALUES (181, 92, 1, 'Simmer beef with spices and vegetables');
INSERT INTO `recipe_steps` VALUES (182, 92, 2, 'Serve with crusty bread or rice');
INSERT INTO `recipe_steps` VALUES (183, 93, 1, 'Prepare pork and herbs for filling');
INSERT INTO `recipe_steps` VALUES (184, 93, 2, 'Roll with rice paper and serve with sauce');
INSERT INTO `recipe_steps` VALUES (185, 94, 1, 'Stir-fry noodles with shrimp and vegetables');
INSERT INTO `recipe_steps` VALUES (186, 94, 2, 'Serve hot with soy sauce or fish sauce');
INSERT INTO `recipe_steps` VALUES (187, 95, 1, 'Slice banana blossom and toss with peanuts');
INSERT INTO `recipe_steps` VALUES (188, 95, 2, 'Dress with fish sauce and chili, serve fresh');
INSERT INTO `recipe_steps` VALUES (189, 96, 1, 'Caramelize fish in clay pot with sauce');
INSERT INTO `recipe_steps` VALUES (190, 96, 2, 'Simmer with herbs and serve hot');
INSERT INTO `recipe_steps` VALUES (191, 97, 1, 'Wrap shrimp paste around sugarcane');
INSERT INTO `recipe_steps` VALUES (192, 97, 2, 'Grill and serve with fresh vegetables');
INSERT INTO `recipe_steps` VALUES (193, 98, 1, 'Cook chicken and prepare rice');
INSERT INTO `recipe_steps` VALUES (194, 98, 2, 'Serve chicken with fragrant rice');
INSERT INTO `recipe_steps` VALUES (195, 99, 1, 'Braised pork belly with eggs in sauce');
INSERT INTO `recipe_steps` VALUES (196, 99, 2, 'Serve with rice or pickles');
INSERT INTO `recipe_steps` VALUES (197, 100, 1, 'Prepare sticky rice and peel mango');
INSERT INTO `recipe_steps` VALUES (198, 100, 2, 'Serve mango slices with sticky rice');
INSERT INTO `recipe_steps` VALUES (199, 101, 1, 'Prepare the hot pot base with broth and spices');
INSERT INTO `recipe_steps` VALUES (200, 101, 2, 'Add various meats and vegetables to the pot');
INSERT INTO `recipe_steps` VALUES (201, 102, 1, 'Boil sweet potatoes and mash them');
INSERT INTO `recipe_steps` VALUES (202, 102, 2, 'Mix with coconut milk and steam the mixture');
INSERT INTO `recipe_steps` VALUES (203, 103, 1, 'Simmer pork and mushrooms to create the broth');
INSERT INTO `recipe_steps` VALUES (204, 103, 2, 'Serve the soup with fresh herbs');
INSERT INTO `recipe_steps` VALUES (205, 104, 1, 'Prepare beef and herbs for the salad');
INSERT INTO `recipe_steps` VALUES (206, 104, 2, 'Toss with lime juice and season to taste');
INSERT INTO `recipe_steps` VALUES (207, 105, 1, 'Cook sticky rice and roast the peanuts');
INSERT INTO `recipe_steps` VALUES (208, 105, 2, 'Top sticky rice with peanuts and sesame seeds');
INSERT INTO `recipe_steps` VALUES (209, 106, 1, 'Grill rice paper with pork and egg');
INSERT INTO `recipe_steps` VALUES (210, 106, 2, 'Serve with fresh herbs and dipping sauce');
INSERT INTO `recipe_steps` VALUES (211, 107, 1, 'Grill squid with lemongrass and chili');
INSERT INTO `recipe_steps` VALUES (212, 107, 2, 'Serve with lime and dipping sauce');
INSERT INTO `recipe_steps` VALUES (213, 108, 1, 'Stuff cabbage leaves with pork and vegetables');
INSERT INTO `recipe_steps` VALUES (214, 108, 2, 'Steam the cabbage rolls and serve hot');
INSERT INTO `recipe_steps` VALUES (215, 109, 1, 'Steam fish with ginger and herbs');
INSERT INTO `recipe_steps` VALUES (216, 109, 2, 'Serve with dipping sauce');
INSERT INTO `recipe_steps` VALUES (217, 110, 1, 'Make meatballs and prepare the broth');
INSERT INTO `recipe_steps` VALUES (218, 110, 2, 'Serve meatballs in the soup with noodles');

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
) ENGINE = InnoDB AUTO_INCREMENT = 63 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

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
INSERT INTO `recipe_vitamin` VALUES (41, 41, 120, 3.5, 25, 30, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (42, 42, 95, 2.8, 20, 45, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (43, 43, 130, 3.2, 35, 25, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (44, 44, 80, 4, 15, 10, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (45, 45, 140, 2.5, 40, 35, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (46, 46, 100, 3.7, 28, 40, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (47, 47, 85, 3.3, 32, 20, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (48, 48, 110, 4.2, 22, 15, 8, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (49, 49, 75, 3.6, 38, 50, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (50, 50, 115, 3.9, 25, 35, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (51, 51, 100, 3.5, 25, 30, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (52, 52, 120, 2.8, 20, 45, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (53, 53, 85, 3.2, 35, 25, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (54, 54, 110, 4, 15, 10, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (55, 55, 130, 2.5, 40, 35, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (56, 56, 95, 3.7, 28, 40, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (57, 57, 80, 3.3, 32, 20, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (58, 58, 115, 4.2, 22, 15, 8, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (59, 59, 90, 3.6, 38, 50, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (60, 60, 105, 3.9, 25, 35, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (61, 61, 105, 3.9, 25, 35, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (62, 62, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `recipe_vitamin` VALUES (63, 63, 90, 4.5, 35, 20, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (64, 64, 115, 4.3, 20, 15, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (65, 65, 140, 3.8, 40, 30, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (66, 66, 125, 4, 28, 45, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (67, 67, 100, 3.5, 32, 25, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (68, 68, 105, 4.6, 38, 50, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (69, 69, 120, 3.9, 22, 20, 8, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (70, 70, 95, 4.2, 28, 30, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (71, 71, 110, 4.5, 15, 20, 6, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (72, 72, 85, 3.8, 10, 15, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (73, 73, 90, 3, 12, 25, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (74, 74, 125, 4.2, 18, 30, 6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (75, 75, 130, 3.9, 28, 35, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (76, 76, 140, 5, 15, 25, 8, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (77, 77, 120, 4.8, 12, 20, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (78, 78, 110, 3.3, 18, 25, 7, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (79, 79, 130, 5.1, 20, 30, 8, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (80, 80, 95, 3.6, 25, 40, 4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (81, 81, 50, 2, 10, 15, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (82, 82, 60, 2.5, 5, 10, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (83, 83, 70, 3.5, 15, 20, 2, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (84, 84, 40, 1.5, 10, 15, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (85, 85, 55, 2.8, 12, 18, 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (86, 86, 50, 2, 8, 12, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (87, 87, 45, 2, 8, 12, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (88, 88, 35, 1, 5, 10, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (89, 89, 50, 1.8, 8, 15, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (90, 90, 30, 1.2, 6, 10, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (91, 91, 55, 2.5, 12, 15, 2, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (92, 92, 70, 3, 18, 20, 3, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (93, 93, 50, 2, 8, 25, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (94, 94, 40, 1.5, 10, 15, 0, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (95, 95, 60, 1.8, 10, 30, 2, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (96, 96, 50, 2.5, 15, 10, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (97, 97, 70, 3.5, 25, 20, 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (98, 98, 60, 2, 10, 10, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (99, 99, 80, 3, 20, 25, 2, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (100, 100, 30, 1, 5, 30, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (101, 101, 60, 3, 10, 20, 2, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (102, 102, 50, 2, 5, 15, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (103, 103, 40, 2, 8, 18, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (104, 104, 55, 2.5, 10, 20, 2, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (105, 105, 30, 1, 3, 20, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (106, 106, 60, 3, 10, 15, 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (107, 107, 65, 2.5, 15, 18, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (108, 108, 50, 1.5, 8, 25, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (109, 109, 70, 2, 12, 20, 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `recipe_vitamin` VALUES (110, 110, 60, 2, 10, 15, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for recipes_contribution
-- ----------------------------
DROP TABLE IF EXISTS `recipes_contribution`;
CREATE TABLE `recipes_contribution`  (
  `id_recipe` int NOT NULL,
  `id_user` int NOT NULL,
  `accept_contribution` tinyint(1) NOT NULL,
  `date` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_recipe`, `id_user`) USING BTREE,
  INDEX `id_user`(`id_user` ASC) USING BTREE,
  CONSTRAINT `recipes_contribution_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `recipes_contribution_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of recipes_contribution
-- ----------------------------
INSERT INTO `recipes_contribution` VALUES (1, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (2, 1, 1, '2024-11-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (3, 1, 1, '2024-10-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (4, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (5, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (6, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (7, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (8, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (9, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (10, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (11, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (12, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (13, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (14, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (15, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (16, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (17, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (18, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (19, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (20, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (21, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (22, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (23, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (24, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (25, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (26, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (27, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (28, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (29, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (30, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (31, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (32, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (33, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (34, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (35, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (36, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (37, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (38, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (39, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (40, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (41, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (42, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (43, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (44, 1, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (45, 2, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (46, 2, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (47, 2, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (48, 2, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (49, 2, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (50, 2, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (51, 2, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (52, 2, 1, '2024-10-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (53, 2, 1, '2024-10-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (54, 2, 1, '2024-09-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (55, 2, 1, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (56, 2, 0, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (57, 2, 0, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (58, 2, 0, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (59, 2, 2, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (60, 2, 1, '2024-11-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (61, 2, 0, '2024-10-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (62, 1, 0, '2024-12-19 01:44:02');
INSERT INTO `recipes_contribution` VALUES (63, 1, 1, '2024-12-23 15:18:42');
INSERT INTO `recipes_contribution` VALUES (64, 1, 1, '2024-12-23 15:18:42');
INSERT INTO `recipes_contribution` VALUES (65, 1, 1, '2024-12-23 15:18:42');
INSERT INTO `recipes_contribution` VALUES (66, 1, 1, '2024-12-23 15:18:42');
INSERT INTO `recipes_contribution` VALUES (67, 1, 1, '2024-12-23 15:18:42');
INSERT INTO `recipes_contribution` VALUES (68, 1, 1, '2024-12-23 15:18:42');
INSERT INTO `recipes_contribution` VALUES (69, 1, 1, '2024-12-23 15:18:42');
INSERT INTO `recipes_contribution` VALUES (70, 1, 1, '2024-12-23 15:18:42');
INSERT INTO `recipes_contribution` VALUES (71, 1, 1, '2024-12-23 15:19:30');
INSERT INTO `recipes_contribution` VALUES (72, 1, 1, '2024-12-23 15:19:30');
INSERT INTO `recipes_contribution` VALUES (73, 1, 1, '2024-12-23 15:19:30');
INSERT INTO `recipes_contribution` VALUES (74, 1, 1, '2024-12-23 15:19:30');
INSERT INTO `recipes_contribution` VALUES (75, 1, 1, '2024-12-23 15:19:30');
INSERT INTO `recipes_contribution` VALUES (76, 1, 1, '2024-12-23 15:19:30');
INSERT INTO `recipes_contribution` VALUES (77, 1, 1, '2024-12-23 15:19:30');
INSERT INTO `recipes_contribution` VALUES (78, 1, 1, '2024-12-23 15:19:30');
INSERT INTO `recipes_contribution` VALUES (79, 1, 1, '2024-12-23 15:19:30');
INSERT INTO `recipes_contribution` VALUES (80, 1, 1, '2024-12-23 15:19:30');
INSERT INTO `recipes_contribution` VALUES (81, 1, 1, '2024-12-23 15:35:37');
INSERT INTO `recipes_contribution` VALUES (82, 1, 1, '2024-12-23 15:35:37');
INSERT INTO `recipes_contribution` VALUES (83, 1, 1, '2024-12-23 15:35:37');
INSERT INTO `recipes_contribution` VALUES (84, 1, 1, '2024-12-23 15:35:37');
INSERT INTO `recipes_contribution` VALUES (85, 1, 1, '2024-12-23 15:35:37');
INSERT INTO `recipes_contribution` VALUES (86, 1, 1, '2024-12-23 15:35:37');
INSERT INTO `recipes_contribution` VALUES (87, 1, 1, '2024-12-23 15:35:37');
INSERT INTO `recipes_contribution` VALUES (88, 1, 1, '2024-12-23 15:35:37');
INSERT INTO `recipes_contribution` VALUES (89, 1, 1, '2024-12-23 15:35:37');
INSERT INTO `recipes_contribution` VALUES (90, 1, 1, '2024-12-23 15:35:37');
INSERT INTO `recipes_contribution` VALUES (91, 1, 1, '2024-12-23 15:38:14');
INSERT INTO `recipes_contribution` VALUES (92, 1, 1, '2024-12-23 15:38:14');
INSERT INTO `recipes_contribution` VALUES (93, 1, 1, '2024-12-23 15:38:14');
INSERT INTO `recipes_contribution` VALUES (94, 1, 1, '2024-12-23 15:38:14');
INSERT INTO `recipes_contribution` VALUES (95, 1, 1, '2024-12-23 15:38:14');
INSERT INTO `recipes_contribution` VALUES (96, 1, 1, '2024-12-23 15:38:14');
INSERT INTO `recipes_contribution` VALUES (97, 1, 1, '2024-12-23 15:38:14');
INSERT INTO `recipes_contribution` VALUES (98, 1, 1, '2024-12-23 15:38:14');
INSERT INTO `recipes_contribution` VALUES (99, 1, 1, '2024-12-23 15:38:14');
INSERT INTO `recipes_contribution` VALUES (100, 1, 1, '2024-12-23 15:38:14');
INSERT INTO `recipes_contribution` VALUES (101, 1, 1, '2024-12-23 15:41:59');
INSERT INTO `recipes_contribution` VALUES (102, 1, 1, '2024-12-23 15:41:59');
INSERT INTO `recipes_contribution` VALUES (103, 1, 1, '2024-12-23 15:41:59');
INSERT INTO `recipes_contribution` VALUES (104, 1, 1, '2024-12-23 15:41:59');
INSERT INTO `recipes_contribution` VALUES (105, 1, 1, '2024-12-23 15:41:59');
INSERT INTO `recipes_contribution` VALUES (106, 1, 1, '2024-12-23 15:41:59');
INSERT INTO `recipes_contribution` VALUES (107, 1, 1, '2024-12-23 15:41:59');
INSERT INTO `recipes_contribution` VALUES (108, 1, 1, '2024-12-23 15:41:59');
INSERT INTO `recipes_contribution` VALUES (109, 1, 1, '2024-12-23 15:41:59');
INSERT INTO `recipes_contribution` VALUES (110, 1, 1, '2024-12-23 15:41:59');

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of recipes_favourite
-- ----------------------------
INSERT INTO `recipes_favourite` VALUES (1, 2);
INSERT INTO `recipes_favourite` VALUES (5, 2);
INSERT INTO `recipes_favourite` VALUES (6, 2);
INSERT INTO `recipes_favourite` VALUES (8, 2);
INSERT INTO `recipes_favourite` VALUES (9, 2);
INSERT INTO `recipes_favourite` VALUES (43, 2);
INSERT INTO `recipes_favourite` VALUES (52, 2);

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', 'scrypt:32768:8:1$nSS2bDUhQyY0hHSw$31b06df7e2302c0ed47bfaf6ebc1cda87a153f453f2dc088763573ae35a7709bcb56e41a08dfa0537e6a09770cad4db91332595b3b206c0734e3309612487a12', 'admin@gmail.com', NULL, NULL, 0, 'hidden');
INSERT INTO `user` VALUES (2, 'camly', 'scrypt:32768:8:1$PVEyzPQcabYcfPSX$2028ccc86c6abd8670760f8193ce4bddce9f77276ee94d62a2e84f8b407b241e60afe857b1187ae074c9ba50457a7c78398b26ff6b03e2f13eaeca1986c33ffe', 'nguyenthicamly1112@gmail.com', '950963', '2024-12-17 16:14:21', 0, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_daily_nutrition_goal
-- ----------------------------
INSERT INTO `user_daily_nutrition_goal` VALUES (1, 2, 1600, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
