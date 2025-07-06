-- phpMyAdmin SQL Dump
-- version 5.0.4deb2+deb11u2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 04, 2025 at 11:00 PM
-- Server version: 10.5.29-MariaDB-0+deb11u1
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `byx`
--

-- --------------------------------------------------------

--
-- Table structure for table `users4`
--

CREATE TABLE `users4` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png',
  `join_whops` text DEFAULT NULL,
  `own_whops` text DEFAULT NULL,
  `approx_location` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `balance` decimal(16,8) NOT NULL DEFAULT 0.00000000,
  `deposit_address` varchar(44) DEFAULT NULL,
  `deposit_secret` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `accepted_terms` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users4`
--

INSERT INTO `users4` (`id`, `username`, `name`, `bio`, `email`, `phone`, `avatar_url`, `join_whops`, `own_whops`, `approx_location`, `password_hash`, `created_at`, `balance`, `deposit_address`, `deposit_secret`) VALUES
(15, 'jakub', 'Jacob.', '', 'jakub@gmail.com', '', 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1750025848/sc7iiq87felaxdxunfkt.jpg', NULL, NULL, NULL, '$2y$10$jcbzk4ipr8jphv2chBHReeCLT8v0iJK4d2s/kvXrOR.TeBHiKY1xW', '2025-06-06 01:45:22', '1757.84600000', '5peoXRJBJNSBav5hLQ17GGGujH2TwXWk5V5J6cdkKhVf', '3JABvCMNqjSTmddi2cVjE91u3FUjysaf1NCLi5qpMbGVtCKj6yTkyiJm8DFAo3uXYrnXeeCxgLZSVgyMQ2QA1Any'),
(16, 'marekefew', 'gmm', '', 'notfunnymarek@gmail.com', '', 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749207732/rjo2w5lkvndmrobadt65.png', NULL, NULL, NULL, '$2y$10$gWDkD2.VDjukBoO/7Q9hTei51POCgF8j3sapfVyrPo8rjn5LMrtxu', '2025-06-06 01:58:54', '0.25500000', 'EM8cWtrf72tDtg5hj9L3Fy11XqjpffmDz7A2iqi6Cb1g', '4JDsPsKPa1BCRAAAPTKavuQkhKyUFksvbwuJkkCVnT7vWsyrp2XFPnrxMsxRRngv9TMkSGEc1HMnNEwZMEdtUeHU'),
(17, 'keotoertetr', NULL, NULL, 'keotoertetr@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$4PVeDsksSoP7uba4MY9jrOMEaBjZaSd/ckXTAQUrvGBT/AHWBm2m6', '2025-06-06 03:13:00', '0.00000000', NULL, NULL),
(18, 'testdeposit', '', NULL, 'testdeposit@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$N9/0L203GxoU82Btpqj4uOCoy8lcYtuJSRWXZYhSZc3AhJecOelV.', '2025-06-06 10:17:50', '29.53800000', 'AC1rSPi7ae2DUKVu7f12ndWzYTq5JmsTEJ7T5ZrTdLzN', '2mRk6oPYmbYqEH1B2RP8XdUKEaHz1mdHqFxqQHMHjYBqt4Nu5TtcT9U6hMPnZqH5fVces4TsBxUPkgXrU5MZNRXQ'),
(20, 'marekmain', NULL, NULL, 'marekmain@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$XWrzWCgxUskbwWGTPLQtheN7B.TVy5hxn6F/GGxyroBHuvC0mIS.i', '2025-06-06 13:09:14', '0.00000000', '46NaL8Rvb7pYU3H3C7HsfHZeBtbpcZZuHaPbd3JXvSYe', '5zwYYr3xUsiXkK5ytrkgz2Y8rzjtX4CfDHzD9Q5As8feMGhhtric9pnBKDzeeQSytBH1fseC8vYCX1PvGTdc234i'),
(21, 'marekmain2', 'marekhtrjztkiufe', 'geerhrtrhtrhrgrtr', 'marekmain2@gmail.com', '', 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749230612/b7yfcx09ebgucdpyropq.png', NULL, NULL, NULL, '$2y$10$mu8oqKAyuqbppUXYTOpPeuF.ehn6xNbZBxcdNA104xG0whXRD.nEe', '2025-06-06 13:10:13', '1407.88435886', '2EB5sRSQMRHb4mabZ2r9gQQdE59xisKqXYci5aCFtVZj', '2hCfvbM3atPa9iXnXhWhAMTyfeLtfK6bSSb3uKscsbjxN8YMxRKPmSRgvkkQ3monnMtGPrsdKv2ZTUYbVgsW62t9'),
(22, 'testusernormalgre', 'GERGE', 'rthrtrhtrgehtr', 'test@gmai.com', '', 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749502720/pa0rpbz1f1fe2i1imd9g.png', NULL, NULL, NULL, '$2y$10$f7nQPy11.k8O0h3vRADkEuBF/KayIGgnqfo46BXvg1PGOazUNk3vG', '2025-06-06 20:38:43', '0.33247276', '3WyMqGp7HSjc58K1EmW79y78EpKiv1TJFA69nU3QFLns', 'cbY9StX4fqigXw7D6znaQ6F2wT2QaVK13xtJtPgFvaQqGmwuKWMVd9qVcD1Begw8QheDeSTcBK9pbv7KP49Ez2B'),
(23, 'jakubmember', NULL, NULL, 'jakubmember@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$Ou1Ol92f/6O.ziZRbd9nFeB5EtgwX7fC0RVMYn1uE8cwi5NqC6y8e', '2025-06-10 22:32:30', '48.31000000', 'DzJhrGjGNXDkgS3fwfbm4vGGkiC672vktnp4VKy5Xf3C', '4z4z8N8qQ2AQc9dHGEt7JhxJgMRaiatuSEfJELTgLUZcMBXDvWLFMyKniSJcFogWQmK1D2Sp5G1Bub3CuM7NdGBx'),
(24, 'kokot1234', '12jz3thtr', 'jt', 'kokot123@gmail.com', '', 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$PtV/OWXQk87ctxLt.fzCk.wBRZOnNe91FaQrsotNVitKS4NLR7sNK', '2025-06-15 20:03:32', '0.40000000', 'APGGHeosA7LCsayhz2ARUEA9NpdymcRKZw9PnqTQre44', '5drnUm28otAY2NPgyYLChXt2e7NRu8UoGcArH3wXzuvNEbomRKzbbSXCCDxVttX13Bo7GXY9WcoFEkGYNdF2dGMi'),
(25, 'kokotleo', NULL, NULL, 'krten@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$cYX/RXC.ewkqCVYyIAxlzet/nTtSOs1BHUIUTetokmvPHdmFaCNae', '2025-06-15 20:46:27', '0.00000000', 'D6BHy33Xkd8hm7nEUVojHqmciXpwqv3RD5GynjgkrXti', '3tst6sL6egXETS9hQNYV3HD3Hu5VjYa9XKqKaKazZQhieCUUmsKWtPBynG7j14GXtqoUqbswCbc852B2mkZGghw4'),
(26, 'kkt123456', NULL, NULL, 'kkt12345@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$ijSL5yoN7n2ZQjjmFewLYOE.gXCAT6F4R7BiTBWI5UQbw5P95TVTG', '2025-06-15 20:47:03', '390.02630085', 'CrmLj3keUWCamUroFtK8zXMc8SRSRwtySKJp2b9HQbek', '4tnetjk2Q4BkRb2oNYKuAnychwmxUW43XR89b1xZ1gBoJsdhv8HFAMcU8NvNwi2rTri8vVzom9d2z85JZqwo8jUp'),
(27, 'Test Nigga', NULL, NULL, 'access12345678@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$ziRpZ2CSurFTowrI4rrkXe/fHZiZ/5PwoQwIsktdYjMtWoFZP2g7O', '2025-06-16 16:33:38', '0.00000000', 'BnCxH6myQskJVnWZwuWbhbzRMfMtLYoaXn6fwxEStCFJ', '3ak5TFLrQ5ocWqrpQo4iJatLaCtWBQK15To7g2KzhR7RCLYjZpYCjwTQKmZh8NGDYatNVyGqdXkhbBFjm3beZoap'),
(28, 'Testnigga', NULL, NULL, 'testnigga@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$IXLSf9HQoyID8PFW70rbKuFv7H/I0k6Umn8Z3invC7jeLcvBn6DUK', '2025-06-16 16:34:34', '0.00000000', '5DptsY5fysqmeLwa5ZR6V6u1iC7kRLBov1C8uCuYDP1y', '3vHwtdmv14U3WwZyBFVNuLRUDshqjyHxJPobP6dKtemN5JrjyL7VQ4J2fZrrr84jEGbS4kRVEmX9f5WdJDBnUMbM'),
(29, 'negr123', NULL, NULL, 'kokotleo@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$48AMfn8RwewghFBQao6YJu6R3LhA1WRB0JZdH9i1sstRHTqyFRONO', '2025-06-22 12:10:45', '63.99999921', '7DxNvoMfU4TVdBxD7iupRaRsgYvDYZK6yLabeU1B7PKC', '57VF8oKAUEVw1DwD4UpRgnYFaiRBxzjnbguGXba8b13ZcgScQQpnCGo6kW6LkXCPJ3ucsTt6VGnXo9zQB3ZXx48E'),
(30, 'test', NULL, NULL, 'test@test.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$BEptcn5WGZLeAwe.XbG9cOe/c31VA.Q8ltf0QMC3FKGkRfg.e.2VG', '2025-06-24 21:57:40', '0.00000000', '5wwwRvCoPZESTEHdwJ5sN3Gw7qBkXz48ot8GhnCdrpTG', 'Z6AMgAaBESSWtRwjZ9PoW8TM6nmoRyfjgYBMWUTHMKQxYEfEHm26pZn1Xr1CX8bHTvDBeAnnQu2AAbyp2SuNvUW'),
(31, 'Test.net', NULL, NULL, 'testnet@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$bygoxkGN/GYroZiZxZfry.uI3yGO5J8Na4qeEETJIXhgUB1x0OxAy', '2025-06-27 06:55:35', '0.00000000', 'FE2v12fgy1Sphi9cbJT44mtEEjEpiDxnFDmDJPZZqu72', '218LpeAXn5DaLsDqJWNuAH6WXtHJ7ECNg8vZ3ttVmEwoshZwDLRNcvbwZuzGR4YfPbBqZdKwEPAL6GMBf6eHjJpt'),
(32, 'kokot46884846', NULL, NULL, 'hell.mailbusiness@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$E/SVb9Qozd5mMakVZxnNheXDlrA.VingQ6ZpwB/W3wBhmRSlqR.1.', '2025-06-29 14:39:24', '0.00000000', 'E3u21pVwSDQXZbrtwku93sbG3WsTGvpaUhBMLQMDoaF8', '2eQbBp7A2pdnwAvc2dM2fZDeWqRJSKsWuAeJYgaH94DFRB5B8aqEEWtZSxvQUrdBoDZXjyWZRWRJAP4CSHNKoEk6'),
(36, 'verifybyx', NULL, NULL, 'verify.byx@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$RDzjP4V7XPsUko11Ts7oCuG3mEnRC9/wdAt5CAlVkTw6HkLPAu/j.', '2025-07-04 17:43:44', '0.00000000', NULL, NULL),
(37, 'welthwing', NULL, NULL, 'welthwing@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$LWiDyLKtc/5yZluMUxEsP.5kMkyixY/WYiNp8G0UXhHaHot/D5hW.', '2025-07-04 17:52:11', '0.00000000', NULL, NULL),
(38, 'prosteejakubb', NULL, NULL, 'prostee.jakubb@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$z8GvLZaL7K3WjNudexQmP.ml0rhhBlEyTYUr0q34Z9daM6wNSQy5q', '2025-07-04 18:23:54', '0.00000000', NULL, NULL),
(40, 'swaggermarek', 'few', '515', 'swaggermarek@gmail.com', '', 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1751657759/p9p4cc169qiyqn68okj9.jpg', NULL, NULL, NULL, '$2y$10$H8RwJrky.lPFl7EM9Bx5ieDt3lPCbc0dz4LEjOdPX45zig6qmoagW', '2025-07-04 21:35:46', '0.00000000', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users4`
--
ALTER TABLE `users4`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `unique_username` (`username`),
  ADD UNIQUE KEY `unique_name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users4`
--
ALTER TABLE `users4`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
