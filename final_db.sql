-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: food_recognition
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `advertising_banners`
--

DROP TABLE IF EXISTS `advertising_banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advertising_banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `start_date` date DEFAULT NULL,
  `expire_date` date DEFAULT NULL,
  `activate` tinyint(1) NOT NULL,
  `image_background` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advertising_banners`
--

LOCK TABLES `advertising_banners` WRITE;
/*!40000 ALTER TABLE `advertising_banners` DISABLE KEYS */;
/*!40000 ALTER TABLE `advertising_banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `config` (
  `config_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`config_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `config`
--

LOCK TABLES `config` WRITE;
/*!40000 ALTER TABLE `config` DISABLE KEYS */;
INSERT INTO `config` VALUES ('data_recommend_csv','recommend-dataset/recipes_export_20241219_004551.csv'),('superadmin_password','admin'),('superadmin_username','admin');
/*!40000 ALTER TABLE `config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `csv_export_version`
--

DROP TABLE IF EXISTS `csv_export_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `csv_export_version` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `exported_by` int NOT NULL,
  `total_recipes` int NOT NULL,
  `file_size` float NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `exported_by` (`exported_by`) USING BTREE,
  CONSTRAINT `csv_export_version_ibfk_1` FOREIGN KEY (`exported_by`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `csv_export_version`
--

LOCK TABLES `csv_export_version` WRITE;
/*!40000 ALTER TABLE `csv_export_version` DISABLE KEYS */;
INSERT INTO `csv_export_version` VALUES (1,'recipes_export_20241216_150643.csv','2024-12-16 08:06:43',1,40,14.5557,'completed',NULL),(2,'recipes_export_20241217_162747.csv','2024-12-17 09:27:48',1,60,22.0938,'completed',NULL),(3,'recipes_export_20241219_004551.csv','2024-12-18 17:45:52',1,59,21.6768,'completed',NULL);
/*!40000 ALTER TABLE `csv_export_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rating`
--

DROP TABLE IF EXISTS `rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rating` (
  `id_rate` int NOT NULL AUTO_INCREMENT,
  `id_recipe` int NOT NULL,
  `id_user` int NOT NULL,
  `star` int NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`id_rate`) USING BTREE,
  KEY `id_recipe` (`id_recipe`) USING BTREE,
  KEY `id_user` (`id_user`) USING BTREE,
  CONSTRAINT `rating_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `rating_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rating`
--

LOCK TABLES `rating` WRITE;
/*!40000 ALTER TABLE `rating` DISABLE KEYS */;
INSERT INTO `rating` VALUES (1,1,1,5,'Perfect salmon recipe!'),(2,2,1,4,'Simple and delicious'),(3,3,1,5,'Best Caesar salad ever'),(4,4,1,4,'Healthy and tasty'),(5,5,1,5,'Kids love these pancakes'),(6,6,1,5,'Perfect salmon recipe!'),(7,7,1,4,'Simple and delicious'),(8,8,1,5,'Best Caesar salad ever'),(9,9,1,4,'Healthy and tasty'),(10,10,1,5,'Kids love these pancakes'),(11,11,1,5,'Authentic risotto taste!'),(12,12,1,4,'Healthy and delicious breakfast'),(13,13,1,5,'Just like in Italy'),(14,14,1,4,'Great vegetarian option'),(15,15,1,5,'Kids love the colorful bowl'),(16,16,1,4,'Classic taco night'),(17,17,1,5,'Protein-packed breakfast'),(18,18,1,4,'Nutritious and filling'),(19,19,1,5,'Restaurant-quality paella'),(20,20,1,4,'Interesting vegetable dish'),(21,21,1,5,'Authentic Thai flavor!'),(22,22,1,4,'Healthy and delicious'),(23,23,1,5,'Perfect Mediterranean spread'),(24,24,1,4,'Flavorful lamb kebabs'),(25,25,1,5,'Great post-workout smoothie'),(26,26,1,4,'Reminds me of Vietnam'),(27,27,1,5,'Colorful and tasty'),(28,28,1,4,'Interesting breakfast dish'),(29,29,1,5,'Fresh and light lunch'),(30,30,1,4,'Rich and comforting tagine'),(41,31,1,5,'Authentic Korean flavors!'),(42,32,1,4,'Healthy and creamy'),(43,33,1,5,'Just like in Greece'),(44,34,1,4,'Rich and flavorful curry'),(45,35,1,5,'Perfect morning detox'),(46,36,1,4,'Crispy and delicious'),(47,37,1,5,'Unique Peruvian dish'),(48,38,1,4,'Interesting matcha twist'),(49,39,1,5,'Creative sushi fusion'),(50,40,1,4,'Comforting ramen bowl'),(51,41,1,5,'Authentic Indian flavors!'),(52,42,1,4,'Crispy and delicious'),(53,43,1,5,'Perfect lunch wrap'),(54,44,1,4,'Spicy and colorful'),(55,45,1,5,'Great post-workout drink'),(56,46,1,4,'Spicy buffalo goodness'),(57,47,1,5,'Tasty teriyaki'),(58,48,1,4,'Protein-packed breakfast'),(59,49,1,5,'Creamy pesto delight'),(60,50,1,4,'Comforting curry'),(61,51,1,5,'Spicy Korean chicken perfection!'),(62,52,1,4,'Hearty breakfast option'),(63,53,1,5,'Fresh and light salad'),(64,54,1,4,'Crispy and indulgent'),(65,55,1,5,'Protein-packed breakfast'),(66,56,1,4,'Tender BBQ chicken'),(67,57,1,5,'Classic Chinese-style dish'),(68,58,1,4,'Interesting breakfast twist'),(69,59,1,5,'Authentic Greek flavors'),(70,60,1,4,'Rich and aromatic');
/*!40000 ALTER TABLE `rating` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_info`
--

DROP TABLE IF EXISTS `recipe_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_info` (
  `id_recipe` int NOT NULL AUTO_INCREMENT,
  `name_recipe` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`id_recipe`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_info`
--

LOCK TABLES `recipe_info` WRITE;
/*!40000 ALTER TABLE `recipe_info` DISABLE KEYS */;
INSERT INTO `recipe_info` VALUES (1,'Grilled Salmon with Quinoa','salmon_quinoa.jpg','dinner','Published','A healthy and delicious dinner with omega-3 rich salmon'),(2,'Avocado Toast with Eggs','avocado_toast.jpg','breakfast','Published','Creamy avocado on crispy toast topped with perfectly cooked eggs'),(3,'Chicken Caesar Salad','caesar_salad.jpg','lunch','Published','Classic lunch salad with grilled chicken and homemade dressing'),(4,'Vegetable Stir Fry','stir_fry.jpg','dinner','Published','Quick and nutritious vegetable stir fry with tofu'),(5,'Banana Pancakes','banana_pancakes.jpg','breakfast','Published','Fluffy pancakes made with ripe bananas'),(6,'Mediterranean Wrap','med_wrap.jpg','lunch','Published','Hummus, vegetables, and feta cheese in a whole wheat wrap'),(7,'Beef Stroganoff','beef_stroganoff.jpg','dinner','Published','Classic comfort food with tender beef and creamy sauce'),(8,'Overnight Oats','overnight_oats.jpg','breakfast','Published','No-cook overnight oats with berries and nuts'),(9,'Greek Salad','greek_salad.jpg','lunch','Published','Fresh and light Greek salad with olives and feta'),(10,'Shrimp Scampi','shrimp_scampi.jpg','dinner','Published','Garlic butter shrimp served over linguine'),(11,'Mushroom Risotto','mushroom_risotto.jpg','dinner','Published','Creamy Italian rice dish with wild mushrooms'),(12,'Chia Seed Pudding','chia_pudding.jpg','breakfast','Published','Healthy overnight chia seed pudding with fresh fruits'),(13,'Caprese Sandwich','caprese_sandwich.jpg','lunch','Published','Classic Italian sandwich with fresh mozzarella and tomatoes'),(14,'Korean BBQ Tofu Bowl','bbq_tofu.jpg','dinner','Published','Spicy Korean-style tofu with rice and vegetables'),(15,'Smoothie Bowl','smoothie_bowl.jpg','breakfast','Published','Colorful smoothie bowl topped with granola and seeds'),(16,'Falafel Wrap','falafel_wrap.jpg','lunch','Published','Crispy falafel with tahini sauce in a soft wrap'),(17,'Beef Tacos','beef_tacos.jpg','dinner','Published','Homemade beef tacos with fresh salsa'),(18,'Protein Pancakes','protein_pancakes.jpg','breakfast','Published','High-protein pancakes with protein powder'),(19,'Quinoa Buddha Bowl','buddha_bowl.jpg','lunch','Published','Nutritious bowl with quinoa, roasted vegetables, and dressing'),(20,'Seafood Paella','seafood_paella.jpg','dinner','Published','Traditional Spanish seafood and rice dish'),(21,'Thai Green Curry','thai_curry.jpg','dinner','Published','Authentic Thai green curry with vegetables and coconut milk'),(22,'Acai Bowl','acai_bowl.jpg','breakfast','Published','Superfood breakfast bowl with fresh fruits and nuts'),(23,'Mediterranean Mezze Plate','mezze_plate.jpg','lunch','Published','Variety of Mediterranean small plates and dips'),(24,'Lamb Kebabs','lamb_kebabs.jpg','dinner','Published','Grilled lamb skewers with herbs and spices'),(25,'Protein Smoothie','protein_smoothie.jpg','breakfast','Published','High-protein morning smoothie with multiple ingredients'),(26,'Vietnamese Banh Mi','banh_mi.jpg','lunch','Published','Traditional Vietnamese sandwich with pickled vegetables'),(27,'Stuffed Bell Peppers','stuffed_peppers.jpg','dinner','Published','Colorful bell peppers stuffed with rice and meat'),(28,'Shakshuka','shakshuka.jpg','breakfast','Published','Middle Eastern eggs poached in spicy tomato sauce'),(29,'Poke Bowl','poke_bowl.jpg','lunch','Published','Hawaiian-style raw fish bowl with rice and toppings'),(30,'Moroccan Tagine','moroccan_tagine.jpg','dinner','Published','Traditional slow-cooked Moroccan stew with meat and vegetables'),(31,'Korean Bibimbap','bibimbap.jpg','dinner','Published','Traditional Korean mixed rice bowl with vegetables and meat'),(32,'Chia Seed Pudding','chia_pudding.jpg','breakfast','Published','Creamy overnight chia seed pudding with tropical fruits'),(33,'Greek Gyros Plate','gyros_plate.jpg','lunch','Published','Classic Greek gyros with tzatziki and pita'),(34,'Indian Butter Chicken','butter_chicken.jpg','dinner','Published','Creamy tomato-based chicken curry with aromatic spices'),(35,'Green Detox Smoothie','detox_smoothie.jpg','breakfast','Published','Nutrient-packed green smoothie with leafy greens'),(36,'Cuban Sandwich','cuban_sandwich.jpg','lunch','Published','Traditional Cuban pressed sandwich with ham and pickles'),(37,'Peruvian Lomo Saltado','lomo_saltado.jpg','dinner','Published','Peruvian stir-fried beef with French fries'),(38,'Matcha Overnight Oats','matcha_oats.jpg','breakfast','Published','Green tea-infused overnight oats'),(39,'Sushi Burrito','sushi_burrito.jpg','lunch','Published','Fusion sushi roll wrapped like a burrito'),(40,'Japanese Ramen','ramen.jpg','dinner','Published','Authentic Japanese ramen with rich broth and toppings'),(41,'Chicken Tikka Masala','chicken_tikka.jpg','dinner','Published','Classic Indian dish with tender chicken in creamy tomato sauce'),(42,'Chicken and Waffle Breakfast','chicken_waffle.jpg','breakfast','Published','Southern-style crispy chicken served with fluffy waffles'),(43,'Chicken Caesar Wrap','caesar_wrap.jpg','lunch','Published','Grilled chicken Caesar salad wrapped in a tortilla'),(44,'Chicken Fajitas','chicken_fajitas.jpg','dinner','Published','Sizzling Mexican-style chicken with peppers and onions'),(45,'Chicken Protein Smoothie','chicken_protein.jpg','breakfast','Published','High-protein smoothie with chicken and fruits'),(46,'Buffalo Chicken Sandwich','buffalo_chicken.jpg','lunch','Published','Spicy buffalo chicken on a crispy roll'),(47,'Chicken Teriyaki Bowl','chicken_teriyaki.jpg','dinner','Published','Japanese-inspired teriyaki chicken over rice'),(48,'Chicken and Spinach Frittata','chicken_frittata.jpg','breakfast','Published','Protein-packed egg dish with chicken and spinach'),(49,'Chicken Pesto Pasta','chicken_pesto.jpg','lunch','Published','Creamy pesto pasta with grilled chicken'),(50,'Coconut Curry Chicken','coconut_curry_chicken.jpg','dinner','Published','Creamy coconut curry with tender chicken pieces'),(51,'Korean Gochujang Chicken','korean_chicken.jpg','dinner','Published','Spicy Korean-style chicken with gochujang sauce'),(52,'Chicken Breakfast Quesadilla','chicken_quesadilla.jpg','breakfast','Published','Hearty breakfast quesadilla with scrambled chicken'),(53,'Mediterranean Chicken Salad','med_chicken_salad.jpg','lunch','Published','Grilled chicken with Mediterranean ingredients'),(54,'Chicken Chimichanga','chicken_chimichanga.jpg','dinner','Published','Deep-fried chicken and cheese burrito'),(55,'Chicken Protein Pancakes','chicken_pancakes.jpg','breakfast','Published','High-protein pancakes with shredded chicken'),(56,'BBQ Chicken Sandwich','bbq_chicken_sandwich.jpg','lunch','Published','Slow-cooked BBQ pulled chicken sandwich'),(57,'Cashew Chicken','cashew_chicken.jpg','dinner','Published','Chinese-style stir-fried chicken with cashews'),(58,'Chicken Shakshuka','chicken_shakshuka.jpg','breakfast','Published','Middle Eastern-inspired chicken and egg dish'),(59,'Greek Chicken Gyros','greek_chicken_gyros.jpg','lunch','Published','Traditional Greek chicken gyros with tzatziki'),(60,'Moroccan Spiced Chicken','moroccan_chicken.jpg','dinner','Published','Slow-cooked chicken with aromatic Moroccan spices'),(61,'Fish salad','20241217_230818_recipe_image.jpg','lunch','Pending','Fishhhh'),(62,'Test','20241219_004943_download_1.png','dinner','pending','test');
/*!40000 ALTER TABLE `recipe_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_ingredients`
--

DROP TABLE IF EXISTS `recipe_ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_ingredients` (
  `id_ingredient` int NOT NULL AUTO_INCREMENT,
  `id_recipe` int NOT NULL,
  `name_ingredient` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `quantity` float NOT NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`id_ingredient`) USING BTREE,
  KEY `id_recipe` (`id_recipe`) USING BTREE,
  CONSTRAINT `recipe_ingredients_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_ingredients`
--

LOCK TABLES `recipe_ingredients` WRITE;
/*!40000 ALTER TABLE `recipe_ingredients` DISABLE KEYS */;
INSERT INTO `recipe_ingredients` VALUES (1,1,'Salmon Fillet',200,'g','salmon.jpg'),(2,1,'Quinoa',100,'g','quinoa.jpg'),(3,2,'Bread',2,'slice','bread.jpg'),(4,2,'Avocado',1,'piece','avocado.jpg'),(5,3,'Chicken Breast',150,'g','chicken.jpg'),(6,3,'Romaine Lettuce',100,'g','lettuce.jpg'),(7,4,'Tofu',200,'g','tofu.jpg'),(8,4,'Mixed Vegetables',300,'g','mixed_veg.jpg'),(9,5,'Banana',2,'piece','banana.jpg'),(10,5,'Flour',150,'g','flour.jpg'),(11,2,'Salmon Fillet',200,'g','salmon.jpg'),(12,2,'Quinoa',100,'g','quinoa.jpg'),(13,3,'Bread',2,'slice','bread.jpg'),(14,3,'Avocado',1,'piece','avocado.jpg'),(15,4,'Chicken Breast',150,'g','chicken.jpg'),(16,4,'Romaine Lettuce',100,'g','lettuce.jpg'),(17,5,'Tofu',200,'g','tofu.jpg'),(18,5,'Mixed Vegetables',300,'g','mixed_veg.jpg'),(19,6,'Banana',2,'piece','banana.jpg'),(20,6,'Flour',150,'g','flour.jpg'),(21,11,'Arborio Rice',250,'g','arborio_rice.jpg'),(22,11,'Wild Mushrooms',200,'g','mushrooms.jpg'),(23,12,'Chia Seeds',50,'g','chia_seeds.jpg'),(24,12,'Almond Milk',250,'ml','almond_milk.jpg'),(25,13,'Mozzarella',100,'g','mozzarella.jpg'),(26,13,'Tomatoes',2,'piece','tomatoes.jpg'),(27,14,'Tofu',250,'g','tofu.jpg'),(28,14,'Gochujang Sauce',50,'ml','gochujang.jpg'),(29,15,'Frozen Berries',150,'g','frozen_berries.jpg'),(30,15,'Greek Yogurt',100,'g','greek_yogurt.jpg'),(31,16,'Ground Beef',300,'g','ground_beef.jpg'),(32,16,'Tortillas',4,'piece','tortillas.jpg'),(33,17,'Protein Powder',50,'g','protein_powder.jpg'),(34,17,'Eggs',2,'piece','eggs.jpg'),(35,18,'Quinoa',150,'g','quinoa.jpg'),(36,18,'Roasted Vegetables',200,'g','roasted_veg.jpg'),(37,19,'Seafood Mix',400,'g','seafood_mix.jpg'),(38,19,'Saffron',1,'pinch','saffron.jpg'),(39,20,'Cauliflower',1,'head','cauliflower.jpg'),(40,20,'Curry Paste',50,'ml','curry_paste.jpg'),(41,21,'Coconut Milk',400,'ml','coconut_milk.jpg'),(42,21,'Green Curry Paste',50,'g','green_curry_paste.jpg'),(43,22,'Acai Powder',50,'g','acai_powder.jpg'),(44,22,'Mixed Nuts',30,'g','mixed_nuts.jpg'),(45,23,'Hummus',150,'g','hummus.jpg'),(46,23,'Olives',50,'g','olives.jpg'),(47,24,'Lamb',300,'g','lamb.jpg'),(48,24,'Herbs',20,'g','herbs.jpg'),(49,25,'Protein Powder',50,'g','protein_powder.jpg'),(50,25,'Banana',1,'piece','banana.jpg'),(51,26,'Baguette',1,'piece','baguette.jpg'),(52,26,'Pickled Vegetables',100,'g','pickled_veg.jpg'),(53,27,'Bell Peppers',4,'piece','bell_peppers.jpg'),(54,27,'Ground Beef',250,'g','ground_beef.jpg'),(55,28,'Eggs',4,'piece','eggs.jpg'),(56,28,'Tomato Sauce',200,'ml','tomato_sauce.jpg'),(57,29,'Sushi Grade Tuna',200,'g','tuna.jpg'),(58,29,'Sushi Rice',150,'g','sushi_rice.jpg'),(59,30,'Lamb Shoulder',500,'g','lamb_shoulder.jpg'),(60,30,'Preserved Lemons',50,'g','preserved_lemons.jpg'),(61,31,'Beef',200,'g','beef.jpg'),(62,31,'Rice',150,'g','rice.jpg'),(63,32,'Chia Seeds',50,'g','chia_seeds.jpg'),(64,32,'Coconut Milk',200,'ml','coconut_milk.jpg'),(65,33,'Pita Bread',2,'piece','pita.jpg'),(66,33,'Tzatziki',100,'g','tzatziki.jpg'),(67,34,'Chicken Thighs',300,'g','chicken_thighs.jpg'),(68,34,'Tomato Sauce',200,'ml','tomato_sauce.jpg'),(69,35,'Spinach',100,'g','spinach.jpg'),(70,35,'Green Apple',1,'piece','green_apple.jpg'),(71,36,'Pork Shoulder',200,'g','pork_shoulder.jpg'),(72,36,'Pickles',50,'g','pickles.jpg'),(73,37,'Beef Sirloin',250,'g','beef_sirloin.jpg'),(74,37,'French Fries',150,'g','french_fries.jpg'),(75,38,'Rolled Oats',100,'g','rolled_oats.jpg'),(76,38,'Matcha Powder',10,'g','matcha_powder.jpg'),(77,39,'Sushi Rice',150,'g','sushi_rice.jpg'),(78,39,'Fresh Tuna',200,'g','tuna.jpg'),(79,40,'Ramen Noodles',200,'g','ramen_noodles.jpg'),(80,40,'Pork Belly',150,'g','pork_belly.jpg'),(81,41,'Chicken Breast',300,'g','chicken_breast.jpg'),(82,41,'Tomato Sauce',200,'ml','tomato_sauce.jpg'),(83,42,'Chicken Thighs',250,'g','chicken_thighs.jpg'),(84,42,'Waffle Mix',150,'g','waffle_mix.jpg'),(85,43,'Grilled Chicken',200,'g','grilled_chicken.jpg'),(86,43,'Tortilla',1,'piece','tortilla.jpg'),(87,44,'Chicken Strips',250,'g','chicken_strips.jpg'),(88,44,'Bell Peppers',2,'piece','bell_peppers.jpg'),(89,45,'Chicken Breast',150,'g','chicken_breast.jpg'),(90,45,'Protein Powder',30,'g','protein_powder.jpg'),(91,46,'Chicken Breast',200,'g','chicken_breast.jpg'),(92,46,'Buffalo Sauce',50,'ml','buffalo_sauce.jpg'),(93,47,'Chicken Thighs',300,'g','chicken_thighs.jpg'),(94,47,'Teriyaki Sauce',100,'ml','teriyaki_sauce.jpg'),(95,48,'Chicken',150,'g','chicken.jpg'),(96,48,'Eggs',4,'piece','eggs.jpg'),(97,49,'Chicken Breast',250,'g','chicken_breast.jpg'),(98,49,'Pesto Sauce',75,'ml','pesto_sauce.jpg'),(99,50,'Chicken Thighs',300,'g','chicken_thighs.jpg'),(100,50,'Coconut Milk',200,'ml','coconut_milk.jpg'),(101,51,'Chicken Thighs',300,'g','chicken_thighs.jpg'),(102,51,'Gochujang Sauce',50,'ml','gochujang_sauce.jpg'),(103,52,'Chicken Breast',200,'g','chicken_breast.jpg'),(104,52,'Tortilla',2,'piece','tortilla.jpg'),(105,53,'Grilled Chicken',250,'g','grilled_chicken.jpg'),(106,53,'Mixed Salad Greens',100,'g','salad_greens.jpg'),(107,54,'Chicken',300,'g','chicken.jpg'),(108,54,'Tortilla',2,'piece','tortilla.jpg'),(109,55,'Chicken Breast',150,'g','chicken_breast.jpg'),(110,55,'Protein Powder',30,'g','protein_powder.jpg'),(111,56,'Chicken Breast',250,'g','chicken_breast.jpg'),(112,56,'BBQ Sauce',100,'ml','bbq_sauce.jpg'),(113,57,'Chicken Breast',300,'g','chicken_breast.jpg'),(114,57,'Cashews',100,'g','cashews.jpg'),(115,58,'Chicken',200,'g','chicken.jpg'),(116,58,'Eggs',4,'piece','eggs.jpg'),(117,59,'Chicken Breast',250,'g','chicken_breast.jpg'),(118,59,'Pita Bread',2,'piece','pita_bread.jpg'),(119,60,'Chicken Thighs',400,'g','chicken_thighs.jpg'),(120,60,'Moroccan Spice Mix',30,'g','moroccan_spices.jpg'),(121,61,'T',1,'c','20241217_230818_ingredient_image_0.jpg'),(122,62,'test',1,'c',NULL);
/*!40000 ALTER TABLE `recipe_ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_nutrition`
--

DROP TABLE IF EXISTS `recipe_nutrition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_nutrition` (
  `id_nutrition` int NOT NULL AUTO_INCREMENT,
  `id_recipe` int NOT NULL,
  `calories` float DEFAULT NULL,
  `fat` float DEFAULT NULL,
  `saturated_fat` float DEFAULT NULL,
  `carbohydrates` float DEFAULT NULL,
  `sugar` float DEFAULT NULL,
  `cholesterol` float DEFAULT NULL,
  `sodium` float DEFAULT NULL,
  `protein` float DEFAULT NULL,
  `alcohol` float DEFAULT NULL,
  PRIMARY KEY (`id_nutrition`) USING BTREE,
  KEY `id_recipe` (`id_recipe`) USING BTREE,
  CONSTRAINT `recipe_nutrition_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_nutrition`
--

LOCK TABLES `recipe_nutrition` WRITE;
/*!40000 ALTER TABLE `recipe_nutrition` DISABLE KEYS */;
INSERT INTO `recipe_nutrition` VALUES (1,1,350,15.5,NULL,30.2,1.2,70,250,25.3,NULL),(2,2,280,12.5,NULL,25.3,3.4,35,180,15.6,NULL),(3,3,320,10.2,NULL,15.5,2.1,90,450,35.7,NULL),(4,4,250,8.7,NULL,20.3,5.2,0,300,18.5,NULL),(5,5,300,9.5,NULL,45.2,10.5,50,200,12.3,NULL),(6,6,350,15.5,NULL,30.2,1.2,70,250,25.3,NULL),(7,7,280,12.5,NULL,25.3,3.4,35,180,15.6,NULL),(8,8,320,10.2,NULL,15.5,2.1,90,450,35.7,NULL),(9,9,250,8.7,NULL,20.3,5.2,0,300,18.5,NULL),(10,10,300,9.5,NULL,45.2,10.5,50,200,12.3,NULL),(11,11,380,18.5,NULL,45.2,3.4,25,320,12.3,NULL),(12,12,250,12.5,NULL,30.6,5.2,0,180,8.7,NULL),(13,13,320,15.3,NULL,25.7,2.1,35,450,15.6,NULL),(14,14,290,14.2,NULL,28.5,4.5,0,280,20.3,NULL),(15,15,270,8.7,NULL,35.4,12.3,10,200,15.2,NULL),(16,16,450,22.5,NULL,35.6,3.5,90,520,28.7,NULL),(17,17,300,10.2,NULL,25.8,2.7,45,250,30.5,NULL),(18,18,320,12.5,NULL,40.3,5.4,15,300,18.6,NULL),(19,19,400,20.3,NULL,30.5,4.2,120,480,35.7,NULL),(20,20,250,15.6,NULL,20.4,6.3,5,220,12.5,NULL),(21,21,350,22.5,NULL,25.3,4.2,0,380,15.6,NULL),(22,22,280,12.3,NULL,35.7,15.4,5,150,10.5,NULL),(23,23,300,18.7,NULL,20.5,3.6,10,450,12.3,NULL),(24,24,420,28.5,NULL,15.3,2.1,120,320,35.7,NULL),(25,25,250,8.5,NULL,30.2,12.3,15,180,25.6,NULL),(26,26,320,15.4,NULL,35.6,5.2,25,520,15.3,NULL),(27,27,380,22.3,NULL,25.7,4.5,90,450,28.5,NULL),(28,28,290,20.6,NULL,15.3,6.3,350,320,18.7,NULL),(29,29,350,12.5,NULL,40.3,3.4,45,280,25.6,NULL),(30,30,450,30.5,NULL,20.4,5.6,150,400,35.7,NULL),(31,31,380,18.5,NULL,35.2,3.4,75,320,25.3,NULL),(32,32,250,12.5,NULL,30.6,15.2,0,180,8.7,NULL),(33,33,420,22.3,NULL,35.7,4.2,55,450,20.5,NULL),(34,34,450,28.5,NULL,20.3,6.3,120,520,35.7,NULL),(35,35,180,5.6,NULL,25.4,12.5,0,150,10.2,NULL),(36,36,380,22.7,NULL,25.3,3.5,90,580,25.6,NULL),(37,37,420,25.4,NULL,30.5,4.2,100,450,28.7,NULL),(38,38,250,8.5,NULL,35.6,5.4,10,200,12.3,NULL),(39,39,320,15.3,NULL,40.2,3.6,45,380,22.5,NULL),(40,40,450,30.5,NULL,35.7,4.5,150,620,25.6,NULL),(41,41,420,22.5,NULL,25.3,6.3,120,520,35.7,NULL),(42,42,580,35.4,NULL,45.2,10.2,150,450,30.5,NULL),(43,43,650,15.3,NULL,25.6,3.4,90,380,28.7,NULL),(44,44,400,20.5,NULL,20.3,4.5,100,450,35.6,NULL),(45,45,450,8.5,NULL,20.4,5.6,75,200,40.2,NULL),(46,46,480,22.3,NULL,15.6,3.2,85,580,30.5,NULL),(47,47,520,25.4,NULL,35.7,7.3,110,520,28.6,NULL),(48,48,420,18.7,NULL,10.5,2.5,250,350,35.2,NULL),(49,49,480,20.6,NULL,25.3,4.2,95,420,30.5,NULL),(50,50,550,30.5,NULL,20.4,5.6,130,480,35.7,NULL),(51,51,480,22.5,NULL,20.3,6.3,120,520,35.7,NULL),(52,52,520,25.4,NULL,30.5,4.5,90,450,30.6,NULL),(53,53,420,15.3,NULL,10.2,3.4,95,380,35.2,NULL),(54,54,550,28.6,NULL,35.7,5.6,130,550,28.5,NULL),(55,55,400,12.5,NULL,25.3,3.2,75,250,40.2,NULL),(56,56,480,20.5,NULL,25.6,7.3,110,580,35.4,NULL),(57,57,500,22.3,NULL,20.4,4.2,100,450,30.5,NULL),(58,58,450,18.7,NULL,15.3,3.5,250,420,35.6,NULL),(59,59,440,15.6,NULL,25.7,3.8,85,400,30.5,NULL),(60,60,520,30.5,NULL,20.3,5.6,140,480,35.7,NULL),(61,61,1000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(62,62,1,0,0,0,0,0,0,0,0);
/*!40000 ALTER TABLE `recipe_nutrition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_steps`
--

DROP TABLE IF EXISTS `recipe_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_steps` (
  `id_step` int NOT NULL AUTO_INCREMENT,
  `id_recipe` int NOT NULL,
  `step_number` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id_step`) USING BTREE,
  KEY `id_recipe` (`id_recipe`) USING BTREE,
  CONSTRAINT `recipe_steps_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_steps`
--

LOCK TABLES `recipe_steps` WRITE;
/*!40000 ALTER TABLE `recipe_steps` DISABLE KEYS */;
INSERT INTO `recipe_steps` VALUES (1,1,1,'Season salmon with salt and pepper'),(2,1,2,'Grill salmon for 4-5 minutes each side'),(3,2,1,'Toast bread until golden'),(4,2,2,'Mash avocado and spread on toast'),(5,3,1,'Grill chicken breast'),(6,3,2,'Chop lettuce and prepare dressing'),(7,4,1,'Cut tofu and vegetables'),(8,4,2,'Stir fry in hot pan with soy sauce'),(9,5,1,'Mash bananas and mix with flour'),(10,5,2,'Cook pancakes on griddle'),(11,6,1,'Season salmon with salt and pepper'),(12,6,2,'Grill salmon for 4-5 minutes each side'),(13,7,1,'Toast bread until golden'),(14,7,2,'Mash avocado and spread on toast'),(15,8,1,'Grill chicken breast'),(16,8,2,'Chop lettuce and prepare dressing'),(17,9,1,'Cut tofu and vegetables'),(18,9,2,'Stir fry in hot pan with soy sauce'),(19,10,1,'Mash bananas and mix with flour'),(20,10,2,'Cook pancakes on griddle'),(21,11,1,'Sauté mushrooms in olive oil'),(22,11,2,'Add rice and slowly incorporate broth'),(23,12,1,'Mix chia seeds with almond milk'),(24,12,2,'Refrigerate overnight and top with fruits'),(25,13,1,'Slice fresh mozzarella and tomatoes'),(26,13,2,'Layer on bread and grill'),(27,14,1,'Marinate tofu in gochujang sauce'),(28,14,2,'Grill tofu and serve with rice'),(29,15,1,'Blend frozen berries with yogurt'),(30,15,2,'Top with granola and seeds'),(31,16,1,'Brown ground beef with taco seasoning'),(32,16,2,'Warm tortillas and assemble tacos'),(33,17,1,'Mix protein powder with eggs'),(34,17,2,'Cook pancakes on griddle'),(35,18,1,'Cook quinoa according to package instructions'),(36,18,2,'Roast mixed vegetables and combine'),(37,19,1,'Prepare seafood and saffron base'),(38,19,2,'Cook rice and combine with seafood'),(39,20,1,'Roast cauliflower with curry paste'),(40,20,2,'Serve with additional garnishes'),(41,21,1,'Prepare green curry paste'),(42,21,2,'Simmer vegetables in coconut milk'),(43,22,1,'Blend acai powder with frozen fruits'),(44,22,2,'Top with nuts and seeds'),(45,23,1,'Arrange various Mediterranean dips'),(46,23,2,'Serve with fresh bread'),(47,24,1,'Marinate lamb in herb mixture'),(48,24,2,'Grill lamb skewers until cooked'),(49,25,1,'Blend protein powder with fruits'),(50,25,2,'Add ice and blend until smooth'),(51,26,1,'Prepare Vietnamese-style sandwich filling'),(52,26,2,'Toast baguette and assemble sandwich'),(53,27,1,'Prepare filling for stuffed peppers'),(54,27,2,'Bake stuffed peppers until golden'),(55,28,1,'Prepare spicy tomato sauce'),(56,28,2,'Poach eggs in the sauce'),(57,29,1,'Prepare sushi rice'),(58,29,2,'Assemble poke bowl with fresh tuna'),(59,30,1,'Slow cook lamb with spices'),(60,30,2,'Add preserved lemons near end of cooking'),(61,31,1,'Prepare vegetables and meat for bibimbap'),(62,31,2,'Assemble in a bowl with rice'),(63,32,1,'Mix chia seeds with coconut milk'),(64,32,2,'Refrigerate overnight and top with fruits'),(65,33,1,'Prepare gyros meat'),(66,33,2,'Assemble with tzatziki and pita'),(67,34,1,'Marinate chicken in butter chicken sauce'),(68,34,2,'Simmer in creamy tomato sauce'),(69,35,1,'Blend spinach with green apple'),(70,35,2,'Add ice and blend until smooth'),(71,36,1,'Layer ingredients for Cuban sandwich'),(72,36,2,'Press and grill until crispy'),(73,37,1,'Stir fry beef for Lomo Saltado'),(74,37,2,'Add French fries and serve'),(75,38,1,'Mix oats with matcha powder'),(76,38,2,'Refrigerate overnight'),(77,39,1,'Prepare sushi rice'),(78,39,2,'Roll into burrito-style wrap'),(79,40,1,'Prepare rich ramen broth'),(80,40,2,'Cook noodles and add toppings'),(81,41,1,'Marinate chicken in tikka masala spices'),(82,41,2,'Cook in creamy tomato sauce'),(83,42,1,'Fry chicken until crispy'),(84,42,2,'Prepare waffles and serve together'),(85,43,1,'Grill chicken with Caesar seasoning'),(86,43,2,'Wrap in tortilla with Caesar dressing'),(87,44,1,'Slice chicken and vegetables'),(88,44,2,'Sauté and serve sizzling'),(89,45,1,'Grill chicken breast'),(90,45,2,'Blend with protein powder and fruits'),(91,46,1,'Coat chicken in buffalo sauce'),(92,46,2,'Grill and serve on roll'),(93,47,1,'Marinate chicken in teriyaki sauce'),(94,47,2,'Grill and serve over rice'),(95,48,1,'Cook chicken and chop'),(96,48,2,'Mix with eggs and bake frittata'),(97,49,1,'Grill chicken breast'),(98,49,2,'Toss with pesto pasta'),(99,50,1,'Prepare coconut curry sauce'),(100,50,2,'Simmer chicken in sauce'),(101,51,1,'Marinate chicken in gochujang sauce'),(102,51,2,'Grill or bake until crispy'),(103,52,1,'Scramble chicken with eggs'),(104,52,2,'Fill and grill quesadilla'),(105,53,1,'Grill chicken and slice'),(106,53,2,'Prepare Mediterranean salad'),(107,54,1,'Prepare chicken filling'),(108,54,2,'Deep fry chimichanga'),(109,55,1,'Shred chicken'),(110,55,2,'Mix into pancake batter'),(111,56,1,'Slow cook chicken in BBQ sauce'),(112,56,2,'Shred and serve on sandwich'),(113,57,1,'Stir fry chicken'),(114,57,2,'Add cashews and sauce'),(115,58,1,'Prepare spicy tomato base'),(116,58,2,'Add chicken and poach eggs'),(117,59,1,'Grill and slice chicken'),(118,59,2,'Assemble in pita with tzatziki'),(119,60,1,'Marinate chicken in Moroccan spices'),(120,60,2,'Slow cook until tender'),(121,61,1,'Cook'),(122,62,1,'cuck');
/*!40000 ALTER TABLE `recipe_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_vitamin`
--

DROP TABLE IF EXISTS `recipe_vitamin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_vitamin` (
  `id_vitamin` int NOT NULL AUTO_INCREMENT,
  `id_nutrition` int NOT NULL,
  `calcium` float DEFAULT NULL,
  `iron` float DEFAULT NULL,
  `vitamin_a` float DEFAULT NULL,
  `vitamin_c` float DEFAULT NULL,
  `vitamin_d` float DEFAULT NULL,
  `vitamin_e` float DEFAULT NULL,
  `vitamin_k` float DEFAULT NULL,
  `vitamin_b1` float DEFAULT NULL,
  `vitamin_b2` float DEFAULT NULL,
  `vitamin_b3` float DEFAULT NULL,
  `vitamin_b5` float DEFAULT NULL,
  `vitamin_b6` float DEFAULT NULL,
  `vitamin_b12` float DEFAULT NULL,
  `fiber` float DEFAULT NULL,
  PRIMARY KEY (`id_vitamin`) USING BTREE,
  KEY `id_nutrition` (`id_nutrition`) USING BTREE,
  CONSTRAINT `recipe_vitamin_ibfk_1` FOREIGN KEY (`id_nutrition`) REFERENCES `recipe_nutrition` (`id_nutrition`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_vitamin`
--

LOCK TABLES `recipe_vitamin` WRITE;
/*!40000 ALTER TABLE `recipe_vitamin` DISABLE KEYS */;
INSERT INTO `recipe_vitamin` VALUES (1,1,50,2.5,15,10,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,2,75,3.2,20,15,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,3,100,2.8,10,8,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,4,80,3.5,25,20,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,5,120,4,30,25,8,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,6,50,2.5,15,10,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,7,75,3.2,20,15,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,8,100,2.8,10,8,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,9,80,3.5,25,20,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,10,120,4,30,25,8,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,11,120,3.5,25,15,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,12,150,2.8,20,25,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,13,100,2.5,15,10,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,14,80,3.2,30,20,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,15,90,4,35,25,8,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,16,110,3.7,28,18,5,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,17,130,2.9,22,15,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,18,95,3.3,26,22,7,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,19,140,4.1,32,19,8,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,20,105,3.6,27,23,5,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,21,95,3.5,25,30,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,22,120,2.8,20,45,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,23,80,3.2,35,25,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,24,110,4,15,10,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,25,130,2.5,40,35,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,26,100,3.7,28,40,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(27,27,85,3.3,32,20,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(28,28,140,4.2,22,15,8,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(29,29,75,3.6,38,50,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(30,30,115,3.9,25,35,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(31,31,110,3.5,25,30,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(32,32,95,2.8,20,45,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(33,33,130,3.2,35,25,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(34,34,80,4,15,10,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(35,35,140,2.5,40,35,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(36,36,100,3.7,28,40,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(37,37,85,3.3,32,20,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(38,38,120,4.2,22,15,8,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(39,39,75,3.6,38,50,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(40,40,115,3.9,25,35,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(41,41,120,3.5,25,30,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(42,42,95,2.8,20,45,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(43,43,130,3.2,35,25,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(44,44,80,4,15,10,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(45,45,140,2.5,40,35,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(46,46,100,3.7,28,40,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(47,47,85,3.3,32,20,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(48,48,110,4.2,22,15,8,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(49,49,75,3.6,38,50,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(50,50,115,3.9,25,35,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(51,51,100,3.5,25,30,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(52,52,120,2.8,20,45,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(53,53,85,3.2,35,25,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(54,54,110,4,15,10,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(55,55,130,2.5,40,35,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(56,56,95,3.7,28,40,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(57,57,80,3.3,32,20,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(58,58,115,4.2,22,15,8,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(59,59,90,3.6,38,50,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(60,60,105,3.9,25,35,7,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(61,61,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(62,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
/*!40000 ALTER TABLE `recipe_vitamin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes_contribution`
--

DROP TABLE IF EXISTS `recipes_contribution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes_contribution` (
  `id_recipe` int NOT NULL,
  `id_user` int NOT NULL,
  `accept_contribution` tinyint(1) NOT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_recipe`,`id_user`) USING BTREE,
  KEY `id_user` (`id_user`) USING BTREE,
  CONSTRAINT `recipes_contribution_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `recipes_contribution_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes_contribution`
--

LOCK TABLES `recipes_contribution` WRITE;
/*!40000 ALTER TABLE `recipes_contribution` DISABLE KEYS */;
INSERT INTO `recipes_contribution` VALUES (1,1,1,'2024-12-19 01:44:02'),(2,1,1,'2024-11-19 01:44:02'),(3,1,1,'2024-10-19 01:44:02'),(4,1,1,'2024-12-19 01:44:02'),(5,1,1,'2024-12-19 01:44:02'),(6,1,1,'2024-12-19 01:44:02'),(7,1,1,'2024-12-19 01:44:02'),(8,1,1,'2024-12-19 01:44:02'),(9,1,1,'2024-12-19 01:44:02'),(10,1,1,'2024-12-19 01:44:02'),(11,1,1,'2024-12-19 01:44:02'),(12,1,1,'2024-12-19 01:44:02'),(13,1,1,'2024-12-19 01:44:02'),(14,1,1,'2024-12-19 01:44:02'),(15,1,1,'2024-12-19 01:44:02'),(16,1,1,'2024-12-19 01:44:02'),(17,1,1,'2024-12-19 01:44:02'),(18,1,1,'2024-12-19 01:44:02'),(19,1,1,'2024-12-19 01:44:02'),(20,1,1,'2024-12-19 01:44:02'),(21,1,1,'2024-12-19 01:44:02'),(22,1,1,'2024-12-19 01:44:02'),(23,1,1,'2024-12-19 01:44:02'),(24,1,1,'2024-12-19 01:44:02'),(25,1,1,'2024-12-19 01:44:02'),(26,1,1,'2024-12-19 01:44:02'),(27,1,1,'2024-12-19 01:44:02'),(28,1,1,'2024-12-19 01:44:02'),(29,1,1,'2024-12-19 01:44:02'),(30,1,1,'2024-12-19 01:44:02'),(31,1,1,'2024-12-19 01:44:02'),(32,1,1,'2024-12-19 01:44:02'),(33,1,1,'2024-12-19 01:44:02'),(34,1,1,'2024-12-19 01:44:02'),(35,1,1,'2024-12-19 01:44:02'),(36,1,1,'2024-12-19 01:44:02'),(37,1,1,'2024-12-19 01:44:02'),(38,1,1,'2024-12-19 01:44:02'),(39,1,1,'2024-12-19 01:44:02'),(40,1,1,'2024-12-19 01:44:02'),(41,1,1,'2024-12-19 01:44:02'),(42,1,1,'2024-12-19 01:44:02'),(43,1,1,'2024-12-19 01:44:02'),(44,1,1,'2024-12-19 01:44:02'),(45,2,1,'2024-12-19 01:44:02'),(46,2,1,'2024-12-19 01:44:02'),(47,2,1,'2024-12-19 01:44:02'),(48,2,1,'2024-12-19 01:44:02'),(49,2,1,'2024-12-19 01:44:02'),(50,2,1,'2024-12-19 01:44:02'),(51,2,1,'2024-12-19 01:44:02'),(52,2,1,'2024-10-19 01:44:02'),(53,2,1,'2024-10-19 01:44:02'),(54,2,1,'2024-09-19 01:44:02'),(55,2,1,'2024-12-19 01:44:02'),(56,2,0,'2024-12-19 01:44:02'),(57,2,0,'2024-12-19 01:44:02'),(58,2,0,'2024-12-19 01:44:02'),(59,2,2,'2024-12-19 01:44:02'),(60,2,1,'2024-11-19 01:44:02'),(61,2,0,'2024-10-19 01:44:02'),(62,1,0,'2024-12-19 01:44:02');
/*!40000 ALTER TABLE `recipes_contribution` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes_favourite`
--

DROP TABLE IF EXISTS `recipes_favourite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes_favourite` (
  `id_recipe` int NOT NULL,
  `id_user` int NOT NULL,
  PRIMARY KEY (`id_recipe`,`id_user`) USING BTREE,
  KEY `id_user` (`id_user`) USING BTREE,
  CONSTRAINT `recipes_favourite_ibfk_1` FOREIGN KEY (`id_recipe`) REFERENCES `recipe_info` (`id_recipe`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `recipes_favourite_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes_favourite`
--

LOCK TABLES `recipes_favourite` WRITE;
/*!40000 ALTER TABLE `recipes_favourite` DISABLE KEYS */;
INSERT INTO `recipes_favourite` VALUES (1,2),(5,2),(6,2),(8,2),(9,2),(43,2),(52,2);
/*!40000 ALTER TABLE `recipes_favourite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reset_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `reset_code_expiration` datetime DEFAULT NULL,
  `reset_attempts` int NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id_user`) USING BTREE,
  UNIQUE KEY `username` (`username`) USING BTREE,
  UNIQUE KEY `email` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','scrypt:32768:8:1$nSS2bDUhQyY0hHSw$31b06df7e2302c0ed47bfaf6ebc1cda87a153f453f2dc088763573ae35a7709bcb56e41a08dfa0537e6a09770cad4db91332595b3b206c0734e3309612487a12','admin@gmail.com',NULL,NULL,0,'hidden'),(2,'camly','scrypt:32768:8:1$PVEyzPQcabYcfPSX$2028ccc86c6abd8670760f8193ce4bddce9f77276ee94d62a2e84f8b407b241e60afe857b1187ae074c9ba50457a7c78398b26ff6b03e2f13eaeca1986c33ffe','nguyenthicamly1112@gmail.com','950963','2024-12-17 16:14:21',0,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_daily_nutrition_goal`
--

DROP TABLE IF EXISTS `user_daily_nutrition_goal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_daily_nutrition_goal` (
  `id_goal` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `calories_goal` float DEFAULT NULL,
  `fat_goal` float DEFAULT NULL,
  `protein_goal` float DEFAULT NULL,
  `carbohydrate_goal` float DEFAULT NULL,
  `sugar_goal` float DEFAULT NULL,
  `sodium_goal` float DEFAULT NULL,
  `cholesterol_goal` float DEFAULT NULL,
  `fiber_goal` float DEFAULT NULL,
  PRIMARY KEY (`id_goal`) USING BTREE,
  KEY `id_user` (`id_user`) USING BTREE,
  CONSTRAINT `user_daily_nutrition_goal_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_daily_nutrition_goal`
--

LOCK TABLES `user_daily_nutrition_goal` WRITE;
/*!40000 ALTER TABLE `user_daily_nutrition_goal` DISABLE KEYS */;
INSERT INTO `user_daily_nutrition_goal` VALUES (1,2,1600,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `user_daily_nutrition_goal` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-19  2:18:18
