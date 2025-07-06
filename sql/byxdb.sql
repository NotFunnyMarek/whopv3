-- phpMyAdmin SQL Dump
-- version 5.0.4deb2+deb11u2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 06, 2025 at 02:52 PM
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
-- Table structure for table `affiliate`
--

CREATE TABLE `affiliate` (
  `id` int(11) NOT NULL,
  `affiliateId` varchar(255) NOT NULL,
  `coinsCreated` int(11) NOT NULL DEFAULT 0,
  `reward` decimal(10,2) NOT NULL DEFAULT 0.00,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `level` int(11) NOT NULL DEFAULT 1,
  `linkOpens` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `affiliate`
--

INSERT INTO `affiliate` (`id`, `affiliateId`, `coinsCreated`, `reward`, `createdAt`, `updatedAt`, `level`, `linkOpens`) VALUES
(5, 'EbnC5', 0, '0.00', '2025-03-14 23:04:18', '2025-03-19 22:58:57', 1, 25);

-- --------------------------------------------------------

--
-- Table structure for table `auth`
--

CREATE TABLE `auth` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `balance_btc` decimal(18,8) DEFAULT 0.00000000,
  `balance_eth` decimal(18,8) DEFAULT 0.00000000,
  `balance_sol` decimal(18,8) DEFAULT 0.00000000,
  `wallet_btc` varchar(255) DEFAULT NULL,
  `wallet_eth` varchar(255) DEFAULT NULL,
  `wallet_sol` varchar(255) DEFAULT NULL,
  `balance_usdt` decimal(18,8) DEFAULT 0.00000000,
  `balance_usdc` decimal(18,8) DEFAULT 0.00000000,
  `wallet_btc_network` varchar(50) DEFAULT NULL,
  `wallet_eth_network` varchar(50) DEFAULT NULL,
  `wallet_sol_network` varchar(50) DEFAULT NULL,
  `wallet_usdt` varchar(255) DEFAULT NULL,
  `wallet_usdt_network` varchar(50) DEFAULT NULL,
  `wallet_usdc` varchar(255) DEFAULT NULL,
  `wallet_usdc_network` varchar(50) DEFAULT NULL,
  `lifetransfers` text DEFAULT NULL,
  `positions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`positions`)),
  `balance_xrp` double DEFAULT 0,
  `wallet_xrp` varchar(255) DEFAULT NULL,
  `wallet_xrp_network` varchar(50) DEFAULT NULL,
  `balance_doge` double DEFAULT 0,
  `wallet_doge` varchar(255) DEFAULT NULL,
  `wallet_doge_network` varchar(50) DEFAULT NULL,
  `balance_bonk` double DEFAULT 0,
  `wallet_bonk` varchar(255) DEFAULT NULL,
  `wallet_bonk_network` varchar(50) DEFAULT NULL,
  `balance_inj` double DEFAULT 0,
  `wallet_inj` varchar(255) DEFAULT NULL,
  `wallet_inj_network` varchar(50) DEFAULT NULL,
  `balance_bnb` double DEFAULT 0,
  `balance_matic` double DEFAULT 0,
  `wallet_matic` varchar(255) DEFAULT NULL,
  `wallet_matic_network` varchar(255) DEFAULT NULL,
  `balance_busd` double DEFAULT 0,
  `wallet_busd` varchar(255) DEFAULT NULL,
  `wallet_busd_network` varchar(255) DEFAULT NULL,
  `balance_ada` double DEFAULT 0,
  `wallet_ada` varchar(255) DEFAULT NULL,
  `wallet_ada_network` varchar(255) DEFAULT NULL,
  `balance_trx` double DEFAULT 0,
  `wallet_trx` varchar(255) DEFAULT NULL,
  `wallet_trx_network` varchar(255) DEFAULT NULL,
  `balance_ltc` double DEFAULT 0,
  `wallet_ltc` varchar(255) DEFAULT NULL,
  `wallet_ltc_network` varchar(255) DEFAULT NULL,
  `balance_avax` double DEFAULT 0,
  `wallet_avax` varchar(255) DEFAULT NULL,
  `wallet_avax_network` varchar(255) DEFAULT NULL,
  `balance_dot` double DEFAULT 0,
  `wallet_dot` varchar(255) DEFAULT NULL,
  `wallet_dot_network` varchar(255) DEFAULT NULL,
  `balance_atom` double DEFAULT 0,
  `wallet_atom` varchar(255) DEFAULT NULL,
  `wallet_atom_network` varchar(255) DEFAULT NULL,
  `balance_shib` double DEFAULT 0,
  `wallet_shib` varchar(255) DEFAULT NULL,
  `wallet_shib_network` varchar(255) DEFAULT NULL,
  `balance_link` double DEFAULT 0,
  `wallet_link` varchar(255) DEFAULT NULL,
  `wallet_link_network` varchar(255) DEFAULT NULL,
  `balance_arb` double DEFAULT 0,
  `wallet_arb` varchar(255) DEFAULT NULL,
  `wallet_arb_network` varchar(255) DEFAULT NULL,
  `balance_op` double DEFAULT 0,
  `wallet_op` varchar(255) DEFAULT NULL,
  `wallet_op_network` varchar(255) DEFAULT NULL,
  `wallet_bnb` varchar(255) DEFAULT NULL,
  `wallet_bnb_network` varchar(50) DEFAULT NULL,
  `balance_staking` decimal(20,8) NOT NULL DEFAULT 0.00000000,
  `staking_bonus` decimal(20,8) NOT NULL DEFAULT 0.00000000,
  `staking_btc` float DEFAULT 0,
  `staking_bonus_btc` float DEFAULT 0,
  `staking_xrp` float DEFAULT 0,
  `staking_bonus_xrp` float DEFAULT 0,
  `perms` varchar(50) DEFAULT NULL,
  `custom_wallet_request` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `auth`
--

INSERT INTO `auth` (`id`, `email`, `username`, `password`, `balance_btc`, `balance_eth`, `balance_sol`, `wallet_btc`, `wallet_eth`, `wallet_sol`, `balance_usdt`, `balance_usdc`, `wallet_btc_network`, `wallet_eth_network`, `wallet_sol_network`, `wallet_usdt`, `wallet_usdt_network`, `wallet_usdc`, `wallet_usdc_network`, `lifetransfers`, `positions`, `balance_xrp`, `wallet_xrp`, `wallet_xrp_network`, `balance_doge`, `wallet_doge`, `wallet_doge_network`, `balance_bonk`, `wallet_bonk`, `wallet_bonk_network`, `balance_inj`, `wallet_inj`, `wallet_inj_network`, `balance_bnb`, `balance_matic`, `wallet_matic`, `wallet_matic_network`, `balance_busd`, `wallet_busd`, `wallet_busd_network`, `balance_ada`, `wallet_ada`, `wallet_ada_network`, `balance_trx`, `wallet_trx`, `wallet_trx_network`, `balance_ltc`, `wallet_ltc`, `wallet_ltc_network`, `balance_avax`, `wallet_avax`, `wallet_avax_network`, `balance_dot`, `wallet_dot`, `wallet_dot_network`, `balance_atom`, `wallet_atom`, `wallet_atom_network`, `balance_shib`, `wallet_shib`, `wallet_shib_network`, `balance_link`, `wallet_link`, `wallet_link_network`, `balance_arb`, `wallet_arb`, `wallet_arb_network`, `balance_op`, `wallet_op`, `wallet_op_network`, `wallet_bnb`, `wallet_bnb_network`, `balance_staking`, `staking_bonus`, `staking_btc`, `staking_bonus_btc`, `staking_xrp`, `staking_bonus_xrp`, `perms`, `custom_wallet_request`) VALUES
(9, 'angiecaldwell7@autlook.com', 'Angiecaldwell7', '$2y$10$iF65iKm8QCqAMME4JCPNkeKFvHnT2rUSvQzLe2Q8nBctR/0V0MD.C', '0.00000000', '0.00000000', '0.00000000', 'bc1qu7lqzr4rtn0efel7ewd4rd9s0rc4wl6uhh56yz', '0xb94b71d9f7bCBfc9377B0b3e8945B2E5d20D3585', '74Mw9ch6MXKjhMNpx4ytuPje3aSrJVqYXbR2L88Uxwfb', '0.00000000', '0.00000000', 'ERC-20', 'ERC-20', 'Sol', '0xb94b71d9f7bCBfc9377B0b3e8945B2E5d20D3585', 'ERC-20', '0x4997a3777d0319dfc429c815607e19ad4271e4a1', 'ERC-20', '[{\"coin\":\"ETH\",\"amount\":0.00578346,\"usd_value\":11.56692,\"time\":\"2025-02-24 23:30:18\"},{\"coin\":\"SOL\",\"amount\":0.09140733,\"usd_value\":4.5703664999999996,\"time\":\"2025-02-24 23:30:22\"},{\"coin\":\"SOL\",\"amount\":0.0238311,\"usd_value\":1.1915550000000001,\"time\":\"2025-02-24 23:30:34\"},{\"coin\":\"SOL\",\"amount\":0.0598565,\"usd_value\":2.992825,\"time\":\"2025-02-24 23:30:44\"},{\"coin\":\"SOL\",\"amount\":0.09425197,\"usd_value\":4.7125985,\"time\":\"2025-02-24 23:30:54\"},{\"coin\":\"USDT\",\"amount\":12.13,\"usd_value\":12.13,\"time\":\"2025-02-24 23:31:04\"},{\"coin\":\"ETH\",\"amount\":0.00191922,\"usd_value\":3.83844,\"time\":\"2025-02-24 23:31:14\"},{\"coin\":\"SOL\",\"amount\":0.04322965,\"usd_value\":2.1614825,\"time\":\"2025-02-24 23:31:24\"},{\"coin\":\"ETH\",\"amount\":4.789e-5,\"usd_value\":0.09577999999999999,\"time\":\"2025-02-24 23:32:18\"},{\"coin\":\"BTC\",\"amount\":0.00010769,\"usd_value\":3.2306999999999997,\"time\":\"2025-02-24 23:32:53\"},{\"coin\":\"USDT\",\"amount\":79.67,\"usd_value\":79.67,\"time\":\"2025-02-24 23:33:11\"},{\"coin\":\"USDC\",\"amount\":74.18,\"usd_value\":74.18,\"time\":\"2025-02-24 23:33:21\"},{\"coin\":\"BTC\",\"amount\":0.00090114,\"usd_value\":27.034200000000002,\"time\":\"2025-02-24 23:33:31\"},{\"coin\":\"BTC\",\"amount\":0.00066603,\"usd_value\":19.9809,\"time\":\"2025-02-24 23:33:55\"},{\"coin\":\"USDT\",\"amount\":13.63,\"usd_value\":13.63,\"time\":\"2025-02-24 23:34:05\"},{\"coin\":\"USDT\",\"amount\":8.85,\"usd_value\":8.85,\"time\":\"2025-02-24 23:34:15\"},{\"coin\":\"USDC\",\"amount\":63.75,\"usd_value\":63.75,\"time\":\"2025-02-24 23:34:25\"},{\"coin\":\"SOL\",\"amount\":0.07144687,\"usd_value\":3.5723434999999997,\"time\":\"2025-02-24 23:34:35\"},{\"coin\":\"USDC\",\"amount\":51.59,\"usd_value\":51.59,\"time\":\"2025-02-24 23:34:45\"},{\"coin\":\"SOL\",\"amount\":0.01439098,\"usd_value\":0.719549,\"time\":\"2025-02-24 23:35:18\"},{\"coin\":\"SOL\",\"amount\":0.02722803,\"usd_value\":1.3614015,\"time\":\"2025-02-24 23:36:18\"},{\"coin\":\"USDC\",\"amount\":7.76,\"usd_value\":7.76,\"time\":\"2025-02-24 23:37:03\"},{\"coin\":\"SOL\",\"amount\":0.07993489,\"usd_value\":3.9967444999999997,\"time\":\"2025-02-24 23:37:04\"},{\"coin\":\"USDC\",\"amount\":16.76,\"usd_value\":16.76,\"time\":\"2025-02-24 23:37:14\"},{\"coin\":\"USDC\",\"amount\":40.58,\"usd_value\":40.58,\"time\":\"2025-02-24 23:37:30\"},{\"coin\":\"USDC\",\"amount\":67.43,\"usd_value\":67.43,\"time\":\"2025-02-24 23:37:40\"},{\"coin\":\"SOL\",\"amount\":0.05914861,\"usd_value\":2.9574305,\"time\":\"2025-02-24 23:37:50\"},{\"coin\":\"SOL\",\"amount\":0.05557905,\"usd_value\":2.7789525,\"time\":\"2025-02-24 23:38:00\"},{\"coin\":\"BTC\",\"amount\":0.00038945,\"usd_value\":11.6835,\"time\":\"2025-02-24 23:38:10\"},{\"coin\":\"USDC\",\"amount\":87.27,\"usd_value\":87.27,\"time\":\"2025-02-24 23:38:20\"},{\"coin\":\"SOL\",\"amount\":0.01919286,\"usd_value\":0.9596429999999999,\"time\":\"2025-02-24 23:39:09\"},{\"coin\":\"USDC\",\"amount\":51.03,\"usd_value\":51.03,\"time\":\"2025-02-24 23:39:27\"},{\"coin\":\"USDT\",\"amount\":43.82,\"usd_value\":43.82,\"time\":\"2025-02-24 23:39:38\"},{\"coin\":\"ETH\",\"amount\":0.00366802,\"usd_value\":7.336040000000001,\"time\":\"2025-02-24 23:39:48\"},{\"coin\":\"ETH\",\"amount\":0.00033682,\"usd_value\":0.67364,\"time\":\"2025-02-24 23:39:58\"},{\"coin\":\"ETH\",\"amount\":0.00305855,\"usd_value\":6.117100000000001,\"time\":\"2025-02-24 23:40:08\"},{\"coin\":\"ETH\",\"amount\":0.00012164,\"usd_value\":0.24328,\"time\":\"2025-02-24 23:49:34\"},{\"coin\":\"USDT\",\"amount\":49.63,\"usd_value\":49.63,\"time\":\"2025-02-24 23:49:44\"},{\"coin\":\"USDT\",\"amount\":3.03,\"usd_value\":3.03,\"time\":\"2025-02-24 23:50:12\"},{\"coin\":\"USDT\",\"amount\":76.32,\"usd_value\":76.32,\"time\":\"2025-02-24 23:50:22\"},{\"coin\":\"USDT\",\"amount\":88.54,\"usd_value\":88.54,\"time\":\"2025-02-24 23:50:32\"},{\"coin\":\"USDT\",\"amount\":41.73,\"usd_value\":41.73,\"time\":\"2025-02-25 12:54:35\"},{\"coin\":\"USDT\",\"amount\":56.59,\"usd_value\":56.59,\"time\":\"2025-02-25 12:54:50\"},{\"coin\":\"SOL\",\"amount\":0.02657892,\"usd_value\":1.328946,\"time\":\"2025-02-25 20:39:01\"},{\"coin\":\"USDC\",\"amount\":68.78,\"usd_value\":68.78,\"time\":\"2025-02-25 20:39:11\"},{\"coin\":\"USDT\",\"amount\":98.57,\"usd_value\":98.57,\"time\":\"2025-02-25 20:39:21\"},{\"coin\":\"USDT\",\"amount\":10.76,\"usd_value\":10.76,\"time\":\"2025-02-25 20:39:31\"},{\"coin\":\"ETH\",\"amount\":0.00763863,\"usd_value\":15.27726,\"time\":\"2025-02-25 20:39:41\"},{\"coin\":\"SOL\",\"amount\":0.07420183,\"usd_value\":3.7100915,\"time\":\"2025-02-25 20:39:51\"},{\"coin\":\"BTC\",\"amount\":0.00017027,\"usd_value\":5.1081,\"time\":\"2025-02-25 20:40:01\"},{\"coin\":\"USDT\",\"amount\":1.13,\"usd_value\":1.13,\"time\":\"2025-02-25 20:40:11\"},{\"coin\":\"SOL\",\"amount\":0.05500594,\"usd_value\":2.750297,\"time\":\"2025-02-25 20:40:21\"},{\"coin\":\"USDT\",\"amount\":6.77,\"usd_value\":6.77,\"time\":\"2025-02-25 20:40:31\"},{\"coin\":\"SOL\",\"amount\":0.05620263,\"usd_value\":2.8101315000000002,\"time\":\"2025-02-25 20:40:41\"},{\"coin\":\"USDC\",\"amount\":97.9,\"usd_value\":97.9,\"time\":\"2025-02-25 20:40:51\"},{\"coin\":\"USDC\",\"amount\":86.15,\"usd_value\":86.15,\"time\":\"2025-02-25 20:41:01\"},{\"coin\":\"ETH\",\"amount\":0.00268139,\"usd_value\":5.36278,\"time\":\"2025-02-25 20:41:11\"},{\"coin\":\"ETH\",\"amount\":0.00483615,\"usd_value\":9.6723,\"time\":\"2025-02-25 20:41:21\"},{\"coin\":\"USDT\",\"amount\":46.5,\"usd_value\":46.5,\"time\":\"2025-02-25 20:41:31\"},{\"coin\":\"USDT\",\"amount\":34.13,\"usd_value\":34.13,\"time\":\"2025-02-25 20:41:41\"},{\"coin\":\"USDT\",\"amount\":93.64,\"usd_value\":93.64,\"time\":\"2025-02-25 20:41:51\"},{\"coin\":\"ETH\",\"amount\":0.004686,\"usd_value\":9.372,\"time\":\"2025-02-25 20:42:01\"},{\"coin\":\"SOL\",\"amount\":0.02518183,\"usd_value\":1.2590915,\"time\":\"2025-02-25 20:42:11\"},{\"coin\":\"ETH\",\"amount\":0.00630671,\"usd_value\":12.61342,\"time\":\"2025-02-25 20:42:21\"},{\"coin\":\"BTC\",\"amount\":0.00041059,\"usd_value\":12.3177,\"time\":\"2025-02-25 20:42:31\"},{\"coin\":\"BTC\",\"amount\":0.00022525,\"usd_value\":6.7575,\"time\":\"2025-02-25 20:42:41\"},{\"coin\":\"SOL\",\"amount\":0.03199193,\"usd_value\":1.5995965,\"time\":\"2025-02-25 20:42:51\"},{\"coin\":\"USDC\",\"amount\":95.17,\"usd_value\":95.17,\"time\":\"2025-02-25 20:43:01\"},{\"coin\":\"SOL\",\"amount\":0.0054328,\"usd_value\":0.27164,\"time\":\"2025-02-25 20:43:11\"},{\"coin\":\"USDC\",\"amount\":75.21,\"usd_value\":75.21,\"time\":\"2025-02-25 20:43:21\"},{\"coin\":\"BTC\",\"amount\":0.00061246,\"usd_value\":18.3738,\"time\":\"2025-02-25 20:43:31\"},{\"coin\":\"SOL\",\"amount\":0.06154533,\"usd_value\":3.0772665,\"time\":\"2025-02-25 20:43:41\"},{\"coin\":\"BTC\",\"amount\":0.00080656,\"usd_value\":24.1968,\"time\":\"2025-02-25 20:44:15\"},{\"coin\":\"ETH\",\"amount\":0.00591872,\"usd_value\":11.837439999999999,\"time\":\"2025-02-25 20:45:15\"},{\"coin\":\"USDT\",\"amount\":72.49,\"usd_value\":72.49,\"time\":\"2025-02-25 20:46:15\"},{\"coin\":\"SOL\",\"amount\":0.05327204,\"usd_value\":2.663602,\"time\":\"2025-02-25 20:47:15\"},{\"coin\":\"ETH\",\"amount\":0.00328615,\"usd_value\":6.572299999999999,\"time\":\"2025-02-25 20:47:36\"},{\"coin\":\"SOL\",\"amount\":0.00759386,\"usd_value\":0.379693,\"time\":\"2025-02-25 20:47:41\"},{\"coin\":\"USDT\",\"amount\":13.12,\"usd_value\":13.12,\"time\":\"2025-02-25 20:47:51\"},{\"coin\":\"USDC\",\"amount\":33.9,\"usd_value\":33.9,\"time\":\"2025-02-25 20:48:01\"},{\"coin\":\"SOL\",\"amount\":0.04110051,\"usd_value\":2.0550255,\"time\":\"2025-02-25 20:48:11\"},{\"coin\":\"SOL\",\"amount\":0.0523921,\"usd_value\":2.619605,\"time\":\"2025-02-25 20:48:21\"},{\"coin\":\"USDT\",\"amount\":89.72,\"usd_value\":89.72,\"time\":\"2025-02-25 20:48:31\"},{\"coin\":\"ETH\",\"amount\":0.00034281,\"usd_value\":0.68562,\"time\":\"2025-02-25 20:49:15\"},{\"coin\":\"BTC\",\"amount\":0.0005699,\"usd_value\":17.097,\"time\":\"2025-02-25 20:50:15\"}]', '[]', 0, 'rnHwcyZExnZgQhzbXHJ43ybb8pBkwpYahS', 'Ripple', 0, 'DSEkTxUsbKTCA4mufK2z9ZRTJonZiHCbPq', 'Doge', 0, 'FbiBFyNK1tL6HXtG9BqY6w4HXp7wJdKY4B4qPSeiVy3Y', 'Sol', 0, '0x4997a3777d0319dfc429c815607e19ad4271e4a1', 'ERC-20', 0, 0.38959531262662495, 'Disabled', 'Disabled', 0, 'Disabled', 'Disabled', 0, 'addr1vxnaluv8pntc82eynghae5uqzx5zehu8dzf44nkc0m7j5vq2u6eg6', 'Ada', 0.0681812893380993, 'TT5nY9m7f6ds4LqfAAaCcCvKrRokHZdaHx', 'TRC-20', 0, 'LM4wNsc3wUtd4395NnhgMtNVc3Dg2Lgz7J', 'Litecoin', 0, 'X-avax1r2k0fsmuuh9vs8zxtrcx58nzf4w7g5rnx3jefm', 'AVAX', 0, '162Gdk9xXZKmB2wQQrZce4uT1jA2m2YWifvvFRQuxUTLXZsh', 'Dot', 0.6434455846219862, 'cosmos1tvy245hztt3lp4q6lynxhudw3cx7sh4un032tr', 'Atom', 0, '0x4997a3777d0319dfc429c815607e19ad4271e4a1', 'BEP-20', 0, '0x4997a3777d0319dfc429c815607e19ad4271e4a1', 'ERC-20', 0, '0x4997a3777d0319dfc429c815607e19ad4271e4a1', 'Arbitrum One', 0, '0x4997a3777d0319dfc429c815607e19ad4271e4a1', 'OP Mainnet', '0x4997a3777d0319dfc429c815607e19ad4271e4a1', 'BEP-20', '0.00000000', '0.00000000', 0, 0, 0, 0, NULL, NULL),
(12, 'williamdropship12@gmail.com', 'William', '$2y$10$cmaHbQKFNvD3YF6iwRRVwuLbaIigm9H1w0gGBixBNZ.3IIt0iRiJC', '89.00000000', '7888.00000000', '200.00000000', 'bc1qu7lqzr4rtn0efel7ewd4rd9s0rc4wl6uhh56yz', NULL, NULL, '0.00000000', '0.00000000', 'ERC-20', NULL, NULL, '0xb94b71d9f7bCBfc9377B0b3e8945B2E5d20D3585', 'ERC-20', NULL, NULL, '[{\"coin\":\"SOL\",\"amount\":0.08190974,\"usd_value\":4.095486999999999,\"time\":\"2025-02-25 07:22:36\"},{\"coin\":\"ETH\",\"amount\":0.00250993,\"usd_value\":5.01986,\"time\":\"2025-02-25 07:22:47\"},{\"coin\":\"USDC\",\"amount\":91.53,\"usd_value\":91.53,\"time\":\"2025-02-25 07:22:57\"},{\"coin\":\"USDC\",\"amount\":91.63,\"usd_value\":91.63,\"time\":\"2025-02-25 07:23:07\"},{\"coin\":\"BTC\",\"amount\":0.00069737,\"usd_value\":20.9211,\"time\":\"2025-02-25 07:23:17\"},{\"coin\":\"SOL\",\"amount\":0.09851133,\"usd_value\":4.9255664999999995,\"time\":\"2025-02-25 07:23:27\"},{\"coin\":\"BTC\",\"amount\":0.00043152,\"usd_value\":12.9456,\"time\":\"2025-02-25 07:23:37\"},{\"coin\":\"USDC\",\"amount\":61.18,\"usd_value\":61.18,\"time\":\"2025-02-25 07:23:47\"},{\"coin\":\"USDT\",\"amount\":64.64,\"usd_value\":64.64,\"time\":\"2025-02-25 07:24:31\"},{\"coin\":\"ETH\",\"amount\":0.00057093,\"usd_value\":1.1418599999999999,\"time\":\"2025-02-25 07:24:47\"},{\"coin\":\"SOL\",\"amount\":0.08103754,\"usd_value\":4.051877,\"time\":\"2025-02-25 07:24:57\"},{\"coin\":\"SOL\",\"amount\":0.01098941,\"usd_value\":0.5494705,\"time\":\"2025-02-25 07:25:07\"},{\"coin\":\"ETH\",\"amount\":0.00589873,\"usd_value\":11.79746,\"time\":\"2025-02-25 07:25:17\"},{\"coin\":\"ETH\",\"amount\":0.00932904,\"usd_value\":18.65808,\"time\":\"2025-02-25 07:25:27\"},{\"coin\":\"BTC\",\"amount\":0.00052867,\"usd_value\":15.8601,\"time\":\"2025-02-25 07:25:37\"},{\"coin\":\"USDC\",\"amount\":88.28,\"usd_value\":88.28,\"time\":\"2025-02-25 07:25:47\"},{\"coin\":\"BTC\",\"amount\":0.00069309,\"usd_value\":20.7927,\"time\":\"2025-02-25 07:25:59\"},{\"coin\":\"ETH\",\"amount\":0.00125159,\"usd_value\":2.50318,\"time\":\"2025-02-25 07:30:26\"},{\"coin\":\"USDC\",\"amount\":41.81,\"usd_value\":41.81,\"time\":\"2025-02-25 07:30:34\"},{\"coin\":\"ETH\",\"amount\":0.00276556,\"usd_value\":5.53112,\"time\":\"2025-02-25 07:30:45\"},{\"coin\":\"BTC\",\"amount\":0.00072069,\"usd_value\":21.6207,\"time\":\"2025-02-25 07:30:55\"},{\"coin\":\"USDT\",\"amount\":50.87,\"usd_value\":50.87,\"time\":\"2025-02-25 07:31:05\"},{\"coin\":\"USDC\",\"amount\":2.22,\"usd_value\":2.22,\"time\":\"2025-02-25 07:31:21\"},{\"coin\":\"USDC\",\"amount\":64.99,\"usd_value\":64.99,\"time\":\"2025-02-25 07:31:31\"},{\"coin\":\"ETH\",\"amount\":0.00308448,\"usd_value\":6.16896,\"time\":\"2025-02-25 07:31:41\"},{\"coin\":\"BTC\",\"amount\":0.00079791,\"usd_value\":23.9373,\"time\":\"2025-02-25 07:31:51\"},{\"coin\":\"BTC\",\"amount\":0.00066621,\"usd_value\":19.9863,\"time\":\"2025-02-25 07:32:01\"},{\"coin\":\"BTC\",\"amount\":0.00049891,\"usd_value\":14.9673,\"time\":\"2025-02-25 07:32:11\"},{\"coin\":\"ETH\",\"amount\":0.00930082,\"usd_value\":18.60164,\"time\":\"2025-02-25 07:32:21\"},{\"coin\":\"ETH\",\"amount\":0.00309587,\"usd_value\":6.19174,\"time\":\"2025-02-25 07:32:31\"},{\"coin\":\"USDT\",\"amount\":47.36,\"usd_value\":47.36,\"time\":\"2025-02-25 07:32:41\"},{\"coin\":\"SOL\",\"amount\":0.07850741,\"usd_value\":3.9253705,\"time\":\"2025-02-25 07:32:51\"},{\"coin\":\"USDT\",\"amount\":53.91,\"usd_value\":53.91,\"time\":\"2025-02-25 07:33:01\"},{\"coin\":\"SOL\",\"amount\":0.01088729,\"usd_value\":0.5443645,\"time\":\"2025-02-25 07:33:11\"},{\"coin\":\"SOL\",\"amount\":0.04580485,\"usd_value\":2.2902425,\"time\":\"2025-02-25 07:33:21\"},{\"coin\":\"USDT\",\"amount\":82.17,\"usd_value\":82.17,\"time\":\"2025-02-25 07:33:31\"},{\"coin\":\"USDC\",\"amount\":89.22,\"usd_value\":89.22,\"time\":\"2025-02-25 07:33:41\"},{\"coin\":\"USDC\",\"amount\":58.88,\"usd_value\":58.88,\"time\":\"2025-02-25 07:33:51\"},{\"coin\":\"USDT\",\"amount\":97.84,\"usd_value\":97.84,\"time\":\"2025-02-25 07:34:01\"},{\"coin\":\"ETH\",\"amount\":0.00130102,\"usd_value\":2.6020399999999997,\"time\":\"2025-02-25 07:34:11\"},{\"coin\":\"USDC\",\"amount\":79.22,\"usd_value\":79.22,\"time\":\"2025-02-25 07:34:21\"},{\"coin\":\"USDC\",\"amount\":79.52,\"usd_value\":79.52,\"time\":\"2025-02-25 07:34:31\"}]', '[]', 0, 'rnHwcyZExnZgQhzbXHJ43ybb8pBkwpYahS', 'Ripple', 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, '0x4997a3777d0319dfc429c815607e19ad4271e4a1', 'BEP-20', 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, '0.00000000', '0.00000000', 0, 0, 0, 0, NULL, NULL),
(21, 'access12345678@gmail.com', 'access', '$2y$10$RZGma50Oassne605mS5NquNlU8HJtIeXrzXq0/0VmA53vPvQWqH.q', '0.00000000', '0.00000000', '0.00000000', 'bc1qu7lqzr4rtn0efel7ewd4rd9s0rc4wl6uhh56yz', NULL, NULL, '-3870.00000000', '0.00000000', 'ERC-20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, NULL, NULL, 0, 'DSEkTxUsbKTCA4mufK2z9ZRTJonZiHCbPq', 'Doge', 0, NULL, NULL, 0, NULL, NULL, 0, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, '0.00000000', '0.00000000', 0, 0, 0, 0, 'admin', NULL),
(22, 'testingaccount@gmail.com', 'test', '$2y$10$AOWt.dJWNmi7QFWEs5MeBOkTviM6cBa.IFLvGPZDErLmgCBLnggI6', '1.16000000', '0.00000000', '189.71000000', 'bc1qu7lqzr4rtn0efel7ewd4rd9s0rc4wl6uhh56yz', '0xb94b71d9f7bCBfc9377B0b3e8945B2E5d20D3585', '74Mw9ch6MXKjhMNpx4ytuPje3aSrJVqYXbR2L88Uxwfb', '790.00000000', '0.00000000', 'ERC-20', 'ERC-20', 'Sol', '0xb94b71d9f7bCBfc9377B0b3e8945B2E5d20D3585', 'ERC-20', NULL, NULL, NULL, '[{\"id\":1741354136,\"coin\":\"BTC\",\"investment\":210,\"quantity\":0.0012314050835760227,\"open_price\":89328.85,\"open_time\":\"2025-03-07 13:28:56\",\"margin\":0}]', 0, NULL, NULL, 0, 'DSEkTxUsbKTCA4mufK2z9ZRTJonZiHCbPq', 'Doge', 0, NULL, NULL, 0, NULL, NULL, 0, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, '0.00000000', '0.00000000', 0, 0, 0, 0, 'admin', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `campaign`
--

CREATE TABLE `campaign` (
  `id` int(11) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `campaign_name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `type` varchar(20) NOT NULL DEFAULT '',
  `budget` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` char(3) NOT NULL DEFAULT 'USD',
  `reward_per_thousand` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_payout` decimal(10,2) DEFAULT NULL,
  `max_payout` decimal(10,2) DEFAULT NULL,
  `platforms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Např. ["instagram","tiktok","youtube"]' CHECK (json_valid(`platforms`)),
  `thumbnail_url` text DEFAULT NULL,
  `content_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Např. ["https://drive.google.com/...", "https://onedrive.live.com/..."]' CHECK (json_valid(`content_links`)),
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Např. ["Must tag @whop", "Musí použít hashtag #xyz"]' CHECK (json_valid(`requirements`)),
  `paid_out` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_paid_out` decimal(12,2) NOT NULL DEFAULT 0.00,
  `paid_percent` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `expiration_datetime` datetime NOT NULL,
  `status` enum('active','expired') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `message` text NOT NULL,
  `reply_to` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `whop_id`, `user_id`, `username`, `message`, `reply_to`, `created_at`) VALUES
(1, 36, 22, '', 'htrhtr', NULL, '2025-06-22 00:41:29'),
(2, 36, 22, '', 'htrhtr', NULL, '2025-06-22 00:41:29'),
(3, 36, 22, '', 'htrhtr', NULL, '2025-06-22 00:41:29'),
(4, 36, 22, '', 'htrhtr', NULL, '2025-06-22 00:41:29'),
(5, 36, 22, '', 'kuzkz', NULL, '2025-06-22 00:42:37'),
(6, 36, 22, '', 'kuzkz', NULL, '2025-06-22 00:42:37'),
(7, 36, 22, 'testusernormalgre', 'gregege', NULL, '2025-06-22 00:47:29'),
(8, 36, 22, 'testusernormalgre', 'gregege', NULL, '2025-06-22 00:47:29'),
(9, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 00:49:16'),
(10, 36, 22, 'testusernormalgre', 'gregegrege', NULL, '2025-06-22 00:49:16'),
(11, 36, 22, 'testusernormalgre', 'gregeggg13415568', NULL, '2025-06-22 00:51:49'),
(12, 36, 22, 'testusernormalgre', 'gregeggg13415568fref', NULL, '2025-06-22 00:51:49'),
(13, 36, 22, 'testusernormalgre', 'gregeggg13415568fref', NULL, '2025-06-22 00:51:49'),
(14, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 00:51:49'),
(15, 36, 22, 'testusernormalgre', 'gregeggg13415568', NULL, '2025-06-22 00:51:49'),
(16, 36, 22, 'testusernormalgre', 'gregeggg13415568', NULL, '2025-06-22 00:51:49'),
(17, 36, 22, 'testusernormalgre', 'gregeggg13415568', NULL, '2025-06-22 00:51:49'),
(18, 36, 22, 'testusernormalgre', 'hztt', NULL, '2025-06-22 00:52:01'),
(19, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 00:55:06'),
(20, 36, 22, 'testusernormalgre', 'hrtr', NULL, '2025-06-22 00:55:09'),
(21, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 00:56:35'),
(22, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 00:56:41'),
(23, 36, 22, 'testusernormalgre', 'gergege', NULL, '2025-06-22 00:56:45'),
(24, 36, 22, 'testusernormalgre', 'gregegge', NULL, '2025-06-22 00:56:48'),
(25, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 00:56:52'),
(26, 36, 22, 'testusernormalgre', 'gregeg', NULL, '2025-06-22 00:56:58'),
(27, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 00:57:04'),
(28, 36, 22, 'testusernormalgre', 'rge', NULL, '2025-06-22 00:57:05'),
(29, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 00:57:05'),
(30, 36, 22, 'testusernormalgre', 'eg', NULL, '2025-06-22 00:57:05'),
(31, 36, 22, 'testusernormalgre', 'e', NULL, '2025-06-22 00:57:05'),
(32, 36, 22, 'testusernormalgre', 'ge', NULL, '2025-06-22 00:57:05'),
(33, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 00:57:06'),
(34, 36, 22, 'testusernormalgre', 'eg', NULL, '2025-06-22 00:57:06'),
(35, 36, 22, 'testusernormalgre', 'e', NULL, '2025-06-22 00:57:06'),
(36, 36, 22, 'testusernormalgre', 'ge', NULL, '2025-06-22 00:57:06'),
(37, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 00:57:06'),
(38, 36, 22, 'testusernormalgre', 'e', NULL, '2025-06-22 00:57:06'),
(39, 36, 22, 'testusernormalgre', 're', NULL, '2025-06-22 00:57:07'),
(40, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 00:57:46'),
(41, 36, 22, 'testusernormalgre', 'gregre', NULL, '2025-06-22 01:03:01'),
(42, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:03:04'),
(43, 36, 22, 'testusernormalgre', '1', NULL, '2025-06-22 01:03:23'),
(44, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:06:26'),
(45, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:08:03'),
(46, 36, 22, 'testusernormalgre', 'greger', NULL, '2025-06-22 01:10:04'),
(47, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:10:06'),
(48, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:10:07'),
(49, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:10:14'),
(50, 36, 22, 'testusernormalgre', 'gerge', NULL, '2025-06-22 01:18:15'),
(51, 36, 22, 'testusernormalgre', 'few', NULL, '2025-06-22 01:18:18'),
(52, 36, 22, 'testusernormalgre', 'fe', NULL, '2025-06-22 01:18:20'),
(53, 36, 22, 'testusernormalgre', 'fewfw', NULL, '2025-06-22 01:18:23'),
(54, 36, 22, 'testusernormalgre', 'grger', NULL, '2025-06-22 01:27:58'),
(55, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:27:59'),
(56, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:28:00'),
(57, 36, 22, 'testusernormalgre', 'ger', NULL, '2025-06-22 01:28:05'),
(58, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:31:39'),
(59, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:31:42'),
(60, 36, 22, 'testusernormalgre', '123152', NULL, '2025-06-22 01:31:46'),
(61, 36, 22, 'testusernormalgre', '5135', NULL, '2025-06-22 01:31:49'),
(62, 36, 22, 'testusernormalgre', '153135', NULL, '2025-06-22 01:31:51'),
(63, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:35:45'),
(64, 36, 22, 'testusernormalgre', 'gre', NULL, '2025-06-22 01:35:47'),
(65, 36, 22, 'testusernormalgre', 'gre', NULL, '2025-06-22 01:35:56'),
(66, 36, 22, 'testusernormalgre', '123', NULL, '2025-06-22 01:35:58'),
(67, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:44:22'),
(68, 36, 22, 'testusernormalgre', 'HTR', NULL, '2025-06-22 01:50:59'),
(69, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:54:39'),
(70, 36, 22, 'testusernormalgre', 'gre', NULL, '2025-06-22 01:54:42'),
(71, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:56:46'),
(72, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 01:57:35'),
(73, 36, 22, 'testusernormalgre', 'gregerg', NULL, '2025-06-22 01:58:16'),
(74, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 01:59:46'),
(75, 36, 22, 'testusernormalgre', 'gre', NULL, '2025-06-22 02:02:03'),
(76, 36, 22, 'testusernormalgre', 'greg', NULL, '2025-06-22 02:02:11'),
(77, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:03:24'),
(78, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:03:25'),
(79, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:03:27'),
(80, 36, 22, 'testusernormalgre', 'hrthr51', NULL, '2025-06-22 02:03:31'),
(81, 36, 22, 'testusernormalgre', 'hthr', NULL, '2025-06-22 02:03:36'),
(82, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:03:41'),
(83, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:05:46'),
(84, 36, 22, 'testusernormalgre', 'dwd', NULL, '2025-06-22 02:05:50'),
(85, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:07:00'),
(86, 36, 22, 'testusernormalgre', 'hrth', NULL, '2025-06-22 02:07:18'),
(87, 36, 22, 'testusernormalgre', 'htrhtr', NULL, '2025-06-22 02:08:34'),
(88, 36, 22, 'testusernormalgre', 'htr', NULL, '2025-06-22 02:08:37'),
(89, 36, 24, 'kokot1234', 'htrhrth', NULL, '2025-06-22 02:10:07'),
(90, 36, 24, 'kokot1234', 'htr', NULL, '2025-06-22 02:10:09'),
(91, 36, 22, 'testusernormalgre', 'hghtrr', NULL, '2025-06-22 02:10:18'),
(92, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:10:40'),
(93, 36, 22, 'testusernormalgre', 'ghertrth', NULL, '2025-06-22 02:14:15'),
(94, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:14:17'),
(95, 36, 22, 'testusernormalgre', '1313', NULL, '2025-06-22 02:14:26'),
(96, 36, 22, 'testusernormalgre', 'thrhtr', NULL, '2025-06-22 02:15:47'),
(97, 36, 22, 'testusernormalgre', 'ger', NULL, '2025-06-22 02:17:00'),
(98, 36, 22, 'testusernormalgre', 'hthhtrhr', NULL, '2025-06-22 02:17:46'),
(99, 36, 22, 'testusernormalgre', 'htrhrhr', NULL, '2025-06-22 02:18:59'),
(100, 36, 22, 'testusernormalgre', 'htrhtr', NULL, '2025-06-22 02:19:58'),
(101, 36, 22, 'testusernormalgre', 'jtjt', NULL, '2025-06-22 02:20:04'),
(102, 36, 22, 'testusernormalgre', 'htrhrt', NULL, '2025-06-22 02:22:09'),
(103, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:22:10'),
(104, 36, 22, 'testusernormalgre', 'hrthr', NULL, '2025-06-22 02:22:14'),
(105, 36, 22, 'testusernormalgre', 'htr', NULL, '2025-06-22 02:22:26'),
(106, 36, 22, 'testusernormalgre', 'hrhr', NULL, '2025-06-22 02:23:33'),
(107, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:23:35'),
(108, 36, 22, 'testusernormalgre', '4654', NULL, '2025-06-22 02:23:45'),
(109, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:23:51'),
(110, 36, 22, 'testusernormalgre', '135j4zt35', NULL, '2025-06-22 02:23:54'),
(111, 36, 22, 'testusernormalgre', 'jztjt', NULL, '2025-06-22 02:23:57'),
(112, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 02:24:02'),
(113, 36, 22, 'testusernormalgre', 'htrhrt', NULL, '2025-06-22 02:24:45'),
(114, 36, 22, 'testusernormalgre', '@kokot1234 @kokot1234 htrhrt', NULL, '2025-06-22 02:25:26'),
(115, 36, 22, 'testusernormalgre', '@testusernormalgre', NULL, '2025-06-22 02:25:44'),
(116, 36, 22, 'testusernormalgre', '@kokot1234', NULL, '2025-06-22 02:25:53'),
(117, 36, 22, 'testusernormalgre', 'ge', NULL, '2025-06-22 02:27:01'),
(118, 36, 22, 'testusernormalgre', 'grge', NULL, '2025-06-22 02:27:05'),
(119, 36, 22, 'testusernormalgre', '@testusernormalgre gre', NULL, '2025-06-22 02:27:58'),
(120, 36, 22, 'testusernormalgre', '@testusernormalgre @testusernormalgre grege', NULL, '2025-06-22 02:28:03'),
(121, 36, 22, 'testusernormalgre', '@testusernormalgre', NULL, '2025-06-22 02:28:14'),
(122, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 02:31:45'),
(123, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 02:31:53'),
(124, 36, 24, 'kokot1234', '@testusernormalgre', NULL, '2025-06-22 02:32:15'),
(125, 36, 24, 'kokot1234', '@kokot1234 xd@kokot1234', NULL, '2025-06-22 02:32:19'),
(126, 36, 24, 'kokot1234', 'htrhrh', NULL, '2025-06-22 02:33:08'),
(127, 36, 24, 'kokot1234', '@testusernormalgre @kokot1234', NULL, '2025-06-22 02:33:14'),
(128, 36, 24, 'kokot1234', '@kokot1234 grge@kokot1234', NULL, '2025-06-22 02:33:18'),
(129, 36, 24, 'kokot1234', '@testusernormalgre gre@testusernormalgre', NULL, '2025-06-22 02:33:22'),
(130, 36, 22, 'testusernormalgre', '@kokot1234', NULL, '2025-06-22 09:39:29'),
(131, 36, 22, 'testusernormalgre', '@kokot1234', NULL, '2025-06-22 09:39:57'),
(132, 36, 22, 'testusernormalgre', 'cs', NULL, '2025-06-22 09:42:05'),
(133, 36, 24, 'kokot1234', 'ntz', NULL, '2025-06-22 09:42:14'),
(134, 36, 24, 'kokot1234', '@testusernormalgre hul', NULL, '2025-06-22 09:42:23'),
(135, 36, 24, 'kokot1234', '@testusernormalgre k@testusernormalgre', NULL, '2025-06-22 09:42:29'),
(136, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 09:42:48'),
(137, 36, 22, 'testusernormalgre', 'reg', NULL, '2025-06-22 09:42:48'),
(138, 36, 22, 'testusernormalgre', 'e', NULL, '2025-06-22 09:42:48'),
(139, 36, 22, 'testusernormalgre', 'rg', NULL, '2025-06-22 09:42:48'),
(140, 36, 22, 'testusernormalgre', 'reg', NULL, '2025-06-22 09:42:49'),
(141, 36, 22, 'testusernormalgre', 'er', NULL, '2025-06-22 09:42:49'),
(142, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 09:42:49'),
(143, 36, 22, 'testusernormalgre', 'erg', NULL, '2025-06-22 09:42:49'),
(144, 36, 22, 'testusernormalgre', 'e', NULL, '2025-06-22 09:42:49'),
(145, 36, 22, 'testusernormalgre', 'ger', NULL, '2025-06-22 09:42:49'),
(146, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 09:42:50'),
(147, 36, 22, 'testusernormalgre', 'er', NULL, '2025-06-22 09:42:50'),
(148, 36, 22, 'testusernormalgre', '@testusernormalgre @testusernormalgre a', NULL, '2025-06-22 09:44:35'),
(149, 36, 22, 'testusernormalgre', 'gerge', 148, '2025-06-22 09:59:38'),
(150, 36, 22, 'testusernormalgre', '@kokot1234', NULL, '2025-06-22 10:00:03'),
(151, 36, 22, 'testusernormalgre', 'gre', NULL, '2025-06-22 10:00:14'),
(152, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 10:00:14'),
(153, 36, 22, 'testusernormalgre', 'erg', NULL, '2025-06-22 10:00:14'),
(154, 36, 22, 'testusernormalgre', 'efw', NULL, '2025-06-22 10:01:12'),
(155, 36, 22, 'testusernormalgre', '@testusernormalgre', NULL, '2025-06-22 10:15:49'),
(156, 36, 22, 'testusernormalgre', 'gregege', 155, '2025-06-22 10:15:53'),
(157, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 10:16:50'),
(158, 36, 22, 'testusernormalgre', 'erg', NULL, '2025-06-22 10:16:50'),
(159, 36, 22, 'testusernormalgre', 'er', NULL, '2025-06-22 10:16:50'),
(160, 36, 22, 'testusernormalgre', 'gre', NULL, '2025-06-22 10:18:03'),
(161, 36, 22, 'testusernormalgre', 'htrh', NULL, '2025-06-22 10:20:21'),
(162, 36, 22, 'testusernormalgre', 'htr', NULL, '2025-06-22 10:20:22'),
(163, 36, 22, 'testusernormalgre', 'htrhr', 162, '2025-06-22 10:20:24'),
(164, 36, 22, 'testusernormalgre', 'greg', NULL, '2025-06-22 10:20:42'),
(165, 36, 22, 'testusernormalgre', 'eg', NULL, '2025-06-22 10:20:42'),
(166, 36, 22, 'testusernormalgre', 'e', NULL, '2025-06-22 10:20:42'),
(167, 36, 22, 'testusernormalgre', 'gm', 133, '2025-06-22 10:21:29'),
(168, 36, 22, 'testusernormalgre', 'ger', NULL, '2025-06-22 10:21:44'),
(169, 36, 22, 'testusernormalgre', 'hrt', NULL, '2025-06-22 10:21:46'),
(170, 36, 22, 'testusernormalgre', 'jt', 162, '2025-06-22 10:21:52'),
(171, 36, 22, 'testusernormalgre', 'jtzjt', 148, '2025-06-22 10:22:00'),
(172, 36, 22, 'testusernormalgre', 'jztj', 164, '2025-06-22 10:22:04'),
(173, 36, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 10:24:21'),
(174, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 10:24:21'),
(175, 36, 22, 'testusernormalgre', 're', NULL, '2025-06-22 10:24:22'),
(176, 36, 22, 'testusernormalgre', 'z', NULL, '2025-06-22 10:25:12'),
(177, 36, 22, 'testusernormalgre', 'gre', NULL, '2025-06-22 10:25:47'),
(178, 36, 22, 'testusernormalgre', 'ger', NULL, '2025-06-22 10:25:48'),
(179, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 10:25:48'),
(180, 36, 22, 'testusernormalgre', 'greg', NULL, '2025-06-22 10:26:40'),
(181, 36, 22, 'testusernormalgre', 'er', NULL, '2025-06-22 10:26:40'),
(182, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 10:26:40'),
(183, 36, 22, 'testusernormalgre', 'thrhr', NULL, '2025-06-22 10:28:51'),
(184, 36, 22, 'testusernormalgre', 'htrh', NULL, '2025-06-22 10:28:52'),
(185, 36, 22, 'testusernormalgre', 'htrhrhtr', NULL, '2025-06-22 10:28:54'),
(186, 36, 22, 'testusernormalgre', 'htrhr', NULL, '2025-06-22 10:29:52'),
(187, 36, 22, 'testusernormalgre', 'hthr', NULL, '2025-06-22 10:30:04'),
(188, 36, 22, 'testusernormalgre', 'hrth', NULL, '2025-06-22 10:30:07'),
(189, 36, 22, 'testusernormalgre', 'rh', NULL, '2025-06-22 10:30:07'),
(190, 36, 22, 'testusernormalgre', 'gegr', 189, '2025-06-22 10:30:38'),
(191, 36, 22, 'testusernormalgre', 'gre', 183, '2025-06-22 10:30:45'),
(192, 31, 22, 'testusernormalgre', 'fewfw', NULL, '2025-06-22 10:31:50'),
(193, 36, 22, 'testusernormalgre', 'gre', NULL, '2025-06-22 10:32:11'),
(194, 36, 22, 'testusernormalgre', 'erg', NULL, '2025-06-22 10:32:12'),
(195, 36, 22, 'testusernormalgre', 'er', NULL, '2025-06-22 10:32:13'),
(196, 31, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 10:32:43'),
(197, 31, 22, 'testusernormalgre', 'reg', NULL, '2025-06-22 10:32:43'),
(198, 31, 22, 'testusernormalgre', 'eg', NULL, '2025-06-22 10:32:43'),
(199, 36, 22, 'testusernormalgre', 'gt', NULL, '2025-06-22 10:33:13'),
(200, 36, 22, 'testusernormalgre', 'gt', NULL, '2025-06-22 10:33:15'),
(201, 36, 22, 'testusernormalgre', 'htrhr', 194, '2025-06-22 10:33:19'),
(202, 36, 22, 'testusernormalgre', 'ger', NULL, '2025-06-22 10:33:57'),
(203, 36, 22, 'testusernormalgre', 'ge', NULL, '2025-06-22 10:33:57'),
(204, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 10:33:57'),
(205, 36, 22, 'testusernormalgre', 'htr', NULL, '2025-06-22 10:34:56'),
(206, 36, 22, 'testusernormalgre', 'hrth', 205, '2025-06-22 10:34:58'),
(207, 36, 22, 'testusernormalgre', 'htr', NULL, '2025-06-22 10:46:14'),
(208, 36, 22, 'testusernormalgre', '@testusernormalgre', NULL, '2025-06-22 10:49:51'),
(209, 36, 22, 'testusernormalgre', 'r', NULL, '2025-06-22 10:50:01'),
(210, 36, 22, 'testusernormalgre', 'eg', NULL, '2025-06-22 10:50:01'),
(211, 36, 22, 'testusernormalgre', 'er', NULL, '2025-06-22 10:50:01'),
(212, 36, 22, 'testusernormalgre', 'g', NULL, '2025-06-22 10:54:24'),
(213, 30, 24, 'kokot1234', 'g', NULL, '2025-06-22 11:54:16'),
(214, 27, 24, 'kokot1234', 'gm', NULL, '2025-06-22 13:51:19'),
(215, 27, 24, 'kokot1234', 'g', NULL, '2025-06-22 13:51:24'),
(216, 27, 24, 'kokot1234', 'gre', NULL, '2025-06-22 13:51:24'),
(217, 27, 24, 'kokot1234', 'gerger', NULL, '2025-06-22 16:18:44'),
(218, 27, 24, 'kokot1234', 'grt', NULL, '2025-06-22 16:18:47'),
(219, 27, 24, 'kokot1234', 'gtr', NULL, '2025-06-22 16:18:48'),
(220, 46, 24, 'kokot1234', 'hrthr', NULL, '2025-06-22 17:34:50'),
(221, 31, 22, 'testusernormalgre', 'grege', NULL, '2025-06-22 19:11:49'),
(222, 31, 22, 'testusernormalgre', 'gre', 221, '2025-06-22 19:11:53'),
(223, 31, 24, 'kokot1234', 'grege', NULL, '2025-06-22 21:25:26'),
(224, 31, 24, 'kokot1234', 'reg', NULL, '2025-06-22 21:25:28'),
(225, 31, 24, 'kokot1234', 'egrege', 224, '2025-06-22 21:25:30'),
(226, 31, 24, 'kokot1234', 'gre', 197, '2025-06-22 21:26:55'),
(227, 31, 24, 'kokot1234', 'reger', NULL, '2025-06-22 22:07:01'),
(228, 31, 22, 'testusernormalgre', 'kokot', 223, '2025-06-22 23:20:01'),
(229, 31, 22, 'testusernormalgre', 'l', NULL, '2025-06-22 23:23:35'),
(230, 40, 24, 'kokot1234', 'jztjt', NULL, '2025-06-23 14:18:16'),
(231, 46, 24, 'kokot1234', 'rht', NULL, '2025-06-25 19:52:25'),
(232, 46, 24, 'kokot1234', 'hr', NULL, '2025-06-25 19:52:25'),
(233, 46, 24, 'kokot1234', 'th', NULL, '2025-06-25 19:52:25'),
(234, 26, 24, 'kokot1234', 'trhrth', NULL, '2025-06-26 19:38:34'),
(235, 40, 24, 'kokot1234', 'hrthr', NULL, '2025-07-02 15:02:14'),
(236, 40, 24, 'kokot1234', 'h', NULL, '2025-07-02 15:02:15'),
(237, 40, 24, 'kokot1234', 'rh', NULL, '2025-07-02 15:02:15'),
(238, 53, 40, 'swaggermarek', 'greger', NULL, '2025-07-05 11:46:52'),
(239, 53, 40, 'swaggermarek', 'gerger', NULL, '2025-07-05 11:46:54'),
(240, 53, 40, 'swaggermarek', 'greg', NULL, '2025-07-05 11:46:55'),
(241, 52, 16, 'marekefew', 'grege', NULL, '2025-07-05 12:08:31'),
(242, 52, 16, 'marekefew', 'grege', 241, '2025-07-05 12:08:34'),
(243, 54, 40, 'swaggermarek', 'gregege', NULL, '2025-07-05 22:24:03'),
(244, 56, 54, 'swaggermarek', 'hrthr', NULL, '2025-07-06 14:05:43');

-- --------------------------------------------------------

--
-- Table structure for table `custom_wallets`
--

CREATE TABLE `custom_wallets` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `coin` varchar(50) NOT NULL,
  `wallet_address` varchar(255) DEFAULT 'waiting',
  `wallet_network` varchar(50) DEFAULT '',
  `status` varchar(50) DEFAULT 'waiting',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_wallets`
--

INSERT INTO `custom_wallets` (`id`, `username`, `coin`, `wallet_address`, `wallet_network`, `status`, `requested_at`) VALUES
(1, 'test', 'HUDI', 'E4TH8R6TH4R8T8H46R', 'ERC-20', 'approved', '2025-03-07 12:58:56'),
(2, 'test', 'HRTHRT', 'E4TH8R6TH4R8T8H46R', 'HRTHRT', 'waiting', '2025-03-07 13:14:35'),
(3, 'test', 'NEW', 'E4TH8R6TH4R8T8H46R', 'NEW', 'approved', '2025-03-07 13:22:40'),
(4, 'test', 'GREGE', 'E4TH8R6TH4R8T8H46R', 'GERGER', 'approved', '2025-03-07 13:28:06'),
(5, 'test', 'HTRTHR', 'E4TH8R6TH4greR8T8H46R', 'HRTHRTHRT', 'approved', '2025-03-07 13:34:20'),
(6, 'test', 'GM', 'waiting', 'GM', 'waiting', '2025-03-07 13:40:36'),
(7, 'test', 'GERGE', 'waiting', 'htrhrthrht', 'waiting', '2025-03-07 13:51:48');

-- --------------------------------------------------------

--
-- Table structure for table `deposit_records`
--

CREATE TABLE `deposit_records` (
  `id` int(10) UNSIGNED NOT NULL,
  `tx_signature` varchar(100) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `deposit_address` varchar(100) NOT NULL,
  `sol_amount` decimal(16,8) NOT NULL,
  `usd_amount` decimal(16,8) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `swept` tinyint(1) DEFAULT 0,
  `swept_signature` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deposit_records`
--

INSERT INTO `deposit_records` (`id`, `tx_signature`, `user_id`, `deposit_address`, `sol_amount`, `usd_amount`, `created_at`, `swept`, `swept_signature`) VALUES
(50, '51QBUJ5p7GVnKPmKPiv7e3fPNvHxmJG9SMSDSW2C2tbkxtt84ghrf2F384MwLWBtTKQTvRrk15JV39Be3c8Uitf1', 57, 'BAfCfZLqERJauDWLgynG1DCZsVuVkhG5NN3ZMcV1C6ZW', '0.10000000', '15.13700000', '2025-07-06 14:45:30', 0, NULL),
(57, '2DoatBFfnV1qEgy1nmure2BT9XBUTtvUNGivx8xc5PPSt1WPtMw1NGg8zu98rXJ9nAvpkGDEU2pGM5TWt8sjgQt5', 58, 'CELjdTmuB2ZdbpK7f1wrVLU9otXgugPdRLSN12XYyBQh', '0.77000000', '116.50100000', '2025-07-06 14:48:02', 1, '25Kg4UWNYTjpuU7VVZs2W7bvznNHvtrkLEb31VGdgoYsscZtVVi57rwPB2Rxzrz9WjyVHzmzqPkTwVAcvyFx86jC');

-- --------------------------------------------------------

--
-- Table structure for table `discord_final`
--

CREATE TABLE `discord_final` (
  `id` int(11) NOT NULL,
  `coin` varchar(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `entry` varchar(20) NOT NULL,
  `result` varchar(10) NOT NULL,
  `profit` varchar(20) NOT NULL,
  `stop` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discord_final`
--

INSERT INTO `discord_final` (`id`, `coin`, `type`, `entry`, `result`, `profit`, `stop`, `created_at`) VALUES
(1, 'DOTUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 01:00:34'),
(2, 'DOTUSDT.P', 'Opened Long', '4.418', '', '4.242', '4.507', '2025-01-15 08:15:34'),
(3, 'DOTUSDT.P', 'Opened Short', '4.418', '', '4.242', '4.507', '2024-10-20 10:15:34'),
(4, 'MANAUSDT.P', 'Opened Long', '0.3302', '', '0.3433', '0.3235', '2024-10-20 10:15:33'),
(5, 'ARPAUSDT.P', 'Opened Long', '0.03914', '', '0.0407056', '0.0383572', '2024-10-08 12:15:33'),
(6, 'BLURUSDT.P', 'Opened Long', '0.2334', '', '0.242736', '0.228732', '2024-10-08 12:15:14'),
(7, 'ARBUSDT.P', 'Opened Short', '0.5512', '', '0.529152', '0.562224', '2024-10-08 00:15:16'),
(8, '1000BONKUSDT.P', 'Opened Short', '0.021265', '', '0.0204144', '0.0216903', '2024-10-08 00:15:14'),
(9, 'MANAUSDT.P', 'Opened Short', '0.2929', '', '0.281184', '0.298758', '2024-10-08 00:15:14'),
(10, 'XRPUSDT.P', 'Opened Short', '0.5303', '', '0.509088', '0.540906', '2024-10-08 00:15:12'),
(11, 'BLURUSDT.P', 'Opened Short', '0.2293', '', '0.220128', '0.233886', '2024-10-08 00:15:12'),
(12, 'SOLUSDT.P', 'Opened Short', '144.26', '', '138.4896', '147.1452', '2024-10-08 00:15:10'),
(13, 'STXUSDT.P', 'Opened Short', '1.782', '', '1.71072', '1.81764', '2024-10-07 12:15:15'),
(14, 'OPUSDT.P', 'Opened Short', '1.6667', '', '1.600032', '1.700034', '2024-10-07 12:15:14'),
(15, 'ARPAUSDT.P', 'Opened Short', '0.03969', '', '0.0381024', '0.0404838', '2024-10-07 12:15:14'),
(16, 'SUPERUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-07 07:15:15'),
(17, 'BLURUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-07 07:00:19'),
(18, 'XRPUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-07 02:30:10'),
(19, '1000BONKUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-07 01:00:10'),
(20, 'SUPERUSDT.P', 'Opened Long', '1.0484', '', '1.090336', '1.027432', '2024-10-07 00:15:15'),
(21, 'STXUSDT.P', 'Opened Long', '1.8443', '', '1.918072', '1.807414', '2024-10-07 00:15:12'),
(22, 'BLURUSDT.P', 'Opened Long', '0.2248', '', '0.233792', '0.220304', '2024-10-07 00:15:11'),
(23, '1000BONKUSDT.P', 'Opened Long', '0.021996', '', '0.02287584', '0.02155608', '2024-10-07 00:15:11'),
(24, 'SUPERUSDT.P', 'Closed Short', '', 'Loss', '', '', '2024-10-06 15:00:09'),
(25, 'ARPAUSDT.P', 'Closed Short', '', 'Loss', '', '', '2024-10-06 14:45:14'),
(26, 'SOLUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-06 14:45:11'),
(27, 'BLURUSDT.P', 'Closed Short', '', 'Loss', '', '', '2024-10-06 14:45:11'),
(28, 'OPUSDT.P', 'Closed Short', '', 'Loss', '', '', '2024-10-06 14:45:09'),
(29, '1000BONKUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-06 14:45:09'),
(30, 'SUPERUSDT.P', 'Opened Short', '0.99', '', '0.9504', '1.0098', '2024-10-06 12:15:09'),
(31, 'SUPERUSDT.P', 'Closed Long', '', 'Loss', '', '', '2024-10-06 02:45:19'),
(32, 'BLURUSDT.P', 'Closed Short', '', 'Loss', '', '', '2024-10-06 01:30:11'),
(33, 'SUPERUSDT.P', 'Opened Long', '1.0105', '', '1.05092', '0.99029', '2024-10-06 00:15:10'),
(34, 'BLURUSDT.P', 'Opened Short', '0.2204', '', '0.211584', '0.224808', '2024-10-06 00:15:09'),
(35, 'MANAUSDT.P', 'Opened Short', '0.293', '', '0.28128', '0.29886', '2024-10-06 00:15:09'),
(36, 'OPUSDT.P', 'Opened Short', '1.5872', '', '1.523712', '1.618944', '2024-10-06 00:15:08'),
(37, '1000BONKUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-10-05 16:45:09'),
(38, 'SUPERUSDT.P', 'Closed Short', '', 'Loss', '', '', '2024-10-05 16:00:10'),
(39, 'ARBUSDT.P', 'Opened Short', '0.5589', '', '0.536544', '0.570078', '2024-10-05 12:15:09'),
(40, 'STXUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-10-05 06:15:09'),
(41, 'SUPERUSDT.P', 'Opened Short', '1.0235', '', '0.98256', '1.04397', '2024-10-05 00:15:16'),
(42, 'STXUSDT.P', 'Opened Short', '1.8796', '', '1.804416', '1.917192', '2024-10-05 00:15:09'),
(43, '1000BONKUSDT.P', 'Opened Short', '0.021635', '', '0.0207696', '0.0220677', '2024-10-05 00:15:08'),
(44, 'OPUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-04 19:00:11'),
(45, 'MANAUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-04 16:15:16'),
(46, 'BLURUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-04 14:00:14'),
(47, 'ARBUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-04 12:45:10'),
(48, '1000BONKUSDT.P', 'Closed Long', '', 'Loss', '', '', '2024-10-04 12:45:08'),
(49, 'BLURUSDT.P', 'Opened Long', '0.2057', '', '0.213928', '0.201586', '2024-10-04 12:15:13'),
(50, 'OPUSDT.P', 'Opened Long', '1.5523', '', '1.614392', '1.521254', '2024-10-04 12:15:09'),
(51, 'SOLUSDT.P', 'Opened Long', '139.67', '', '145.2568', '136.8766', '2024-10-04 12:15:08'),
(52, '1000BONKUSDT.P', 'Opened Long', '0.021536', '', '0.02239744', '0.02110528', '2024-10-04 12:15:07'),
(53, 'SUPERUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-04 02:30:13'),
(54, 'ARPAUSDT.P', 'Opened Long', '0.03841', '', '0.0399464', '0.0376418', '2024-10-04 00:15:10'),
(55, 'MANAUSDT.P', 'Opened Long', '0.2764', '', '0.287456', '0.270872', '2024-10-04 00:15:09'),
(56, 'SUPERUSDT.P', 'Opened Long', '1.0003', '', '1.040312', '0.980294', '2024-10-04 00:15:08'),
(57, 'ARBUSDT.P', 'Opened Long', '0.5341', '', '0.555464', '0.523418', '2024-10-04 00:15:08'),
(58, 'XRPUSDT.P', 'Opened Long', '0.5214', '', '0.542256', '0.510972', '2024-10-04 00:15:07'),
(59, 'ARPAUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-10-03 15:30:11'),
(60, 'STXUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-10-03 14:15:13'),
(61, 'SUPERUSDT.P', 'Opened Short', '0.9859', '', '0.946464', '1.005618', '2024-10-03 12:15:08'),
(62, 'STXUSDT.P', 'Opened Long', '1.7589', '', '1.829256', '1.723722', '2024-10-03 12:15:06'),
(63, 'ARPAUSDT.P', 'Opened Short', '0.03843', '', '0.0368928', '0.0391986', '2024-10-03 00:15:11'),
(64, 'MANAUSDT.P', 'Opened Short', '0.2739', '', '0.262944', '0.279378', '2024-10-03 00:15:10'),
(65, 'STXUSDT.P', 'Opened Short', '1.73', '', '1.6608', '1.7646', '2024-10-03 00:15:09'),
(66, 'SUPERUSDT.P', 'Opened Long', '1.0012', '', '1.041248', '0.981176', '2024-10-03 00:15:07'),
(67, 'BLURUSDT.P', 'Opened Short', '0.2064', '', '0.198144', '0.210528', '2024-10-03 00:15:05'),
(68, 'SOLUSDT.P', 'Opened Short', '140.16', '', '134.5536', '142.9632', '2024-10-03 00:15:05'),
(69, 'XRPUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-10-02 18:15:04'),
(70, 'MANAUSDT.P', 'Opened short', '0.2791', '', '0.267936', '0.284682', '2024-10-02 00:15:04'),
(71, 'AVAXUSDT.P', 'Opened Short', '27.745', '', '27.1901', '28.2999', '2024-09-28 22:30:17'),
(72, 'AVAXUSDT.P', 'Opened Short', '27.745', '', '27.1901', '28.2999', '2025-01-15 10:00:17'),
(73, 'SUIUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-09-29 05:00:21'),
(74, 'BLURUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-09-29 05:00:20'),
(75, 'SUPERUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-09-29 05:00:20'),
(76, 'DOGEUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-09-29 05:00:18'),
(77, 'AVAXUSDT.P', 'Opened Short', '27.745', '', '27.1901', '28.2999', '2024-09-28 22:12:35'),
(78, 'AVAXUSDT.P', 'Opened Short', '27.745', '', '27.1901', '28.2999', '2024-07-15 20:30:17'),
(79, 'TRXUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-15 23:49:16'),
(80, 'EOSUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-15 23:48:16'),
(81, 'AAVEUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-15 23:47:16'),
(82, 'NEARUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-15 23:46:16'),
(83, 'FTMUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-15 23:45:16'),
(84, 'ATOMUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-15 23:44:16'),
(85, 'LINKUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-15 23:43:16'),
(86, 'UNIUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-15 23:42:16'),
(87, 'AVAXUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-15 23:41:16'),
(88, 'LTCUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-15 23:40:16'),
(89, 'MATICUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-15 23:39:16'),
(90, 'DOGEUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-15 23:38:16'),
(91, 'DOTUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-15 23:37:16'),
(92, 'XRPUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-15 23:36:16'),
(93, 'ADAUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-15 23:35:16'),
(94, 'SOLUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-15 23:34:16'),
(95, 'BNBUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-15 23:33:16'),
(96, 'ETHUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-15 23:32:16'),
(97, 'BTCUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-15 23:31:16'),
(98, '1000BONKUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-15 23:30:16'),
(99, 'DOGEUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-09-29 10:37:00'),
(100, 'JASMYUSDT.P', 'Opened Short', '0.02876', '', '0.0281848', '0.0293352', '2024-07-18 08:30:11'),
(101, 'AVAXUSDT.P', 'Opened Short', '27.745', '', '27.1901', '28.2999', '2024-07-15 22:30:17'),
(102, 'JASMYUSDT.P', 'Opened Short', '0.03131', '', '0.0306838', '0.0319362', '2024-07-15 22:30:19'),
(103, 'BNBUSDT.P', 'Opened Short', '581.6', '', '569.968', '593.232', '2024-07-15 22:30:19'),
(104, 'BLURUSDT.P', 'Opened Short', '0.1853', '', '0.181594', '0.189006', '2024-07-15 22:30:22'),
(105, 'IDUSDT.P', 'Opened Short', '0.4374', '', '0.428652', '0.446148', '2024-07-15 22:30:22'),
(106, 'SUPERUSDT.P', 'Opened Short', '0.652', '', '0.63896', '0.66504', '2024-07-15 22:30:23'),
(107, 'DYDXUSDT.P', 'Opened Short', '1.444', '', '1.41512', '1.47288', '2024-07-15 22:30:24'),
(108, '1000BONKUSDT.P', 'Opened Short', '0.026475', '', '0.0259455', '0.0270045', '2024-07-15 23:00:16'),
(109, '1000BONKUSDT.P', 'Closed Short', '', 'Loss', '', '', '2024-07-16 01:30:16'),
(110, 'JASMYUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-16 01:30:20'),
(111, 'SUPERUSDT.P', 'Opened Short', '0.6561', '', '0.642978', '0.669222', '2024-07-16 02:30:26'),
(112, 'DYDXUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-16 03:00:34'),
(113, 'DOGEUSDT.P', 'Opened Short', '0.12347', '', '0.1210006', '0.1259394', '2024-07-16 03:30:17'),
(114, 'BLURUSDT.P', 'Opened Short', '0.1866', '', '0.182868', '0.190332', '2024-07-16 03:30:23'),
(115, '1000BONKUSDT.P', 'Opened Short', '0.026641', '', '0.02610818', '0.02717382', '2024-07-16 03:45:15'),
(116, 'AVAXUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-16 03:45:21'),
(117, 'SUPERUSDT.P', 'Opened Short', '0.6563', '', '0.643174', '0.669426', '2024-07-16 03:45:23'),
(118, 'IDUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-16 03:45:26'),
(119, 'BNBUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-16 04:00:19'),
(120, 'SUIUSDT.P', 'Opened Short', '0.8427', '', '0.825846', '0.859554', '2024-07-16 04:00:20'),
(121, '1000BONKUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-16 05:00:16'),
(122, 'DOGEUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-16 05:00:18'),
(123, 'SUPERUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-16 05:00:20'),
(124, 'BLURUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-16 05:00:20'),
(125, 'SUIUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-16 05:00:21'),
(126, 'INJUSDT.P', 'Opened Short', '22.685', '', '22.2313', '23.1387', '2024-07-16 06:30:21'),
(127, '1000BONKUSDT.P', 'Opened Long', '0.026803', '', '0.02733906', '0.02626694', '2024-07-16 09:30:20'),
(128, 'BNBUSDT.P', 'Opened Long', '570.7', '', '582.114', '559.286', '2024-07-16 10:15:15'),
(129, 'INJUSDT.P', 'Opened Short', '23.246', '', '22.78108', '23.71092', '2024-07-16 10:15:17'),
(130, 'SUIUSDT.P', 'Opened Long', '0.8356', '', '0.852312', '0.818888', '2024-07-16 10:15:23'),
(131, 'JASMYUSDT.P', 'Opened Long', '0.029817', '', '0.03041334', '0.02922066', '2024-07-16 10:30:19'),
(132, 'IDUSDT.P', 'Opened Long', '0.4298', '', '0.438396', '0.421204', '2024-07-16 10:30:20'),
(133, 'BLURUSDT.P', 'Opened Long', '0.1808', '', '0.184416', '0.177184', '2024-07-16 10:30:21'),
(134, 'DYDXUSDT.P', 'Opened Long', '1.377', '', '1.40454', '1.34946', '2024-07-16 10:30:22'),
(135, 'DOGEUSDT.P', 'Opened Long', '0.12303', '', '0.1254906', '0.1205694', '2024-07-16 10:30:26'),
(136, 'AVAXUSDT.P', 'Opened Long', '27.29', '', '27.8358', '26.7442', '2024-07-16 10:30:26'),
(137, 'JASMYUSDT.P', 'Opened Long', '0.029584', '', '0.03017568', '0.02899232', '2024-07-16 12:30:27'),
(138, 'SUPERUSDT.P', 'Opened Long', '0.6286', '', '0.641172', '0.616028', '2024-07-16 13:00:19'),
(139, '1000BONKUSDT.P', 'Opened Long', '0.027463', '', '0.02801226', '0.02691374', '2024-07-16 13:15:15'),
(140, 'JASMYUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 13:15:17'),
(141, 'BLURUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 13:15:19'),
(142, 'DYDXUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 13:15:22'),
(143, 'AVAXUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 13:15:25'),
(144, 'SUIUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 13:30:24'),
(145, '1000BONKUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 13:45:15'),
(146, 'INJUSDT.P', 'Closed Short', '', 'Loss', '', '', '2024-07-16 13:45:22'),
(147, 'SUPERUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 13:45:22'),
(148, 'DOGEUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 14:00:16'),
(149, 'IDUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 14:00:29'),
(150, 'IDUSDT.P', 'Opened Short', '0.44605', '', '0.437129', '0.454971', '2024-07-16 22:31:00'),
(151, 'BNBUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-16 23:15:00'),
(152, '1000BONKUSDT.P', 'Opened Short', '0.028506', '', '0.02793588', '0.02907612', '2024-07-17 01:15:03'),
(153, 'SUIUSDT.P', 'Opened Short', '0.8607', '', '0.843486', '0.877914', '2024-07-17 01:15:03'),
(154, 'BLURUSDT.P', 'Opened Short', '0.1887', '', '0.184926', '0.192474', '2024-07-17 01:15:04'),
(155, '1000BONKUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-17 02:45:00'),
(156, '1000BONKUSDT.P', 'Opened Long', '0.02859', '', '0.0291618', '0.0280182', '2024-07-17 08:15:01'),
(157, 'DOGEUSDT.P', 'Opened Short', '0.12438', '', '0.1218924', '0.1268676', '2024-07-17 09:15:01'),
(158, 'JASMYUSDT.P', 'Opened Short', '0.030048', '', '0.02944704', '0.03064896', '2024-07-17 09:30:04'),
(159, 'SUIUSDT.P', 'Opened Short', '0.8651', '', '0.847798', '0.882402', '2024-07-17 09:30:08'),
(160, 'BNBUSDT.P', 'Opened Short', '574.6', '', '563.108', '586.092', '2024-07-17 09:45:03'),
(161, '1000BONKUSDT.P', 'Opened Long', '0.027894', '', '0.02845188', '0.02733612', '2024-07-17 10:15:01'),
(162, 'AVAXUSDT.P', 'Opened Short', '28.09', '', '27.5282', '28.6518', '2024-07-17 10:15:03'),
(163, 'SUPERUSDT.P', 'Opened Short', '0.663', '', '0.64974', '0.67626', '2024-07-17 10:15:08'),
(164, 'DYDXUSDT.P', 'Opened Short', '1.395', '', '1.3671', '1.4229', '2024-07-17 10:45:27'),
(165, 'IDUSDT.P', 'Opened Short', '0.4731', '', '0.463638', '0.482562', '2024-07-17 11:30:06'),
(166, '1000BONKUSDT.P', 'Closed Long', '', 'Loss', '', '', '2024-07-17 11:30:19'),
(167, '1000BONKUSDT.P', 'Opened Long', '0.027742', '', '0.02829684', '0.02718716', '2024-07-17 11:45:04'),
(168, 'BLURUSDT.P', 'Opened Long', '0.1941', '', '0.197982', '0.190218', '2024-07-17 11:45:12'),
(169, 'BLURUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-17 13:15:08'),
(170, '1000BONKUSDT.P', 'Closed Long', '', 'Loss', '', '', '2024-07-17 14:15:07'),
(171, 'JASMYUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-17 14:15:08'),
(172, 'SUIUSDT.P', 'Opened Short', '0.8593', '', '0.842114', '0.876486', '2024-07-17 14:15:09'),
(173, 'DOGEUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-17 14:15:11'),
(174, 'IDUSDT.P', 'Opened Short', '0.47095', '', '0.461531', '0.480369', '2024-07-17 14:15:16'),
(175, 'AVAXUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-17 14:45:07'),
(176, 'INJUSDT.P', 'Opened Short', '25.299', '', '24.79302', '25.80498', '2024-07-17 14:45:12'),
(177, 'BLURUSDT.P', 'Opened Short', '0.1915', '', '0.18767', '0.19533', '2024-07-17 14:45:15'),
(178, 'SUPERUSDT.P', 'Opened Short', '0.6618', '', '0.648564', '0.675036', '2024-07-17 20:45:08'),
(179, 'SUIUSDT.P', 'Closed Short', '', 'Profit', '', '', '2024-07-17 21:30:07'),
(180, 'DOGEUSDT.P', 'Opened Long', '0.12208', '', '0.1245216', '0.1196384', '2024-07-17 22:15:03'),
(181, '1000BONKUSDT.P', 'Opened Long', '0.026718', '', '0.02725236', '0.02618364', '2024-07-17 22:15:04'),
(182, 'AVAXUSDT.P', 'Opened Long', '27.235', '', '27.7797', '26.6903', '2024-07-17 22:15:04'),
(183, 'INJUSDT.P', 'Opened Short', '25.56', '', '25.0488', '26.0712', '2024-07-17 22:15:04'),
(184, 'IDUSDT.P', 'Opened Short', '0.4692', '', '0.459816', '0.478584', '2024-07-17 22:15:07'),
(185, 'JASMYUSDT.P', 'Opened Long', '0.029184', '', '0.02976768', '0.02860032', '2024-07-17 22:30:08'),
(186, 'SUIUSDT.P', 'Opened Long', '0.8457', '', '0.862614', '0.828786', '2024-07-17 22:30:10'),
(187, '1000BONKUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-17 23:00:08'),
(188, 'IDUSDT.P', 'Closed Short', '', 'Loss', '', '', '2024-07-18 01:00:02'),
(189, 'JASMYUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-18 02:00:02'),
(190, 'INJUSDT.P', 'Closed Short', '', 'Loss', '', '', '2024-07-18 02:15:06'),
(191, '1000BONKUSDT.P', 'Opened Short', '0.026634', '', '0.02610132', '0.02716668', '2024-07-18 03:15:07'),
(192, 'IDUSDT.P', 'Opened Short', '0.4752', '', '0.465696', '0.484704', '2024-07-18 03:15:09'),
(193, 'AVAXUSDT.P', 'Closed Long', '', 'Profit', '', '', '2024-07-18 04:15:01');

-- --------------------------------------------------------

--
-- Table structure for table `linked_accounts`
--

CREATE TABLE `linked_accounts` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `platform` enum('instagram','tiktok','youtube') NOT NULL,
  `account_url` varchar(255) NOT NULL,
  `verify_code` char(6) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `verified_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `memberships`
--

CREATE TABLE `memberships` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `price` decimal(16,8) NOT NULL DEFAULT 0.00000000,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `is_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `billing_period` varchar(20) DEFAULT NULL,
  `start_at` datetime NOT NULL,
  `next_payment_at` datetime DEFAULT NULL,
  `status` enum('active','canceled','expired') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `memberships`
--

INSERT INTO `memberships` (`id`, `user_id`, `whop_id`, `price`, `currency`, `is_recurring`, `billing_period`, `start_at`, `next_payment_at`, `status`) VALUES
(27, 22, 26, '10.00000000', 'USD', 0, '1min', '2025-06-09 14:23:55', NULL, 'canceled'),
(28, 22, 25, '10.00000000', 'USD', 1, '1min', '2025-06-09 14:26:25', NULL, 'canceled'),
(39, 22, 26, '10.00000000', 'USD', 0, '1min', '2025-06-09 20:11:22', NULL, 'canceled'),
(48, 22, 26, '100.00000000', 'USD', 0, '1min', '2025-06-09 23:16:28', NULL, 'canceled'),
(49, 22, 26, '100.00000000', 'USD', 1, '30 days', '2025-06-10 00:57:19', NULL, 'canceled'),
(50, 22, 26, '100.00000000', 'USD', 1, '30 days', '2025-06-10 01:54:58', NULL, 'canceled'),
(56, 22, 26, '100.00000000', 'USD', 1, '30 days', '2025-06-10 14:10:47', NULL, 'canceled'),
(70, 22, 27, '1.00000000', 'USD', 0, '1min', '2025-06-10 17:17:26', NULL, 'canceled'),
(71, 22, 27, '1.00000000', 'USD', 1, '1min', '2025-06-10 17:27:14', NULL, 'canceled'),
(72, 22, 27, '1.00000000', 'USD', 1, '1min', '2025-06-10 17:36:29', NULL, 'canceled'),
(73, 22, 27, '1.00000000', 'USD', 1, '1min', '2025-06-10 18:23:04', NULL, 'canceled'),
(74, 22, 25, '10.00000000', 'USD', 1, '1min', '2025-06-10 18:32:52', NULL, 'canceled'),
(75, 22, 25, '10.00000000', 'USD', 1, '1min', '2025-06-10 19:06:57', NULL, 'canceled'),
(76, 22, 32, '10.00000000', 'USD', 1, '1min', '2025-06-10 19:33:21', NULL, 'canceled'),
(77, 22, 27, '1.00000000', 'USD', 0, '1min', '2025-06-10 19:45:27', NULL, 'canceled'),
(79, 22, 32, '10.00000000', 'USD', 0, '1min', '2025-06-10 20:15:09', NULL, 'canceled'),
(83, 22, 32, '10.00000000', 'USD', 1, '14 days', '2025-06-12 19:00:13', NULL, 'canceled'),
(84, 21, 33, '10.00000000', 'USD', 0, 'none', '2025-06-12 20:13:44', NULL, 'active'),
(87, 24, 27, '1.00000000', 'USD', 1, '1min', '2025-06-15 20:57:30', NULL, 'canceled'),
(88, 22, 32, '10.00000000', 'USD', 0, '14 days', '2025-06-17 19:36:00', NULL, 'canceled'),
(89, 24, 36, '100.00000000', 'USD', 0, 'none', '2025-06-19 21:24:28', NULL, 'canceled'),
(90, 24, 36, '100.00000000', 'USD', 0, 'none', '2025-06-19 21:25:47', NULL, 'canceled'),
(106, 22, 36, '300.00000000', 'USD', 0, 'none', '2025-06-22 00:05:09', NULL, 'canceled'),
(107, 22, 36, '300.00000000', 'USD', 0, 'none', '2025-06-22 00:31:42', NULL, 'canceled'),
(109, 22, 39, '10.00000000', 'USD', 1, '1min', '2025-06-22 11:18:53', NULL, 'canceled'),
(110, 24, 27, '1.00000000', 'USD', 0, '1min', '2025-06-22 13:50:47', NULL, 'canceled'),
(111, 29, 38, '1.00000000', 'USD', 1, '7 days', '2025-06-22 14:11:20', '2025-06-29 14:11:20', 'active'),
(112, 22, 38, '1.00000000', 'USD', 1, '7 days', '2025-06-22 15:19:02', NULL, 'canceled'),
(113, 24, 25, '10.00000000', 'USD', 1, '1min', '2025-06-22 16:18:17', NULL, 'canceled'),
(114, 24, 49, '10.00000000', 'USD', 0, 'single', '2025-06-24 19:15:33', NULL, 'canceled'),
(115, 24, 49, '10.00000000', 'USD', 0, 'single', '2025-06-24 19:15:54', NULL, 'canceled'),
(116, 24, 26, '100.00000000', 'USD', 1, '30 days', '2025-06-25 20:04:27', NULL, 'canceled'),
(117, 22, 32, '10.00000000', 'USD', 0, '14 days', '2025-06-28 16:51:38', '2025-07-12 16:51:38', 'active'),
(118, 22, 23, '10.00000000', 'USD', 1, '1min', '2025-06-28 16:51:53', NULL, 'canceled'),
(119, 24, 27, '1.00000000', 'USD', 1, '1min', '2025-07-02 15:07:55', NULL, 'canceled'),
(120, 16, 27, '1.00000000', 'USD', 1, '1min', '2025-07-04 04:34:35', NULL, 'canceled');

-- --------------------------------------------------------

--
-- Table structure for table `message_reactions`
--

CREATE TABLE `message_reactions` (
  `id` int(11) NOT NULL,
  `message_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `reaction_type` enum('like','smile','fire','heart','dislike') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `payment_date` datetime NOT NULL,
  `type` enum('one_time','recurring','failed','refunded','payout') NOT NULL DEFAULT 'one_time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `whop_id`, `amount`, `currency`, `payment_date`, `type`) VALUES
(1, 22, 22, '10.00', 'USD', '2025-06-09 13:29:01', 'one_time'),
(2, 22, 22, '10.00', 'USD', '2025-06-09 13:36:10', 'one_time'),
(3, 22, 22, '10.00', 'USD', '2025-06-09 13:39:15', 'one_time'),
(4, 22, 22, '10.00', 'USD', '2025-06-09 13:42:17', 'one_time'),
(5, 22, 22, '10.00', 'USD', '2025-06-09 13:43:31', 'one_time'),
(6, 22, 22, '10.00', 'USD', '2025-06-09 13:47:46', 'one_time'),
(7, 22, 22, '10.00', 'USD', '2025-06-09 13:55:30', 'one_time'),
(8, 22, 22, '10.00', 'USD', '2025-06-09 13:58:07', 'one_time'),
(9, 22, 23, '10.00', 'USD', '2025-06-09 13:59:48', 'one_time'),
(10, 22, 23, '10.00', 'USD', '2025-06-09 14:08:02', 'one_time'),
(11, 22, 24, '10.00', 'USD', '2025-06-09 14:09:27', 'one_time'),
(12, 22, 24, '10.00', 'USD', '2025-06-09 14:12:43', 'one_time'),
(13, 22, 23, '10.00', 'USD', '2025-06-09 14:13:26', 'one_time'),
(14, 22, 25, '10.00', 'USD', '2025-06-09 14:15:15', 'one_time'),
(15, 22, 25, '10.00', 'USD', '2025-06-09 14:16:59', 'one_time'),
(16, 22, 25, '10.00', 'USD', '2025-06-09 14:22:25', 'one_time'),
(17, 22, 26, '10.00', 'USD', '2025-06-09 14:23:55', 'one_time'),
(18, 22, 25, '10.00', 'USD', '2025-06-09 14:26:25', 'one_time'),
(19, 22, 27, '10.00', 'USD', '2025-06-09 14:35:40', 'one_time'),
(20, 22, 27, '10.00', 'USD', '2025-06-09 14:44:12', 'one_time'),
(21, 22, 27, '10.00', 'USD', '2025-06-09 14:45:12', 'recurring'),
(22, 22, 27, '10.00', 'USD', '2025-06-09 14:50:09', 'one_time'),
(23, 22, 27, '10.00', 'USD', '2025-06-09 14:51:09', 'recurring'),
(24, 22, 27, '10.00', 'USD', '2025-06-09 14:56:04', 'one_time'),
(25, 22, 27, '10.00', 'USD', '2025-06-09 14:57:04', 'recurring'),
(26, 22, 27, '10.00', 'USD', '2025-06-09 14:59:28', 'one_time'),
(27, 22, 27, '10.00', 'USD', '2025-06-09 15:00:28', 'recurring'),
(28, 22, 27, '10.00', 'USD', '2025-06-09 15:01:28', 'recurring'),
(29, 22, 27, '10.00', 'USD', '2025-06-09 15:02:28', 'recurring'),
(30, 22, 27, '10.00', 'USD', '2025-06-09 15:11:53', 'one_time'),
(31, 22, 27, '10.00', 'USD', '2025-06-09 15:12:53', 'recurring'),
(32, 22, 27, '10.00', 'USD', '2025-06-09 15:13:53', 'recurring'),
(33, 22, 27, '10.00', 'USD', '2025-06-09 15:14:53', 'failed'),
(34, 22, 27, '10.00', 'USD', '2025-06-09 15:25:09', 'one_time'),
(35, 22, 27, '1.00', 'USD', '2025-06-09 19:25:31', 'one_time'),
(36, 22, 27, '1.00', 'USD', '2025-06-09 19:26:31', 'recurring'),
(37, 22, 27, '1.00', 'USD', '2025-06-09 19:27:31', 'recurring'),
(38, 22, 27, '1.00', 'USD', '2025-06-09 20:03:55', 'one_time'),
(39, 22, 27, '1.00', 'USD', '2025-06-09 20:04:55', 'recurring'),
(40, 22, 27, '1.00', 'USD', '2025-06-09 20:05:55', 'recurring'),
(41, 22, 27, '1.00', 'USD', '2025-06-09 20:06:55', 'recurring'),
(42, 22, 27, '1.00', 'USD', '2025-06-09 20:07:55', 'recurring'),
(43, 22, 27, '1.00', 'USD', '2025-06-09 20:10:49', 'one_time'),
(44, 22, 26, '10.00', 'USD', '2025-06-09 20:11:22', 'one_time'),
(45, 22, 27, '1.00', 'USD', '2025-06-09 20:15:26', 'one_time'),
(46, 22, 27, '1.00', 'USD', '2025-06-09 20:16:48', 'one_time'),
(47, 22, 27, '1.00', 'USD', '2025-06-09 20:17:04', 'one_time'),
(48, 22, 27, '1.00', 'USD', '2025-06-09 20:58:17', 'one_time'),
(49, 21, 29, '100.00', 'USD', '2025-06-09 21:02:14', 'failed'),
(50, 22, 22, '10.00', 'USD', '2025-06-09 21:59:57', 'one_time'),
(51, 22, 22, '10.00', 'USD', '2025-06-09 22:57:41', 'one_time'),
(52, 22, 22, '10.00', 'USD', '2025-06-09 22:58:41', 'recurring'),
(53, 22, 22, '10.00', 'USD', '2025-06-09 22:59:41', 'recurring'),
(54, 22, 22, '10.00', 'USD', '2025-06-09 23:00:41', 'recurring'),
(55, 22, 22, '10.00', 'USD', '2025-06-09 23:01:41', 'recurring'),
(56, 22, 22, '10.00', 'USD', '2025-06-09 23:02:41', 'recurring'),
(57, 22, 22, '10.00', 'USD', '2025-06-09 23:03:08', 'one_time'),
(58, 22, 26, '100.00', 'USD', '2025-06-09 23:16:28', 'one_time'),
(59, 22, 26, '100.00', 'USD', '2025-06-10 00:57:19', 'one_time'),
(60, 22, 26, '100.00', 'USD', '2025-06-10 01:54:58', 'one_time'),
(61, 22, 22, '10.00', 'USD', '2025-06-10 12:34:52', 'one_time'),
(62, 22, 22, '10.00', 'USD', '2025-06-10 12:35:52', 'recurring'),
(63, 22, 22, '10.00', 'USD', '2025-06-10 12:36:52', 'recurring'),
(64, 22, 22, '10.00', 'USD', '2025-06-10 12:37:52', 'recurring'),
(65, 22, 22, '10.00', 'USD', '2025-06-10 12:38:52', 'recurring'),
(66, 22, 22, '10.00', 'USD', '2025-06-10 12:39:52', 'recurring'),
(67, 22, 22, '10.00', 'USD', '2025-06-10 12:40:52', 'recurring'),
(68, 22, 22, '10.00', 'USD', '2025-06-10 12:41:52', 'recurring'),
(69, 22, 22, '10.00', 'USD', '2025-06-10 12:42:52', 'recurring'),
(70, 22, 22, '10.00', 'USD', '2025-06-10 12:43:52', 'recurring'),
(71, 22, 22, '10.00', 'USD', '2025-06-10 12:44:52', 'recurring'),
(72, 22, 22, '10.00', 'USD', '2025-06-10 12:45:52', 'recurring'),
(73, 22, 22, '10.00', 'USD', '2025-06-10 12:46:52', 'recurring'),
(74, 22, 22, '10.00', 'USD', '2025-06-10 12:47:52', 'recurring'),
(75, 22, 22, '10.00', 'USD', '2025-06-10 12:48:52', 'recurring'),
(76, 22, 22, '10.00', 'USD', '2025-06-10 12:49:52', 'recurring'),
(77, 22, 22, '10.00', 'USD', '2025-06-10 12:50:52', 'recurring'),
(78, 22, 22, '10.00', 'USD', '2025-06-10 12:51:52', 'recurring'),
(79, 22, 22, '10.00', 'USD', '2025-06-10 12:52:52', 'recurring'),
(80, 22, 22, '10.00', 'USD', '2025-06-10 12:53:52', 'recurring'),
(81, 22, 22, '10.00', 'USD', '2025-06-10 12:54:52', 'recurring'),
(82, 22, 22, '10.00', 'USD', '2025-06-10 12:55:52', 'recurring'),
(83, 22, 22, '10.00', 'USD', '2025-06-10 12:56:52', 'recurring'),
(84, 22, 22, '10.00', 'USD', '2025-06-10 12:57:52', 'recurring'),
(85, 22, 22, '10.00', 'USD', '2025-06-10 12:58:52', 'recurring'),
(86, 22, 22, '10.00', 'USD', '2025-06-10 12:59:52', 'recurring'),
(87, 22, 22, '10.00', 'USD', '2025-06-10 13:00:52', 'recurring'),
(88, 22, 22, '10.00', 'USD', '2025-06-10 13:01:52', 'recurring'),
(89, 22, 22, '10.00', 'USD', '2025-06-10 13:02:52', 'recurring'),
(90, 22, 22, '10.00', 'USD', '2025-06-10 13:03:52', 'recurring'),
(91, 22, 22, '10.00', 'USD', '2025-06-10 13:04:52', 'recurring'),
(92, 22, 22, '10.00', 'USD', '2025-06-10 13:05:52', 'recurring'),
(93, 22, 22, '10.00', 'USD', '2025-06-10 13:06:52', 'recurring'),
(94, 22, 22, '10.00', 'USD', '2025-06-10 13:07:52', 'recurring'),
(95, 22, 22, '10.00', 'USD', '2025-06-10 13:08:52', 'recurring'),
(96, 22, 22, '10.00', 'USD', '2025-06-10 13:09:52', 'recurring'),
(97, 22, 22, '10.00', 'USD', '2025-06-10 13:10:52', 'recurring'),
(98, 22, 22, '10.00', 'USD', '2025-06-10 13:11:52', 'recurring'),
(99, 22, 22, '10.00', 'USD', '2025-06-10 13:12:52', 'recurring'),
(100, 22, 22, '10.00', 'USD', '2025-06-10 13:13:52', 'recurring'),
(101, 22, 22, '10.00', 'USD', '2025-06-10 13:14:52', 'recurring'),
(102, 22, 22, '10.00', 'USD', '2025-06-10 13:15:52', 'recurring'),
(103, 22, 22, '10.00', 'USD', '2025-06-10 13:16:52', 'recurring'),
(104, 22, 22, '10.00', 'USD', '2025-06-10 13:17:52', 'recurring'),
(105, 22, 22, '10.00', 'USD', '2025-06-10 13:18:52', 'recurring'),
(106, 22, 22, '10.00', 'USD', '2025-06-10 13:19:52', 'recurring'),
(107, 22, 22, '10.00', 'USD', '2025-06-10 13:20:52', 'recurring'),
(108, 22, 22, '10.00', 'USD', '2025-06-10 13:21:52', 'recurring'),
(109, 22, 22, '10.00', 'USD', '2025-06-10 13:22:52', 'recurring'),
(110, 22, 22, '10.00', 'USD', '2025-06-10 13:23:52', 'recurring'),
(111, 22, 22, '10.00', 'USD', '2025-06-10 13:24:52', 'recurring'),
(112, 22, 22, '10.00', 'USD', '2025-06-10 13:25:52', 'recurring'),
(113, 22, 22, '10.00', 'USD', '2025-06-10 13:26:52', 'recurring'),
(114, 22, 22, '10.00', 'USD', '2025-06-10 13:27:52', 'recurring'),
(115, 22, 22, '10.00', 'USD', '2025-06-10 13:28:52', 'recurring'),
(116, 22, 22, '10.00', 'USD', '2025-06-10 13:29:52', 'recurring'),
(117, 22, 22, '10.00', 'USD', '2025-06-10 13:30:52', 'recurring'),
(118, 22, 22, '10.00', 'USD', '2025-06-10 13:31:52', 'recurring'),
(119, 22, 22, '10.00', 'USD', '2025-06-10 13:32:52', 'recurring'),
(120, 22, 22, '10.00', 'USD', '2025-06-10 13:33:52', 'recurring'),
(121, 22, 22, '10.00', 'USD', '2025-06-10 13:34:52', 'recurring'),
(122, 22, 22, '10.00', 'USD', '2025-06-10 13:35:52', 'failed'),
(123, 22, 27, '1.00', 'USD', '2025-06-10 14:04:35', 'one_time'),
(124, 22, 27, '1.00', 'USD', '2025-06-10 14:05:20', 'one_time'),
(125, 22, 27, '1.00', 'USD', '2025-06-10 14:06:20', 'recurring'),
(126, 22, 27, '1.00', 'USD', '2025-06-10 14:07:20', 'recurring'),
(127, 22, 27, '1.00', 'USD', '2025-06-10 14:08:20', 'recurring'),
(128, 22, 27, '1.00', 'USD', '2025-06-10 14:09:20', 'recurring'),
(129, 22, 27, '1.00', 'USD', '2025-06-10 14:09:50', 'one_time'),
(130, 22, 27, '1.00', 'USD', '2025-06-10 14:10:31', 'refunded'),
(131, 22, 26, '100.00', 'USD', '2025-06-10 14:10:47', 'one_time'),
(132, 21, 29, '100.00', 'USD', '2025-06-10 14:40:34', 'failed'),
(133, 21, 29, '100.00', 'USD', '2025-06-10 15:16:31', 'failed'),
(134, 21, 29, '100.00', 'USD', '2025-06-10 15:21:12', 'failed'),
(135, 21, 29, '100.00', 'USD', '2025-06-10 15:38:07', 'failed'),
(136, 21, 29, '100.00', 'USD', '2025-06-10 15:46:57', 'failed'),
(137, 21, 29, '100.00', 'USD', '2025-06-10 15:49:57', 'failed'),
(138, 21, 29, '100.00', 'USD', '2025-06-10 16:00:39', 'failed'),
(139, 21, 29, '100.00', 'USD', '2025-06-10 16:26:21', 'failed'),
(140, 21, 29, '100.00', 'USD', '2025-06-10 16:48:26', 'refunded'),
(141, 21, 29, '100.00', 'USD', '2025-06-10 16:54:42', 'recurring'),
(142, 22, 27, '1.00', 'USD', '2025-06-10 17:00:45', 'refunded'),
(143, 22, 22, '10.00', 'USD', '2025-06-10 17:00:54', 'refunded'),
(144, 22, 27, '1.00', 'USD', '2025-06-10 17:04:41', 'refunded'),
(145, 22, 27, '1.00', 'USD', '2025-06-10 17:05:41', 'recurring'),
(146, 22, 27, '1.00', 'USD', '2025-06-10 17:06:41', 'recurring'),
(147, 22, 27, '1.00', 'USD', '2025-06-10 17:07:41', 'recurring'),
(148, 22, 27, '1.00', 'USD', '2025-06-10 17:08:41', 'refunded'),
(149, 22, 27, '1.00', 'USD', '2025-06-10 17:17:26', 'recurring'),
(150, 22, 27, '1.00', 'USD', '2025-06-10 17:27:14', 'recurring'),
(151, 22, 27, '1.00', 'USD', '2025-06-10 17:28:14', 'recurring'),
(152, 22, 27, '1.00', 'USD', '2025-06-10 17:29:14', 'recurring'),
(153, 22, 27, '1.00', 'USD', '2025-06-10 17:30:14', 'recurring'),
(154, 22, 27, '1.00', 'USD', '2025-06-10 17:31:14', 'recurring'),
(155, 22, 27, '1.00', 'USD', '2025-06-10 17:32:14', 'recurring'),
(156, 22, 27, '1.00', 'USD', '2025-06-10 17:33:14', 'recurring'),
(157, 22, 27, '1.00', 'USD', '2025-06-10 17:34:14', 'recurring'),
(158, 22, 27, '1.00', 'USD', '2025-06-10 17:35:14', 'recurring'),
(159, 22, 27, '1.00', 'USD', '2025-06-10 17:36:29', 'recurring'),
(160, 22, 27, '1.00', 'USD', '2025-06-10 17:37:29', 'recurring'),
(161, 22, 27, '1.00', 'USD', '2025-06-10 17:38:29', 'recurring'),
(162, 22, 27, '1.00', 'USD', '2025-06-10 17:39:29', 'recurring'),
(163, 22, 27, '1.00', 'USD', '2025-06-10 17:40:29', 'recurring'),
(164, 22, 27, '1.00', 'USD', '2025-06-10 17:41:29', 'recurring'),
(165, 22, 27, '1.00', 'USD', '2025-06-10 17:42:29', 'recurring'),
(166, 22, 27, '1.00', 'USD', '2025-06-10 17:43:29', 'recurring'),
(167, 22, 27, '1.00', 'USD', '2025-06-10 17:44:29', 'recurring'),
(168, 22, 27, '1.00', 'USD', '2025-06-10 17:45:29', 'recurring'),
(169, 22, 27, '1.00', 'USD', '2025-06-10 17:46:29', 'recurring'),
(170, 22, 27, '1.00', 'USD', '2025-06-10 17:47:29', 'recurring'),
(171, 22, 27, '1.00', 'USD', '2025-06-10 17:48:29', 'recurring'),
(172, 22, 27, '1.00', 'USD', '2025-06-10 17:49:29', 'recurring'),
(173, 22, 27, '1.00', 'USD', '2025-06-10 17:50:29', 'recurring'),
(174, 22, 27, '1.00', 'USD', '2025-06-10 17:51:29', 'recurring'),
(175, 22, 27, '1.00', 'USD', '2025-06-10 17:52:29', 'recurring'),
(176, 22, 27, '1.00', 'USD', '2025-06-10 17:53:29', 'recurring'),
(177, 22, 27, '1.00', 'USD', '2025-06-10 17:54:29', 'recurring'),
(178, 22, 27, '1.00', 'USD', '2025-06-10 17:55:29', 'recurring'),
(179, 22, 27, '1.00', 'USD', '2025-06-10 17:56:29', 'recurring'),
(180, 22, 27, '1.00', 'USD', '2025-06-10 17:57:29', 'recurring'),
(181, 22, 27, '1.00', 'USD', '2025-06-10 17:58:29', 'recurring'),
(182, 22, 27, '1.00', 'USD', '2025-06-10 17:59:29', 'recurring'),
(183, 22, 27, '1.00', 'USD', '2025-06-10 18:00:29', 'recurring'),
(184, 22, 27, '1.00', 'USD', '2025-06-10 18:01:29', 'recurring'),
(185, 22, 27, '1.00', 'USD', '2025-06-10 18:02:29', 'recurring'),
(186, 22, 27, '1.00', 'USD', '2025-06-10 18:03:29', 'recurring'),
(187, 22, 27, '1.00', 'USD', '2025-06-10 18:04:29', 'recurring'),
(188, 22, 27, '1.00', 'USD', '2025-06-10 18:05:29', 'recurring'),
(189, 22, 27, '1.00', 'USD', '2025-06-10 18:06:29', 'recurring'),
(190, 22, 27, '1.00', 'USD', '2025-06-10 18:07:29', 'recurring'),
(191, 22, 27, '1.00', 'USD', '2025-06-10 18:08:29', 'recurring'),
(192, 22, 27, '1.00', 'USD', '2025-06-10 18:09:29', 'recurring'),
(193, 22, 27, '1.00', 'USD', '2025-06-10 18:10:29', 'recurring'),
(194, 22, 27, '1.00', 'USD', '2025-06-10 18:11:29', 'recurring'),
(195, 22, 27, '1.00', 'USD', '2025-06-10 18:12:29', 'recurring'),
(196, 22, 27, '1.00', 'USD', '2025-06-10 18:13:29', 'recurring'),
(197, 22, 27, '1.00', 'USD', '2025-06-10 18:14:29', 'recurring'),
(198, 22, 27, '1.00', 'USD', '2025-06-10 18:15:29', 'recurring'),
(199, 22, 27, '1.00', 'USD', '2025-06-10 18:16:29', 'recurring'),
(200, 22, 27, '1.00', 'USD', '2025-06-10 18:17:29', 'recurring'),
(201, 22, 27, '1.00', 'USD', '2025-06-10 18:18:29', 'recurring'),
(202, 22, 27, '1.00', 'USD', '2025-06-10 18:19:29', 'recurring'),
(203, 22, 27, '1.00', 'USD', '2025-06-10 18:20:29', 'recurring'),
(204, 21, 25, '100.00', 'USD', '2025-06-10 20:21:38', 'one_time'),
(205, 22, 27, '1.00', 'USD', '2025-06-10 18:21:29', 'recurring'),
(206, 21, 27, '100.00', 'USD', '2025-06-10 20:22:33', 'one_time'),
(207, 22, 27, '1.00', 'USD', '2025-06-10 18:22:29', 'recurring'),
(208, 22, 27, '1.00', 'USD', '2025-06-10 18:23:04', 'recurring'),
(209, 21, 27, '100.00', 'USD', '2025-06-10 20:24:04', 'refunded'),
(210, 22, 27, '1.00', 'USD', '2025-06-10 18:24:04', 'recurring'),
(211, 21, 32, '100.00', 'USD', '2025-06-10 20:25:24', 'one_time'),
(212, 22, 27, '1.00', 'USD', '2025-06-10 18:25:04', 'recurring'),
(213, 22, 27, '1.00', 'USD', '2025-06-10 18:26:04', 'recurring'),
(214, 22, 27, '1.00', 'USD', '2025-06-10 18:27:04', 'recurring'),
(215, 22, 27, '1.00', 'USD', '2025-06-10 18:28:04', 'recurring'),
(216, 22, 27, '1.00', 'USD', '2025-06-10 18:29:04', 'recurring'),
(217, 22, 27, '1.00', 'USD', '2025-06-10 18:30:04', 'recurring'),
(218, 22, 27, '1.00', 'USD', '2025-06-10 18:31:04', 'recurring'),
(219, 22, 27, '1.00', 'USD', '2025-06-10 18:32:04', 'recurring'),
(220, 22, 25, '10.00', 'USD', '2025-06-10 18:32:52', 'recurring'),
(221, 22, 27, '1.00', 'USD', '2025-06-10 18:33:04', 'recurring'),
(222, 22, 25, '10.00', 'USD', '2025-06-10 18:33:52', 'failed'),
(223, 22, 27, '1.00', 'USD', '2025-06-10 18:34:04', 'recurring'),
(224, 22, 27, '1.00', 'USD', '2025-06-10 18:35:04', 'recurring'),
(225, 22, 25, '10.00', 'USD', '2025-06-10 19:06:57', 'recurring'),
(226, 22, 25, '10.00', 'USD', '2025-06-10 19:07:57', 'recurring'),
(227, 22, 25, '10.00', 'USD', '2025-06-10 19:08:57', 'recurring'),
(228, 22, 25, '10.00', 'USD', '2025-06-10 19:09:57', 'recurring'),
(229, 22, 25, '10.00', 'USD', '2025-06-10 19:10:57', 'recurring'),
(230, 22, 25, '10.00', 'USD', '2025-06-10 19:11:57', 'recurring'),
(231, 22, 25, '10.00', 'USD', '2025-06-10 19:12:57', 'recurring'),
(232, 22, 25, '10.00', 'USD', '2025-06-10 19:13:57', 'recurring'),
(233, 22, 25, '10.00', 'USD', '2025-06-10 19:14:57', 'recurring'),
(234, 22, 25, '10.00', 'USD', '2025-06-10 19:15:57', 'recurring'),
(235, 22, 25, '10.00', 'USD', '2025-06-10 19:16:57', 'recurring'),
(236, 22, 25, '10.00', 'USD', '2025-06-10 19:17:57', 'recurring'),
(237, 22, 25, '10.00', 'USD', '2025-06-10 19:18:57', 'recurring'),
(238, 22, 25, '10.00', 'USD', '2025-06-10 19:19:57', 'recurring'),
(239, 22, 32, '10.00', 'USD', '2025-06-10 19:33:21', 'recurring'),
(240, 22, 32, '10.00', 'USD', '2025-06-10 19:34:21', 'recurring'),
(241, 22, 32, '10.00', 'USD', '2025-06-10 19:35:21', 'recurring'),
(242, 22, 32, '10.00', 'USD', '2025-06-10 19:36:21', 'recurring'),
(243, 22, 32, '10.00', 'USD', '2025-06-10 19:37:21', 'recurring'),
(244, 22, 32, '10.00', 'USD', '2025-06-10 19:38:21', 'recurring'),
(245, 22, 32, '10.00', 'USD', '2025-06-10 19:39:21', 'failed'),
(246, 22, 27, '1.00', 'USD', '2025-06-10 19:45:27', 'recurring'),
(247, 22, 27, '1.00', 'USD', '2025-06-10 19:46:27', 'recurring'),
(248, 22, 27, '1.00', 'USD', '2025-06-10 19:47:27', 'recurring'),
(249, 22, 27, '1.00', 'USD', '2025-06-10 19:48:27', 'recurring'),
(250, 22, 27, '1.00', 'USD', '2025-06-10 19:49:27', 'recurring'),
(251, 22, 27, '1.00', 'USD', '2025-06-10 19:50:27', 'recurring'),
(252, 21, 33, '10.00', 'USD', '2025-06-10 19:50:42', 'one_time'),
(253, 22, 27, '1.00', 'USD', '2025-06-10 19:51:27', 'recurring'),
(254, 22, 27, '1.00', 'USD', '2025-06-10 19:52:27', 'recurring'),
(255, 22, 27, '1.00', 'USD', '2025-06-10 19:53:27', 'recurring'),
(256, 22, 27, '1.00', 'USD', '2025-06-10 19:54:27', 'recurring'),
(257, 22, 27, '1.00', 'USD', '2025-06-10 19:55:27', 'recurring'),
(258, 22, 27, '1.00', 'USD', '2025-06-10 19:56:27', 'recurring'),
(259, 22, 27, '1.00', 'USD', '2025-06-10 19:57:27', 'recurring'),
(260, 22, 27, '1.00', 'USD', '2025-06-10 19:58:27', 'recurring'),
(261, 22, 27, '1.00', 'USD', '2025-06-10 19:59:27', 'recurring'),
(262, 22, 27, '1.00', 'USD', '2025-06-10 20:00:27', 'recurring'),
(263, 22, 27, '1.00', 'USD', '2025-06-10 20:01:27', 'recurring'),
(264, 22, 27, '1.00', 'USD', '2025-06-10 20:02:27', 'recurring'),
(265, 22, 27, '1.00', 'USD', '2025-06-10 20:03:27', 'recurring'),
(266, 22, 27, '1.00', 'USD', '2025-06-10 20:04:27', 'recurring'),
(267, 22, 32, '10.00', 'USD', '2025-06-10 20:15:09', 'recurring'),
(268, 21, 33, '10.00', 'USD', '2025-06-10 20:53:37', 'one_time'),
(269, 21, 33, '10.00', 'USD', '2025-06-10 21:24:16', 'refunded'),
(270, 22, 22, '10.00', 'USD', '2025-06-11 15:34:20', 'recurring'),
(271, 22, 22, '10.00', 'USD', '2025-06-11 15:35:20', 'recurring'),
(272, 22, 22, '10.00', 'USD', '2025-06-11 15:36:20', 'recurring'),
(273, 22, 22, '10.00', 'USD', '2025-06-11 15:37:20', 'recurring'),
(274, 22, 22, '10.00', 'USD', '2025-06-11 15:38:20', 'recurring'),
(275, 22, 22, '10.00', 'USD', '2025-06-11 15:39:20', 'recurring'),
(276, 22, 22, '10.00', 'USD', '2025-06-11 15:40:20', 'recurring'),
(277, 22, 22, '10.00', 'USD', '2025-06-11 15:41:20', 'recurring'),
(278, 22, 22, '10.00', 'USD', '2025-06-11 15:42:20', 'recurring'),
(279, 22, 22, '10.00', 'USD', '2025-06-11 15:43:20', 'recurring'),
(280, 22, 22, '10.00', 'USD', '2025-06-11 15:44:20', 'recurring'),
(281, 22, 22, '10.00', 'USD', '2025-06-11 15:45:20', 'recurring'),
(282, 22, 22, '10.00', 'USD', '2025-06-11 15:46:20', 'recurring'),
(283, 22, 22, '10.00', 'USD', '2025-06-11 15:47:20', 'recurring'),
(284, 22, 22, '10.00', 'USD', '2025-06-11 15:48:20', 'recurring'),
(285, 22, 22, '10.00', 'USD', '2025-06-11 15:49:20', 'recurring'),
(286, 22, 22, '10.00', 'USD', '2025-06-11 15:50:20', 'recurring'),
(287, 22, 22, '10.00', 'USD', '2025-06-11 15:51:20', 'recurring'),
(288, 22, 22, '10.00', 'USD', '2025-06-11 15:52:20', 'recurring'),
(289, 22, 22, '10.00', 'USD', '2025-06-11 15:53:20', 'recurring'),
(290, 22, 22, '10.00', 'USD', '2025-06-11 15:54:20', 'recurring'),
(291, 22, 22, '10.00', 'USD', '2025-06-11 15:55:20', 'recurring'),
(292, 22, 22, '10.00', 'USD', '2025-06-11 15:56:20', 'failed'),
(293, 22, 32, '10.00', 'USD', '2025-06-12 19:00:13', 'recurring'),
(294, 21, 33, '10.00', 'USD', '2025-06-12 20:13:44', 'one_time'),
(295, 23, 31, '3.00', 'USD', '2025-06-12 22:17:01', 'payout'),
(296, 23, 31, '2.00', 'USD', '2025-06-12 22:29:01', 'payout'),
(297, 23, 31, '8.00', 'USD', '2025-06-12 22:30:01', 'payout'),
(298, 23, 31, '18.00', 'USD', '2025-06-12 22:45:01', 'payout'),
(299, 23, 31, '2.00', 'USD', '2025-06-12 22:47:01', 'payout'),
(300, 24, 34, '100.00', 'USD', '2025-06-15 18:52:36', 'one_time'),
(301, 24, 34, '100.00', 'USD', '2025-06-15 18:53:52', 'one_time'),
(302, 24, 34, '10.00', 'USD', '2025-06-15 18:58:01', 'payout'),
(303, 24, 27, '1.00', 'USD', '2025-06-15 20:57:30', 'recurring'),
(304, 24, 27, '1.00', 'USD', '2025-06-15 20:58:30', 'recurring'),
(305, 24, 27, '10.00', 'USD', '2025-06-15 20:59:01', 'payout'),
(306, 24, 27, '1.00', 'USD', '2025-06-15 20:59:30', 'recurring'),
(307, 24, 27, '1.00', 'USD', '2025-06-15 21:00:30', 'recurring'),
(308, 24, 27, '90.00', 'USD', '2025-06-15 21:01:02', 'payout'),
(309, 24, 27, '1.00', 'USD', '2025-06-15 21:01:30', 'recurring'),
(310, 23, 31, '2.31', 'USD', '2025-06-15 22:55:01', 'payout'),
(311, 22, 32, '10.00', 'USD', '2025-06-17 19:36:00', 'recurring'),
(312, 23, 31, '3.00', 'USD', '2025-06-17 23:03:01', 'payout'),
(313, 24, 36, '100.00', 'USD', '2025-06-19 21:24:28', 'refunded'),
(314, 24, 36, '100.00', 'USD', '2025-06-19 21:25:47', 'refunded'),
(315, 23, 31, '6.00', 'USD', '2025-06-19 23:53:01', 'payout'),
(316, 23, 31, '2.00', 'USD', '2025-06-19 23:53:01', 'payout'),
(317, 22, 36, '100.00', 'USD', '2025-06-21 11:21:08', 'refunded'),
(318, 22, 36, '100.00', 'USD', '2025-06-21 14:52:35', 'refunded'),
(319, 22, 36, '100.00', 'USD', '2025-06-21 15:20:03', 'refunded'),
(320, 22, 36, '100.00', 'USD', '2025-06-21 23:48:37', 'refunded'),
(321, 22, 36, '100.00', 'USD', '2025-06-21 23:59:21', 'refunded'),
(322, 22, 36, '100.00', 'USD', '2025-06-22 00:00:37', 'refunded'),
(323, 22, 36, '100.00', 'USD', '2025-06-22 00:02:03', 'refunded'),
(324, 22, 36, '300.00', 'USD', '2025-06-22 00:05:09', 'refunded'),
(325, 22, 36, '300.00', 'USD', '2025-06-22 00:31:42', 'recurring'),
(326, 29, 38, '1.00', 'USD', '2025-06-22 10:16:21', 'refunded'),
(327, 22, 39, '10.00', 'USD', '2025-06-22 11:18:53', 'recurring'),
(328, 22, 39, '10.00', 'USD', '2025-06-22 11:19:53', 'recurring'),
(329, 22, 39, '10.00', 'USD', '2025-06-22 11:20:53', 'recurring'),
(330, 22, 39, '10.00', 'USD', '2025-06-22 11:21:53', 'recurring'),
(331, 22, 39, '10.00', 'USD', '2025-06-22 11:22:53', 'recurring'),
(332, 22, 39, '10.00', 'USD', '2025-06-22 11:23:53', 'recurring'),
(333, 22, 39, '10.00', 'USD', '2025-06-22 11:24:53', 'recurring'),
(334, 22, 39, '10.00', 'USD', '2025-06-22 11:25:53', 'refunded'),
(335, 22, 39, '10.00', 'USD', '2025-06-22 11:26:53', 'refunded'),
(336, 22, 39, '10.00', 'USD', '2025-06-22 11:27:53', 'refunded'),
(337, 22, 39, '10.00', 'USD', '2025-06-22 11:28:53', 'failed'),
(338, 24, 27, '1.00', 'USD', '2025-06-22 13:50:47', 'recurring'),
(339, 24, 27, '1.00', 'USD', '2025-06-22 13:51:47', 'recurring'),
(340, 24, 27, '1.00', 'USD', '2025-06-22 13:52:47', 'recurring'),
(341, 24, 27, '1.00', 'USD', '2025-06-22 13:53:47', 'recurring'),
(342, 24, 27, '1.00', 'USD', '2025-06-22 13:54:47', 'recurring'),
(343, 24, 27, '1.00', 'USD', '2025-06-22 13:55:47', 'recurring'),
(344, 24, 27, '1.00', 'USD', '2025-06-22 13:56:47', 'recurring'),
(345, 24, 27, '1.00', 'USD', '2025-06-22 13:57:47', 'recurring'),
(346, 24, 27, '1.00', 'USD', '2025-06-22 13:58:47', 'recurring'),
(347, 24, 27, '1.00', 'USD', '2025-06-22 13:59:47', 'recurring'),
(348, 24, 27, '1.00', 'USD', '2025-06-22 14:00:47', 'recurring'),
(349, 24, 27, '1.00', 'USD', '2025-06-22 14:01:47', 'recurring'),
(350, 24, 27, '1.00', 'USD', '2025-06-22 14:02:47', 'recurring'),
(351, 24, 27, '1.00', 'USD', '2025-06-22 14:03:47', 'recurring'),
(352, 24, 27, '1.00', 'USD', '2025-06-22 14:04:47', 'recurring'),
(353, 24, 27, '1.00', 'USD', '2025-06-22 14:05:47', 'recurring'),
(354, 24, 27, '1.00', 'USD', '2025-06-22 14:06:47', 'recurring'),
(355, 24, 27, '1.00', 'USD', '2025-06-22 14:07:47', 'recurring'),
(356, 24, 27, '1.00', 'USD', '2025-06-22 14:08:47', 'recurring'),
(357, 24, 27, '1.00', 'USD', '2025-06-22 14:09:47', 'recurring'),
(358, 24, 27, '1.00', 'USD', '2025-06-22 14:10:47', 'recurring'),
(359, 29, 38, '1.00', 'USD', '2025-06-22 14:11:20', 'recurring'),
(360, 24, 27, '1.00', 'USD', '2025-06-22 14:11:47', 'recurring'),
(361, 24, 27, '1.00', 'USD', '2025-06-22 14:12:47', 'recurring'),
(362, 24, 27, '1.00', 'USD', '2025-06-22 14:13:47', 'recurring'),
(363, 24, 27, '1.00', 'USD', '2025-06-22 14:14:47', 'recurring'),
(364, 24, 27, '1.00', 'USD', '2025-06-22 14:15:47', 'recurring'),
(365, 24, 27, '1.00', 'USD', '2025-06-22 14:16:47', 'recurring'),
(366, 24, 27, '1.00', 'USD', '2025-06-22 14:17:47', 'recurring'),
(367, 24, 27, '1.00', 'USD', '2025-06-22 14:18:47', 'recurring'),
(368, 24, 27, '1.00', 'USD', '2025-06-22 14:19:47', 'recurring'),
(369, 24, 27, '1.00', 'USD', '2025-06-22 14:20:47', 'recurring'),
(370, 24, 27, '1.00', 'USD', '2025-06-22 14:21:47', 'recurring'),
(371, 24, 27, '1.00', 'USD', '2025-06-22 14:22:47', 'recurring'),
(372, 24, 27, '1.00', 'USD', '2025-06-22 14:23:47', 'recurring'),
(373, 24, 27, '1.00', 'USD', '2025-06-22 14:24:47', 'recurring'),
(374, 24, 27, '1.00', 'USD', '2025-06-22 14:25:47', 'recurring'),
(375, 24, 27, '1.00', 'USD', '2025-06-22 14:26:47', 'recurring'),
(376, 24, 27, '1.00', 'USD', '2025-06-22 14:27:47', 'recurring'),
(377, 24, 27, '1.00', 'USD', '2025-06-22 14:28:47', 'recurring'),
(378, 24, 27, '1.00', 'USD', '2025-06-22 14:29:47', 'recurring'),
(379, 24, 27, '1.00', 'USD', '2025-06-22 14:30:47', 'recurring'),
(380, 24, 27, '1.00', 'USD', '2025-06-22 14:31:47', 'recurring'),
(381, 24, 27, '1.00', 'USD', '2025-06-22 14:32:47', 'recurring'),
(382, 24, 27, '1.00', 'USD', '2025-06-22 14:33:47', 'recurring'),
(383, 24, 27, '1.00', 'USD', '2025-06-22 14:34:47', 'recurring'),
(384, 24, 27, '1.00', 'USD', '2025-06-22 14:35:47', 'recurring'),
(385, 24, 27, '1.00', 'USD', '2025-06-22 14:36:47', 'recurring'),
(386, 24, 27, '1.00', 'USD', '2025-06-22 14:37:47', 'recurring'),
(387, 24, 27, '1.00', 'USD', '2025-06-22 14:38:47', 'recurring'),
(388, 24, 27, '1.00', 'USD', '2025-06-22 14:39:47', 'recurring'),
(389, 24, 27, '1.00', 'USD', '2025-06-22 14:40:47', 'recurring'),
(390, 24, 27, '1.00', 'USD', '2025-06-22 14:41:47', 'recurring'),
(391, 24, 27, '1.00', 'USD', '2025-06-22 14:42:47', 'recurring'),
(392, 24, 27, '1.00', 'USD', '2025-06-22 14:43:47', 'recurring'),
(393, 24, 27, '1.00', 'USD', '2025-06-22 14:44:47', 'recurring'),
(394, 24, 27, '1.00', 'USD', '2025-06-22 14:45:47', 'recurring'),
(395, 24, 27, '1.00', 'USD', '2025-06-22 14:46:47', 'recurring'),
(396, 24, 27, '1.00', 'USD', '2025-06-22 14:47:47', 'recurring'),
(397, 24, 27, '1.00', 'USD', '2025-06-22 14:48:47', 'recurring'),
(398, 24, 27, '1.00', 'USD', '2025-06-22 14:49:47', 'recurring'),
(399, 24, 27, '1.00', 'USD', '2025-06-22 14:50:47', 'recurring'),
(400, 24, 27, '1.00', 'USD', '2025-06-22 14:51:47', 'recurring'),
(401, 24, 27, '1.00', 'USD', '2025-06-22 14:52:47', 'recurring'),
(402, 24, 27, '1.00', 'USD', '2025-06-22 14:53:47', 'recurring'),
(403, 24, 27, '1.00', 'USD', '2025-06-22 14:54:47', 'recurring'),
(404, 24, 27, '1.00', 'USD', '2025-06-22 14:55:47', 'recurring'),
(405, 24, 27, '1.00', 'USD', '2025-06-22 14:56:47', 'recurring'),
(406, 24, 27, '1.00', 'USD', '2025-06-22 14:57:47', 'recurring'),
(407, 24, 27, '1.00', 'USD', '2025-06-22 14:58:47', 'recurring'),
(408, 24, 27, '1.00', 'USD', '2025-06-22 14:59:47', 'recurring'),
(409, 24, 27, '1.00', 'USD', '2025-06-22 15:00:47', 'recurring'),
(410, 24, 27, '1.00', 'USD', '2025-06-22 15:01:47', 'recurring'),
(411, 24, 27, '1.00', 'USD', '2025-06-22 15:02:47', 'recurring'),
(412, 24, 27, '1.00', 'USD', '2025-06-22 15:03:47', 'recurring'),
(413, 24, 27, '1.00', 'USD', '2025-06-22 15:04:47', 'recurring'),
(414, 24, 27, '1.00', 'USD', '2025-06-22 15:05:47', 'recurring'),
(415, 24, 27, '1.00', 'USD', '2025-06-22 15:06:47', 'recurring'),
(416, 24, 27, '1.00', 'USD', '2025-06-22 15:07:47', 'recurring'),
(417, 24, 27, '1.00', 'USD', '2025-06-22 15:08:47', 'recurring'),
(418, 24, 27, '1.00', 'USD', '2025-06-22 15:09:47', 'recurring'),
(419, 24, 27, '1.00', 'USD', '2025-06-22 15:10:47', 'recurring'),
(420, 24, 27, '1.00', 'USD', '2025-06-22 15:11:47', 'recurring'),
(421, 24, 27, '1.00', 'USD', '2025-06-22 15:12:47', 'recurring'),
(422, 24, 27, '1.00', 'USD', '2025-06-22 15:13:47', 'recurring'),
(423, 24, 27, '1.00', 'USD', '2025-06-22 15:14:47', 'recurring'),
(424, 24, 27, '1.00', 'USD', '2025-06-22 15:15:47', 'recurring'),
(425, 24, 27, '1.00', 'USD', '2025-06-22 15:16:47', 'recurring'),
(426, 24, 27, '1.00', 'USD', '2025-06-22 15:17:47', 'recurring'),
(427, 24, 27, '1.00', 'USD', '2025-06-22 15:18:47', 'recurring'),
(428, 22, 38, '1.00', 'USD', '2025-06-22 15:19:02', 'recurring'),
(429, 24, 27, '1.00', 'USD', '2025-06-22 15:19:47', 'recurring'),
(430, 24, 27, '1.00', 'USD', '2025-06-22 15:20:47', 'recurring'),
(431, 24, 27, '1.00', 'USD', '2025-06-22 15:21:47', 'recurring'),
(432, 24, 27, '1.00', 'USD', '2025-06-22 15:22:47', 'recurring'),
(433, 24, 27, '1.00', 'USD', '2025-06-22 15:23:47', 'recurring'),
(434, 24, 27, '1.00', 'USD', '2025-06-22 15:24:47', 'recurring'),
(435, 22, 38, '60.00', 'USD', '2025-06-22 15:26:01', 'payout'),
(436, 24, 27, '1.00', 'USD', '2025-06-22 15:25:47', 'recurring'),
(437, 24, 27, '1.00', 'USD', '2025-06-22 15:26:47', 'recurring'),
(438, 24, 27, '1.00', 'USD', '2025-06-22 15:27:47', 'recurring'),
(439, 24, 27, '1.00', 'USD', '2025-06-22 15:28:47', 'recurring'),
(440, 24, 27, '1.00', 'USD', '2025-06-22 15:29:47', 'recurring'),
(441, 24, 27, '1.00', 'USD', '2025-06-22 15:30:47', 'recurring'),
(442, 24, 27, '1.00', 'USD', '2025-06-22 15:31:47', 'recurring'),
(443, 24, 27, '1.00', 'USD', '2025-06-22 15:32:47', 'recurring'),
(444, 24, 27, '1.00', 'USD', '2025-06-22 15:33:47', 'recurring'),
(445, 24, 27, '1.00', 'USD', '2025-06-22 15:34:47', 'recurring'),
(446, 24, 27, '1.00', 'USD', '2025-06-22 15:35:47', 'recurring'),
(447, 24, 27, '1.00', 'USD', '2025-06-22 15:36:47', 'recurring'),
(448, 24, 27, '1.00', 'USD', '2025-06-22 15:37:47', 'recurring'),
(449, 24, 27, '1.00', 'USD', '2025-06-22 15:38:47', 'recurring'),
(450, 24, 27, '1.00', 'USD', '2025-06-22 15:39:47', 'recurring'),
(451, 24, 27, '1.00', 'USD', '2025-06-22 15:40:47', 'recurring'),
(452, 24, 27, '1.00', 'USD', '2025-06-22 15:41:47', 'recurring'),
(453, 24, 27, '1.00', 'USD', '2025-06-22 15:42:47', 'recurring'),
(454, 24, 27, '1.00', 'USD', '2025-06-22 15:43:47', 'recurring'),
(455, 24, 27, '1.00', 'USD', '2025-06-22 15:44:47', 'recurring'),
(456, 24, 27, '1.00', 'USD', '2025-06-22 15:45:47', 'recurring'),
(457, 24, 27, '1.00', 'USD', '2025-06-22 15:46:47', 'recurring'),
(458, 24, 27, '1.00', 'USD', '2025-06-22 15:47:47', 'recurring'),
(459, 24, 27, '1.00', 'USD', '2025-06-22 15:48:47', 'recurring'),
(460, 24, 27, '1.00', 'USD', '2025-06-22 15:49:47', 'recurring'),
(461, 24, 27, '1.00', 'USD', '2025-06-22 15:50:47', 'recurring'),
(462, 24, 27, '1.00', 'USD', '2025-06-22 15:51:47', 'recurring'),
(463, 24, 27, '1.00', 'USD', '2025-06-22 15:52:47', 'recurring'),
(464, 24, 27, '1.00', 'USD', '2025-06-22 15:53:47', 'recurring'),
(465, 24, 27, '1.00', 'USD', '2025-06-22 15:54:47', 'recurring'),
(466, 24, 27, '1.00', 'USD', '2025-06-22 15:55:47', 'recurring'),
(467, 24, 27, '1.00', 'USD', '2025-06-22 15:56:47', 'recurring'),
(468, 24, 27, '1.00', 'USD', '2025-06-22 15:57:47', 'recurring'),
(469, 24, 27, '1.00', 'USD', '2025-06-22 15:58:47', 'recurring'),
(470, 24, 27, '1.00', 'USD', '2025-06-22 15:59:47', 'recurring'),
(471, 24, 27, '1.00', 'USD', '2025-06-22 16:00:47', 'recurring'),
(472, 24, 27, '1.00', 'USD', '2025-06-22 16:01:47', 'recurring'),
(473, 24, 27, '1.00', 'USD', '2025-06-22 16:02:47', 'recurring'),
(474, 24, 27, '1.00', 'USD', '2025-06-22 16:03:47', 'recurring'),
(475, 24, 27, '1.00', 'USD', '2025-06-22 16:04:47', 'recurring'),
(476, 24, 27, '1.00', 'USD', '2025-06-22 16:05:47', 'recurring'),
(477, 24, 27, '1.00', 'USD', '2025-06-22 16:06:47', 'recurring'),
(478, 24, 27, '1.00', 'USD', '2025-06-22 16:07:47', 'recurring'),
(479, 24, 27, '1.00', 'USD', '2025-06-22 16:08:47', 'recurring'),
(480, 24, 27, '1.00', 'USD', '2025-06-22 16:09:47', 'recurring'),
(481, 24, 27, '1.00', 'USD', '2025-06-22 16:10:47', 'recurring'),
(482, 24, 27, '1.00', 'USD', '2025-06-22 16:11:47', 'recurring'),
(483, 24, 27, '1.00', 'USD', '2025-06-22 16:12:47', 'recurring'),
(484, 24, 27, '1.00', 'USD', '2025-06-22 16:13:47', 'recurring'),
(485, 24, 27, '1.00', 'USD', '2025-06-22 16:14:47', 'recurring'),
(486, 24, 27, '1.00', 'USD', '2025-06-22 16:15:47', 'recurring'),
(487, 24, 27, '1.00', 'USD', '2025-06-22 16:16:47', 'recurring'),
(488, 24, 27, '1.00', 'USD', '2025-06-22 16:17:47', 'recurring'),
(489, 24, 25, '10.00', 'USD', '2025-06-22 16:18:17', 'recurring'),
(490, 24, 49, '10.00', 'USD', '2025-06-24 19:15:33', 'one_time'),
(491, 24, 49, '10.00', 'USD', '2025-06-24 19:15:54', 'one_time'),
(492, 24, 26, '100.00', 'USD', '2025-06-25 20:04:27', 'recurring'),
(493, 22, 32, '10.00', 'USD', '2025-06-28 16:51:38', 'recurring'),
(494, 22, 23, '10.00', 'USD', '2025-06-28 16:51:53', 'recurring'),
(495, 22, 23, '10.00', 'USD', '2025-06-28 16:52:53', 'recurring'),
(496, 22, 23, '10.00', 'USD', '2025-06-28 16:53:53', 'recurring'),
(497, 22, 23, '10.00', 'USD', '2025-06-28 16:54:53', 'recurring'),
(498, 22, 23, '10.00', 'USD', '2025-06-28 16:55:53', 'recurring'),
(499, 22, 23, '10.00', 'USD', '2025-06-28 16:56:53', 'recurring'),
(500, 22, 23, '10.00', 'USD', '2025-06-28 16:57:53', 'recurring'),
(501, 22, 23, '10.00', 'USD', '2025-06-28 16:58:53', 'recurring'),
(502, 22, 23, '10.00', 'USD', '2025-06-28 16:59:53', 'recurring'),
(503, 22, 23, '10.00', 'USD', '2025-06-28 17:00:53', 'recurring'),
(504, 22, 23, '10.00', 'USD', '2025-06-28 17:01:53', 'recurring'),
(505, 22, 23, '10.00', 'USD', '2025-06-28 17:02:53', 'recurring'),
(506, 22, 23, '10.00', 'USD', '2025-06-28 17:03:53', 'recurring'),
(507, 22, 23, '10.00', 'USD', '2025-06-28 17:04:53', 'recurring'),
(508, 22, 23, '10.00', 'USD', '2025-06-28 17:05:53', 'failed'),
(509, 24, 27, '1.00', 'USD', '2025-07-02 15:07:55', 'recurring'),
(510, 24, 27, '1.00', 'USD', '2025-07-02 15:08:55', 'recurring'),
(511, 24, 27, '1.00', 'USD', '2025-07-02 15:09:55', 'recurring'),
(512, 24, 27, '1.00', 'USD', '2025-07-02 15:10:55', 'recurring'),
(513, 24, 27, '1.00', 'USD', '2025-07-02 15:11:55', 'recurring'),
(514, 24, 27, '1.00', 'USD', '2025-07-02 15:12:55', 'recurring'),
(515, 24, 27, '1.00', 'USD', '2025-07-02 15:13:55', 'recurring'),
(516, 24, 27, '1.00', 'USD', '2025-07-02 15:14:55', 'recurring'),
(517, 24, 27, '1.00', 'USD', '2025-07-02 15:15:55', 'recurring'),
(518, 24, 27, '1.00', 'USD', '2025-07-02 15:16:55', 'recurring'),
(519, 24, 27, '1.00', 'USD', '2025-07-02 15:17:55', 'recurring'),
(520, 24, 27, '1.00', 'USD', '2025-07-02 15:18:55', 'recurring'),
(521, 24, 27, '1.00', 'USD', '2025-07-02 15:19:55', 'recurring'),
(522, 24, 27, '1.00', 'USD', '2025-07-02 15:20:55', 'recurring'),
(523, 24, 27, '1.00', 'USD', '2025-07-02 15:21:55', 'recurring'),
(524, 24, 27, '1.00', 'USD', '2025-07-02 15:22:55', 'recurring'),
(525, 24, 27, '1.00', 'USD', '2025-07-02 15:23:55', 'recurring'),
(526, 24, 27, '1.00', 'USD', '2025-07-02 15:24:55', 'recurring'),
(527, 24, 27, '1.00', 'USD', '2025-07-02 15:25:55', 'recurring'),
(528, 24, 27, '1.00', 'USD', '2025-07-02 15:26:55', 'recurring'),
(529, 24, 27, '1.00', 'USD', '2025-07-02 15:27:55', 'recurring'),
(530, 24, 27, '1.00', 'USD', '2025-07-02 15:28:55', 'recurring'),
(531, 24, 27, '1.00', 'USD', '2025-07-02 15:29:55', 'recurring'),
(532, 24, 27, '1.00', 'USD', '2025-07-02 15:30:55', 'recurring'),
(533, 24, 27, '1.00', 'USD', '2025-07-02 15:31:55', 'recurring'),
(534, 24, 27, '1.00', 'USD', '2025-07-02 15:32:55', 'recurring'),
(535, 24, 27, '1.00', 'USD', '2025-07-02 15:33:55', 'recurring'),
(536, 24, 27, '1.00', 'USD', '2025-07-02 15:34:55', 'recurring'),
(537, 24, 27, '1.00', 'USD', '2025-07-02 15:35:55', 'recurring'),
(538, 24, 27, '1.00', 'USD', '2025-07-02 15:36:55', 'recurring'),
(539, 24, 27, '1.00', 'USD', '2025-07-02 15:37:55', 'recurring'),
(540, 24, 27, '1.00', 'USD', '2025-07-02 15:38:55', 'recurring'),
(541, 24, 27, '1.00', 'USD', '2025-07-02 15:39:55', 'recurring'),
(542, 24, 27, '1.00', 'USD', '2025-07-02 15:40:55', 'recurring'),
(543, 24, 27, '1.00', 'USD', '2025-07-02 15:41:55', 'recurring'),
(544, 24, 27, '1.00', 'USD', '2025-07-02 15:42:55', 'recurring'),
(545, 24, 27, '1.00', 'USD', '2025-07-02 15:43:55', 'recurring'),
(546, 24, 27, '1.00', 'USD', '2025-07-02 15:44:55', 'recurring'),
(547, 24, 27, '1.00', 'USD', '2025-07-02 15:45:55', 'recurring'),
(548, 24, 27, '1.00', 'USD', '2025-07-02 15:46:55', 'recurring'),
(549, 24, 27, '1.00', 'USD', '2025-07-02 15:47:55', 'recurring'),
(550, 24, 27, '1.00', 'USD', '2025-07-02 15:48:55', 'recurring'),
(551, 24, 27, '1.00', 'USD', '2025-07-02 15:49:55', 'recurring'),
(552, 24, 27, '1.00', 'USD', '2025-07-02 15:50:55', 'recurring'),
(553, 24, 27, '1.00', 'USD', '2025-07-02 15:51:55', 'recurring'),
(554, 24, 27, '1.00', 'USD', '2025-07-02 15:52:55', 'recurring'),
(555, 24, 27, '1.00', 'USD', '2025-07-02 15:53:55', 'recurring'),
(556, 24, 27, '1.00', 'USD', '2025-07-02 15:54:55', 'recurring'),
(557, 24, 27, '1.00', 'USD', '2025-07-02 15:55:55', 'recurring'),
(558, 24, 27, '1.00', 'USD', '2025-07-02 15:56:55', 'recurring'),
(559, 24, 27, '1.00', 'USD', '2025-07-02 15:57:55', 'recurring'),
(560, 24, 27, '1.00', 'USD', '2025-07-02 15:58:55', 'recurring'),
(561, 24, 27, '1.00', 'USD', '2025-07-02 15:59:55', 'recurring'),
(562, 24, 27, '1.00', 'USD', '2025-07-02 16:00:55', 'recurring'),
(563, 24, 27, '1.00', 'USD', '2025-07-02 16:01:55', 'recurring'),
(564, 24, 27, '1.00', 'USD', '2025-07-02 16:02:55', 'recurring'),
(565, 24, 27, '1.00', 'USD', '2025-07-02 16:03:55', 'recurring'),
(566, 24, 27, '1.00', 'USD', '2025-07-02 16:04:55', 'recurring'),
(567, 24, 27, '1.00', 'USD', '2025-07-02 16:05:55', 'recurring'),
(568, 24, 27, '1.00', 'USD', '2025-07-02 16:06:55', 'recurring'),
(569, 24, 27, '1.00', 'USD', '2025-07-02 16:07:55', 'recurring'),
(570, 24, 27, '1.00', 'USD', '2025-07-02 16:08:55', 'recurring'),
(571, 24, 27, '1.00', 'USD', '2025-07-02 16:09:55', 'recurring'),
(572, 24, 27, '1.00', 'USD', '2025-07-02 16:10:55', 'recurring'),
(573, 24, 27, '1.00', 'USD', '2025-07-02 16:11:55', 'recurring'),
(574, 24, 27, '1.00', 'USD', '2025-07-02 16:12:55', 'recurring'),
(575, 24, 27, '1.00', 'USD', '2025-07-02 16:13:55', 'recurring'),
(576, 24, 27, '1.00', 'USD', '2025-07-02 16:14:55', 'recurring'),
(577, 24, 27, '1.00', 'USD', '2025-07-02 16:15:55', 'recurring'),
(578, 24, 27, '1.00', 'USD', '2025-07-02 16:16:55', 'recurring'),
(579, 24, 27, '1.00', 'USD', '2025-07-02 16:17:55', 'recurring'),
(580, 24, 27, '1.00', 'USD', '2025-07-02 16:18:55', 'recurring'),
(581, 24, 27, '1.00', 'USD', '2025-07-02 16:19:55', 'recurring'),
(582, 24, 27, '1.00', 'USD', '2025-07-02 16:20:55', 'recurring'),
(583, 24, 27, '1.00', 'USD', '2025-07-02 16:21:55', 'recurring'),
(584, 24, 27, '1.00', 'USD', '2025-07-02 16:22:55', 'recurring'),
(585, 24, 27, '1.00', 'USD', '2025-07-02 16:23:55', 'recurring'),
(586, 24, 27, '1.00', 'USD', '2025-07-02 16:24:55', 'recurring'),
(587, 24, 27, '1.00', 'USD', '2025-07-02 16:25:55', 'recurring'),
(588, 24, 27, '1.00', 'USD', '2025-07-02 16:26:55', 'recurring'),
(589, 24, 27, '1.00', 'USD', '2025-07-02 16:27:55', 'recurring'),
(590, 24, 27, '1.00', 'USD', '2025-07-02 16:28:55', 'recurring'),
(591, 24, 27, '1.00', 'USD', '2025-07-02 16:29:55', 'recurring'),
(592, 24, 27, '1.00', 'USD', '2025-07-02 16:30:55', 'recurring'),
(593, 24, 27, '1.00', 'USD', '2025-07-02 16:31:55', 'recurring'),
(594, 24, 27, '1.00', 'USD', '2025-07-02 16:32:55', 'recurring'),
(595, 24, 27, '1.00', 'USD', '2025-07-02 16:33:55', 'recurring'),
(596, 24, 27, '1.00', 'USD', '2025-07-02 16:34:55', 'recurring'),
(597, 24, 27, '1.00', 'USD', '2025-07-02 16:35:55', 'recurring'),
(598, 24, 27, '1.00', 'USD', '2025-07-02 16:36:55', 'recurring'),
(599, 24, 27, '1.00', 'USD', '2025-07-02 16:37:55', 'recurring'),
(600, 24, 27, '1.00', 'USD', '2025-07-02 16:38:55', 'recurring'),
(601, 24, 27, '1.00', 'USD', '2025-07-02 16:39:55', 'recurring'),
(602, 24, 27, '1.00', 'USD', '2025-07-02 16:40:55', 'recurring'),
(603, 24, 27, '1.00', 'USD', '2025-07-02 16:41:55', 'recurring'),
(604, 24, 27, '1.00', 'USD', '2025-07-02 16:42:55', 'recurring'),
(605, 24, 27, '1.00', 'USD', '2025-07-02 16:43:55', 'recurring'),
(606, 24, 27, '1.00', 'USD', '2025-07-02 16:44:55', 'recurring'),
(607, 24, 27, '1.00', 'USD', '2025-07-02 16:45:55', 'recurring'),
(608, 24, 27, '1.00', 'USD', '2025-07-02 16:46:55', 'recurring'),
(609, 24, 27, '1.00', 'USD', '2025-07-02 16:47:55', 'recurring'),
(610, 24, 27, '1.00', 'USD', '2025-07-02 16:48:55', 'recurring'),
(611, 24, 27, '1.00', 'USD', '2025-07-02 16:49:55', 'recurring'),
(612, 24, 27, '1.00', 'USD', '2025-07-02 16:50:55', 'recurring'),
(613, 24, 27, '1.00', 'USD', '2025-07-02 16:51:55', 'recurring'),
(614, 24, 27, '1.00', 'USD', '2025-07-02 16:52:55', 'recurring'),
(615, 24, 27, '1.00', 'USD', '2025-07-02 16:53:55', 'recurring'),
(616, 24, 27, '1.00', 'USD', '2025-07-02 16:54:55', 'recurring'),
(617, 24, 27, '1.00', 'USD', '2025-07-02 16:55:55', 'recurring'),
(618, 24, 27, '1.00', 'USD', '2025-07-02 16:56:55', 'recurring'),
(619, 24, 27, '1.00', 'USD', '2025-07-02 16:57:55', 'recurring'),
(620, 24, 27, '1.00', 'USD', '2025-07-02 16:58:55', 'recurring'),
(621, 24, 27, '1.00', 'USD', '2025-07-02 16:59:55', 'recurring'),
(622, 24, 27, '1.00', 'USD', '2025-07-02 17:00:55', 'recurring'),
(623, 24, 27, '1.00', 'USD', '2025-07-02 17:01:55', 'recurring'),
(624, 24, 27, '1.00', 'USD', '2025-07-02 17:02:55', 'recurring'),
(625, 24, 27, '1.00', 'USD', '2025-07-02 17:03:55', 'recurring'),
(626, 24, 27, '1.00', 'USD', '2025-07-02 17:04:55', 'recurring'),
(627, 24, 27, '1.00', 'USD', '2025-07-02 17:05:55', 'recurring'),
(628, 24, 27, '1.00', 'USD', '2025-07-02 17:06:55', 'recurring'),
(629, 24, 27, '1.00', 'USD', '2025-07-02 17:07:55', 'recurring'),
(630, 24, 27, '1.00', 'USD', '2025-07-02 17:08:55', 'recurring'),
(631, 24, 27, '1.00', 'USD', '2025-07-02 17:09:55', 'recurring'),
(632, 24, 27, '1.00', 'USD', '2025-07-02 17:10:55', 'recurring'),
(633, 24, 27, '1.00', 'USD', '2025-07-02 17:11:55', 'recurring'),
(634, 24, 27, '1.00', 'USD', '2025-07-02 17:12:55', 'recurring'),
(635, 24, 27, '1.00', 'USD', '2025-07-02 17:13:55', 'recurring'),
(636, 24, 27, '1.00', 'USD', '2025-07-02 17:14:55', 'recurring'),
(637, 24, 27, '1.00', 'USD', '2025-07-02 17:15:55', 'recurring'),
(638, 24, 27, '1.00', 'USD', '2025-07-02 17:16:55', 'recurring'),
(639, 24, 27, '1.00', 'USD', '2025-07-02 17:17:55', 'recurring'),
(640, 24, 27, '1.00', 'USD', '2025-07-02 17:18:55', 'recurring'),
(641, 24, 27, '1.00', 'USD', '2025-07-02 17:19:55', 'recurring'),
(642, 24, 27, '1.00', 'USD', '2025-07-02 17:20:55', 'recurring'),
(643, 24, 27, '1.00', 'USD', '2025-07-02 17:21:55', 'recurring'),
(644, 24, 27, '1.00', 'USD', '2025-07-02 17:22:55', 'recurring'),
(645, 24, 27, '1.00', 'USD', '2025-07-02 17:23:55', 'recurring'),
(646, 24, 27, '1.00', 'USD', '2025-07-02 17:24:55', 'recurring'),
(647, 24, 27, '1.00', 'USD', '2025-07-02 17:25:55', 'recurring'),
(648, 24, 27, '1.00', 'USD', '2025-07-02 17:26:55', 'recurring'),
(649, 24, 27, '1.00', 'USD', '2025-07-02 17:27:55', 'recurring'),
(650, 24, 27, '1.00', 'USD', '2025-07-02 17:28:55', 'recurring'),
(651, 24, 27, '1.00', 'USD', '2025-07-02 17:29:55', 'recurring'),
(652, 24, 27, '1.00', 'USD', '2025-07-02 17:30:55', 'recurring'),
(653, 24, 27, '1.00', 'USD', '2025-07-02 17:31:55', 'recurring'),
(654, 24, 27, '1.00', 'USD', '2025-07-02 17:32:55', 'recurring'),
(655, 24, 27, '1.00', 'USD', '2025-07-02 17:33:55', 'recurring'),
(656, 24, 27, '1.00', 'USD', '2025-07-02 17:34:55', 'recurring'),
(657, 24, 27, '1.00', 'USD', '2025-07-02 17:35:55', 'recurring'),
(658, 24, 27, '1.00', 'USD', '2025-07-02 17:36:55', 'recurring'),
(659, 24, 27, '1.00', 'USD', '2025-07-02 17:37:55', 'recurring'),
(660, 24, 27, '1.00', 'USD', '2025-07-02 17:38:55', 'recurring'),
(661, 24, 27, '1.00', 'USD', '2025-07-02 17:39:55', 'recurring'),
(662, 24, 27, '1.00', 'USD', '2025-07-02 17:40:55', 'recurring'),
(663, 24, 27, '1.00', 'USD', '2025-07-02 17:41:55', 'recurring'),
(664, 24, 27, '1.00', 'USD', '2025-07-02 17:42:55', 'recurring'),
(665, 24, 27, '1.00', 'USD', '2025-07-02 17:43:55', 'recurring'),
(666, 24, 27, '1.00', 'USD', '2025-07-02 17:44:55', 'recurring'),
(667, 24, 27, '1.00', 'USD', '2025-07-02 17:45:55', 'recurring'),
(668, 24, 27, '1.00', 'USD', '2025-07-02 17:46:55', 'recurring'),
(669, 24, 27, '1.00', 'USD', '2025-07-02 17:47:55', 'recurring'),
(670, 24, 27, '1.00', 'USD', '2025-07-02 17:48:55', 'recurring'),
(671, 24, 27, '1.00', 'USD', '2025-07-02 17:49:55', 'recurring'),
(672, 24, 27, '1.00', 'USD', '2025-07-02 17:50:55', 'recurring'),
(673, 24, 27, '1.00', 'USD', '2025-07-02 17:51:55', 'recurring'),
(674, 24, 27, '1.00', 'USD', '2025-07-02 17:52:55', 'recurring'),
(675, 24, 27, '1.00', 'USD', '2025-07-02 17:53:55', 'recurring'),
(676, 24, 27, '1.00', 'USD', '2025-07-02 17:54:55', 'recurring'),
(677, 24, 27, '1.00', 'USD', '2025-07-02 17:55:55', 'recurring'),
(678, 24, 27, '1.00', 'USD', '2025-07-02 17:56:55', 'recurring'),
(679, 24, 27, '1.00', 'USD', '2025-07-02 17:57:55', 'recurring'),
(680, 24, 27, '1.00', 'USD', '2025-07-02 17:58:55', 'recurring'),
(681, 24, 27, '1.00', 'USD', '2025-07-02 17:59:55', 'recurring'),
(682, 24, 27, '1.00', 'USD', '2025-07-02 18:00:55', 'recurring'),
(683, 24, 27, '1.00', 'USD', '2025-07-02 18:01:55', 'recurring'),
(684, 24, 27, '1.00', 'USD', '2025-07-02 18:02:55', 'recurring'),
(685, 24, 27, '1.00', 'USD', '2025-07-02 18:03:55', 'recurring'),
(686, 24, 27, '1.00', 'USD', '2025-07-02 18:04:55', 'recurring'),
(687, 24, 27, '1.00', 'USD', '2025-07-02 18:05:55', 'recurring'),
(688, 24, 27, '1.00', 'USD', '2025-07-02 18:06:55', 'recurring'),
(689, 24, 27, '1.00', 'USD', '2025-07-02 18:07:55', 'recurring'),
(690, 24, 27, '1.00', 'USD', '2025-07-02 18:08:55', 'recurring'),
(691, 24, 27, '1.00', 'USD', '2025-07-02 18:09:55', 'recurring'),
(692, 24, 27, '1.00', 'USD', '2025-07-02 18:10:55', 'recurring'),
(693, 24, 27, '1.00', 'USD', '2025-07-02 18:11:55', 'recurring'),
(694, 24, 27, '1.00', 'USD', '2025-07-02 18:12:55', 'recurring'),
(695, 24, 27, '1.00', 'USD', '2025-07-02 18:13:55', 'recurring'),
(696, 24, 27, '1.00', 'USD', '2025-07-02 18:14:55', 'recurring'),
(697, 24, 27, '1.00', 'USD', '2025-07-02 18:15:55', 'recurring'),
(698, 24, 27, '1.00', 'USD', '2025-07-02 18:16:55', 'recurring'),
(699, 24, 27, '1.00', 'USD', '2025-07-02 18:17:55', 'recurring'),
(700, 24, 27, '1.00', 'USD', '2025-07-02 18:18:55', 'recurring'),
(701, 24, 27, '1.00', 'USD', '2025-07-02 18:19:55', 'recurring'),
(702, 24, 27, '1.00', 'USD', '2025-07-02 18:20:55', 'recurring'),
(703, 24, 27, '1.00', 'USD', '2025-07-02 18:21:55', 'recurring'),
(704, 24, 27, '1.00', 'USD', '2025-07-02 18:22:55', 'recurring'),
(705, 24, 27, '1.00', 'USD', '2025-07-02 18:23:55', 'recurring'),
(706, 24, 27, '1.00', 'USD', '2025-07-02 18:24:55', 'failed'),
(707, 16, 27, '1.00', 'USD', '2025-07-04 04:34:35', 'recurring'),
(708, 16, 27, '1.00', 'USD', '2025-07-04 04:35:35', 'recurring'),
(709, 16, 27, '1.00', 'USD', '2025-07-04 04:36:35', 'recurring'),
(710, 16, 27, '1.00', 'USD', '2025-07-04 04:37:35', 'recurring'),
(711, 16, 27, '1.00', 'USD', '2025-07-04 04:38:35', 'recurring'),
(712, 16, 27, '1.00', 'USD', '2025-07-04 04:39:35', 'recurring'),
(713, 16, 27, '1.00', 'USD', '2025-07-04 04:40:35', 'recurring'),
(714, 16, 27, '1.00', 'USD', '2025-07-04 04:41:35', 'recurring'),
(715, 16, 27, '1.00', 'USD', '2025-07-04 04:42:35', 'recurring'),
(716, 16, 27, '1.00', 'USD', '2025-07-04 04:43:35', 'recurring'),
(717, 16, 27, '1.00', 'USD', '2025-07-04 04:44:35', 'recurring'),
(718, 16, 27, '1.00', 'USD', '2025-07-04 04:45:35', 'recurring'),
(719, 16, 27, '1.00', 'USD', '2025-07-04 04:46:35', 'recurring'),
(720, 16, 27, '1.00', 'USD', '2025-07-04 04:47:35', 'recurring'),
(721, 16, 27, '1.00', 'USD', '2025-07-04 04:48:35', 'recurring'),
(722, 16, 27, '1.00', 'USD', '2025-07-04 04:49:35', 'recurring'),
(723, 16, 27, '1.00', 'USD', '2025-07-04 04:50:35', 'recurring'),
(724, 16, 27, '1.00', 'USD', '2025-07-04 04:51:35', 'recurring'),
(725, 16, 27, '1.00', 'USD', '2025-07-04 04:52:35', 'recurring'),
(726, 16, 27, '1.00', 'USD', '2025-07-04 04:53:35', 'recurring'),
(727, 16, 27, '1.00', 'USD', '2025-07-04 04:54:35', 'recurring'),
(728, 16, 27, '1.00', 'USD', '2025-07-04 04:55:35', 'recurring'),
(729, 16, 27, '1.00', 'USD', '2025-07-04 04:56:35', 'recurring'),
(730, 16, 27, '1.00', 'USD', '2025-07-04 04:57:35', 'failed');

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `api_secret` varchar(255) NOT NULL,
  `status` enum('waiting','accepted','denied') NOT NULL DEFAULT 'waiting',
  `reason` text DEFAULT NULL,
  `auth_token` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requests`
--

INSERT INTO `requests` (`id`, `email`, `api_key`, `api_secret`, `status`, `reason`, `auth_token`) VALUES
(1, 'test@example.com', 'API_KEY_123', 'SECRET_456', 'waiting', NULL, 'auth_token_789');

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `link` varchar(1000) NOT NULL,
  `media_url` varchar(1000) NOT NULL DEFAULT '',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `total_views` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_paid_at` datetime DEFAULT NULL,
  `processed_views` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submission_stats`
--

CREATE TABLE `submission_stats` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `recorded_at` datetime NOT NULL,
  `views` int(11) NOT NULL,
  `likes` int(11) NOT NULL,
  `comments` int(11) NOT NULL,
  `shares` int(11) NOT NULL,
  `saves` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `two_factor_codes`
--

CREATE TABLE `two_factor_codes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `two_factor_codes`
--

INSERT INTO `two_factor_codes` (`id`, `user_id`, `code_hash`, `token`, `expires_at`, `created_at`) VALUES
(1, 16, '$2y$10$WtzydbMG.5RHGtLuM/Yo.u5K8jerSEyCBUa6RrcJe1RLuIHLMSEyi', 'b717d5e8d193cfdeb17484238b8d9043', '2025-07-03 20:12:54', '2025-07-03 22:02:54'),
(2, 16, '$2y$10$asZ4qLbqCTx8tCvih8b2iucdLoqXJlva1sPdkqatO94sayheBivlG', 'b4ee3c177b8c31fb5935980f11194570', '2025-07-03 20:29:53', '2025-07-03 22:19:53'),
(12, 16, '$2y$10$kUtlCgBV1swl/tWuWeRNoO5AJ8jHAh2jdgHWfroj4I/7Pam.VxC5G', 'bce94a9e8a5d3205404c83234d62d29a', '2025-07-03 21:36:49', '2025-07-03 23:26:49'),
(17, 16, '$2y$10$fEgewvw4pF7oFGTEuCKCVOOH0jEzlk2fy3dJXTcTQG8a6oWJNR6Hu', '92b81e5807a67cccfd64c3c9edf2237c', '2025-07-04 10:18:52', '2025-07-04 12:08:52'),
(28, 16, '$2y$10$MTRynv5GrTdDinfJzhjoauLxVynZ7D87kVrE1RF1TnnVbpv/6zhii', '22a4f915dcd3d314a465acba4527c4ef', '2025-07-04 19:01:43', '2025-07-04 20:51:43'),
(32, 16, '$2y$10$Of1vK5/sl3WFy7aMPp8rne2leWb3NmgRJSSmsj792ibghEPeASYeO', '0d0f2817dbd0f7e15952b137d32e4d4e', '2025-07-04 20:55:28', '2025-07-04 22:45:28'),
(33, 40, '$2y$10$JQcc8Pde1qOz/KpWD11W.uA1q6J1MO9Ryt0cQ7kH4GupRtPILn8DG', 'c87156ca857fe37edc97673ae0478144', '2025-07-04 20:56:04', '2025-07-04 22:46:04'),
(34, 40, '$2y$10$pGfObW/g37ijjN1sO.Oj3u/6TTAC51tDYYunHl9RfMEZ1jkVyGfUK', 'e8e1891ae989047fdb91879242e96285', '2025-07-04 20:57:14', '2025-07-04 22:47:14'),
(35, 40, '$2y$10$RBssyQCl6qMHmxcB65Jjb.WWYpkZ2yNUd99soY.K3C7zTplrjaQxi', 'ffb383bfe842d34f8a60273c904c611f', '2025-07-04 21:05:28', '2025-07-04 22:55:28'),
(37, 40, '$2y$10$kVv7J3pxc3h1ebFzWVEWhu2bu5oPFGILaTDkvX3RD9gW.iocJuVSu', '3a4ce25c86a8732159e0345b65ddfce9', '2025-07-04 21:53:37', '2025-07-04 23:43:37'),
(46, 38, '$2y$10$/3sDPhIKt97QciLhfMXtAejRLHO97Z7wZaTF7yb8pImz1QwYRDyt2', '3fcf49d45686acb35a6576dd63f7fb72', '2025-07-05 11:42:51', '2025-07-05 13:32:51'),
(65, 41, '$2y$10$2wVE2wX5.Ofdr4fCfJcNUuWK1DPLWCFB0td3RK55gtwsHT4suh3vK', '147ee3beadd9621be80da92bcb86cdf8', '2025-07-06 00:51:16', '2025-07-06 02:41:16'),
(66, 42, '$2y$10$cfs2mEj0oj6SuFD5S9LZbOVHda5hNYg6iB5f.7RuLWTiNzGk5zm1q', 'b2156965f64b0a9f524dad7803198750', '2025-07-06 00:52:19', '2025-07-06 02:42:19'),
(70, 44, '$2y$10$BBDECr0jFyzbtV.eFX3e6u7DGVpP9OuACpOKDMmEurD6MTTqHhXgy', '6d21563f0b16e882809eaa69b6e34bd7', '2025-07-06 09:16:22', '2025-07-06 11:06:22'),
(71, 16, '$2y$10$uvugyCah56HiGCODqeT.G.gSe86aQqCN55/4rmEm9.n7nKEgQVmEq', 'f97a97c57669b0c55862cdb4abbdab9b', '2025-07-06 09:16:29', '2025-07-06 11:06:29'),
(73, 46, '$2y$10$4vH1/NaFxaLOdhd4z7uc3eNLbR/TzWMWSIyHs0A2G0CIgTRvZlYny', 'd02bea69799b25aa505d1fa172c0fbbd', '2025-07-06 09:32:20', '2025-07-06 11:22:20'),
(74, 46, '$2y$10$wr.ljviqUDTKLGVFdM9IPu2gofnC0XjftzQMdZbxrpDiGn43txWJ6', '97bfded693c2186ac9a65a1f4a65af80', '2025-07-06 09:32:38', '2025-07-06 11:22:38'),
(75, 40, '$2y$10$/LRvt4g2vk77mPfhfCUR/u0mMDQMSy9osVDquqI7GHWH9Xrp9MAeq', '1c487d4442c3219de7486cc8eb274b48', '2025-07-06 09:33:35', '2025-07-06 11:23:35'),
(76, 47, '$2y$10$zol2WGNuzHehyiGLyiK0xOpymqiD4tMs8aPjhD.M0kEjMyMCyMa92', 'ac4a71862f1e820da24392eed19c865d', '2025-07-06 10:05:59', '2025-07-06 11:55:59'),
(77, 47, '$2y$10$LdkEQOl852FSIJsz4bojvuIV4cJIMtSsP2leyPQOnlfGytI5Dvmm6', '9d9027d6e75b3e33118c420810d1236e', '2025-07-06 10:06:17', '2025-07-06 11:56:17'),
(78, 48, '$2y$10$XWMAV3eoMZWCRZQvJf16EOlbtGyF.t8HKPjLaZqYIbhFgX4e6G8bG', 'ea1e335a8efd2a7913219759797fd64d', '2025-07-06 10:11:38', '2025-07-06 12:01:38'),
(84, 50, '$2y$10$D9TcJ65uGhSExiMGZzkJ9OkPSRUgwXv0bT5w9OAl5XZaSzcRs90Lu', '08dbe95cfe751a1bcb2bfede848e95ab', '2025-07-06 12:12:19', '2025-07-06 14:02:19'),
(86, 51, '$2y$10$MAA8hs1I1dPijRBjIb2shexac61X8MoLCRMWx9qGL6uV0Cgbpv1Ni', 'c57d648b1470ed2af134bef5fe75e6fb', '2025-07-06 12:30:19', '2025-07-06 14:20:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `auth_token` varchar(255) NOT NULL,
  `auth_token_expiry_time` int(11) NOT NULL,
  `discord_id` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `bid` varchar(255) DEFAULT NULL,
  `bscrt` varchar(255) DEFAULT NULL,
  `uid` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `pass`, `auth_token`, `auth_token_expiry_time`, `discord_id`, `status`, `bid`, `bscrt`, `uid`) VALUES
(1, 'lukasberes3@gmail.com', '$2a$10$QtP9JuX.G44VV0uYqhhNmu0xKhYYmtG17SSRvn.wkgDKmeKmV3MYm', '4hFZGbMTePm1CAHPLCqGvXrHfr66DlS5qaDfz32OqrDCGv8xgf', 1720371662, '596655193026985985', NULL, NULL, NULL, NULL),
(2, 'mrmike1142352@gmail.com', '$2a$10$2MlUUVCXnb1CAnLVvDn1/.8Yh68vvIxx1lv0UCHs/gC.3JAETP3U.', 'sqbTIUtNJRTzKSfvSMSIg7CIQP4Lra1QsDDnYi1SjeAy63w59F', 1720371797, NULL, NULL, NULL, NULL, NULL),
(4, 'ales.ppetrula@gmail.com', '$2a$10$UmBLqSvV0p5jKuwvgDNwiOfqMyNKj7VZY0MeJTsdHtT8LENzAGQKq', 'JknZgdLNVXUb4t3B5cfV8DSEpLhVxfsBNUTAfaHXyJ0nh5cpnU', 1724756249, NULL, NULL, NULL, NULL, NULL),
(5, 'bohdansoukup33@gmail.com', '$2a$10$RM4ekXpolvqcsJo7GZIjjuN32TKGTJlshjG9NfKgIOGmHu3Z4dRnm', 'GusPNFo0cg9i8yjRkgfsc2IFuAK9hH1tILV1fex35FZUATZ5Ys', 1749560868, NULL, NULL, NULL, NULL, NULL),
(7, 'hamacek.12345@gmail.com', '$2a$10$uTID6w0J5y5BelmUUqcRCOqjPYwfR4SHy9OGuiPOV.yCKCN8/AjMC', 'THyC3pDbf8wW2krIKkrxk0ljDpNNpYXlBNLhRGVQ8hGYH5PQfe', 1720516497, NULL, NULL, NULL, NULL, NULL),
(9, 'lukysikora9@gmail.com', '$2a$10$YIXbOZkFg5VuBl.VWVKnauhC9KPU7yFAwAQsftJIUYPSm/cgqrOnq', 'CCFd3PC7PhC9pNooYx9cnExv0RRH0jqr0Sv5euwaNRtSGQME7L', 1721072121, NULL, NULL, NULL, NULL, NULL),
(10, 'tsukiartan@gmail.com', '$2a$10$YtKc4t5kGO3bZidSAy.CbucCZ5FTubgdu4N.53e1QjN3RNQVyjYoW', 'NwGEIVfT0N9PUWJcqhPxQO9z8D3EDEJScUSlo6AfbVBAQpq1J1', 1721126808, NULL, NULL, NULL, NULL, NULL),
(11, 'welthwing@gmail.com', '$2a$10$Ge8nbTWAGaBg43ldLJddQ.IQGxnfgMlzgfNFmnubDYdoCMRa9Xv2q', 'TPL2gqj2iMeBvbY7ArJWnxpTecQcPMrNF7xrPuoA7xXqxR7KUT', 1736260068, NULL, NULL, NULL, NULL, NULL),
(12, 'dejnouxdd@gmail.com', '$2a$10$7A5oGnx/hpMd.XCfd6e2meZ6bKPQfP5DR/PznW6ZLW2sPyBRXaDw.', 'CWE9dV1dUHfxiiQRlmCHWcUPvFhXyBWL7ll6T1I11GTKtG5Vmc', 1721141478, NULL, NULL, NULL, NULL, NULL),
(13, 'welthwing.business@gmail.com', '$2a$10$jhOOnVLUX1/HdqDOX9OIIumugXeXJJe8P59VIMlGKe00CfJEqMc2e', 'w67KhJde7BCjMtM6fqzQ4mcJ6C4KvvnV53gGM9rd7dVWxrjF3p', 1721147336, NULL, NULL, NULL, NULL, NULL),
(15, 'laska6467@gmail.com', '$2a$10$E4KfN6SONaUjX1I1Jd8J0ODFu.bp7HP0mSIPhigSK5FaU5gcsM0BW', 'j0XwoIQbvJAqjFYNJyh0cr2MW6oMQrxzlcR9RzWfXNWraGuZ19', 1721420962, NULL, NULL, NULL, NULL, NULL),
(16, 'omilpako@gmail.com', '$2a$10$lvWcEmptKgs8oMNvuJVJS.VnPOnNXWwkI4Dr6jk9VScdyTjkjAFcy', 'NQycxQamcVICpZRVvYWXyWf1ppLYJxYZtZYLjMLwVMQ5nBYQN3', 1721591866, NULL, NULL, NULL, NULL, NULL),
(17, 'milibiss11@gmail.com', '$2a$10$uWyZcXUcHJ1F46eOimy6vOxYN.jE84iklt3o5fpTasiDKJrw1XMvi', '0Y674wTZwQagd7P202p0gonzarFmbjztqFxSDHTHOjJthea4nz', 1721596784, NULL, NULL, NULL, NULL, NULL),
(18, 'csmrlucas77@gmail.com', '$2a$10$Fwao.stTwLzksd1yYJrtGu6P51.Nbh6mDnMvMYPCe7xTtTpeGZFte', 'EqapxEVDuyef3pn7ogtLh0QFBaVbZq59FlPCI77lj8El9sOjZc', 1721600082, NULL, NULL, NULL, NULL, NULL),
(20, 'mardahlasek222@gmail.com', '$2a$10$fWDgrX1TFqkWn.xpyEhxFul9XJ0SNLmcv421fXLhfhkTbJJpBZmqm', '327rSSYS9OUFGib97fhn7rY6L2WQUJFBMRdwNJcdzjrtowEqYJ', 1723495757, NULL, NULL, NULL, NULL, NULL),
(21, 'flybay96@gmail.com', '$2a$10$D4mkU8v9KqnPrzQcvYMdl.RqBV8hWB0zVafT5zb.2aBzH7J.xS1GS', 'Cp7iNvOeL1bHVyU1JGwuotokI64cFflydtd9U8MsqM3w9uygIs', 1722158945, NULL, NULL, NULL, NULL, NULL),
(24, 'byxdevelopment@seznam.cz', '$2a$10$XoQw2i2qxZ29uOk6VY7baOrs54t1TIUknRuOTtPPLWJi98bLjOBSe', 'JXgCR1OsBF93CIwb8pBiieEhadoyRZG2iUygPJKVuK2YgzLz95', 1727013409, NULL, NULL, NULL, NULL, NULL),
(25, 'byx.support@proton.me', '$2a$10$gKhRRR9hP2xzMLPvRtpgs.W33Yu9NbBe7wbizX1Mw5/r8xt5BjK6G', 'uh2wNYyweRVxK6fWhz72PpXcbZj91EQZq29PqHF0YpV7mgPNJn', 1727023757, NULL, NULL, NULL, NULL, NULL),
(26, 'brainzzz@seznam.cz', '$2a$10$oVySENjDGsq4b63PggemyOB1f8mMF8EORXzHpeHpBjXZK5oaKOtfO', 'SCGMl9If8J3E0ejR3U9Hv2RFjlsfwgFXjm75oRuxbIcsum1zL1', 1728161745, NULL, NULL, NULL, NULL, NULL),
(28, 'verify.byx@gmail.com', '$2a$10$F6jN9lk8lalugcOlp7Q7wO6Dr3FG/Kr6DMhL1XTI52laxfn7FDtj6', 'IrVmliDZjjx60kmI9ntv3WpFVXyYWgYnRD0w73iajjU9ww49xp', 1728167947, NULL, NULL, NULL, NULL, NULL),
(29, 'svitil.patrik4@gmail.com', '$2a$10$MqOzYA5SFWKGuTbx5IACseVNTqL9M/SwsDKvFM4UakJNdwFjb62iG', 'GkbwbOZbe73PaXS00fAqfBm5kIHsTddA9oiegw5dtl3wO0AJ4Z', 1728240214, '1023208315871834132', NULL, NULL, NULL, NULL),
(30, 'AdEmSCZ@seznam.cz', '$2a$10$FGdWlQWUuPLRAMY5H5s6RuXC/airCXIuq0h8jM/ALMVihmg6Mt9qm', 'L6uFmjY5ZE5uDV3DlrZpzG52Qd4h0NU0gF6yD1xaIcPkrFA1Am', 1729021185, '528675535555919892', NULL, NULL, NULL, NULL),
(31, 'notfunnymarek@gmail.com', '$2a$10$laaa6xiQvL/yaYZt892bjubOP5msqu0HZOVBBOjgG.Pv5iNXjmrP6', 'EwO3LFpt6oJOY5K7eqAMO7iOdAzKH0hyrrUUrWhcvVsklmcCO3', 1749211984, 'NULL', 'up', 'htrhrhr', 'htrhrhr', NULL),
(32, 'ales.nachtnebl@gmail.com', '$2a$10$mLIV1.ppz/QNy3DpsNadFe5oqG3IPYC/GPQS/LsxD3oiGX.HXbfzq', 'ii22ZFr6q3j9PSIQEv9f296zBmqWmrUOm5hWXMIDgc8fRN3eZX', 1733155701, '433986816022937610', NULL, 'rZVgXHjGtze1dx59hL', 'NOCDOxAHOC6UozR0zBhK62NyJ47w7W7Tyaq7', NULL),
(33, 'custriks@gmail.com', '$2a$10$MYtWgw5T54Kbdg/wLIvPAunXf8D02BOYitfQ/ssXNCeSo5mG/.d4G', 'iBfhTe3vg6KdEqSbbfyRWtg9utrjHIus1cAARPKYlxoUI5BnT6', 1734038927, '480387915860410378', NULL, 'VLmfjwXXUT1dPLlQoy', 's4Py58YzjTyczzwoF4W55N1nCAkgHcvXqAzv', NULL),
(34, 'pesgay123@gmail.com', '$2a$10$QUjfS8WHeeYgB9oAPqfK4.H5SYXnJZWKus66uz48rXxtRjf4m/8im', 'hyBrRjHObM1xgoi7pOfIuBDu7w2yqyk2lYSm6uQ9V2DABtv36G', 1738866223, '883045704103264356', NULL, NULL, NULL, NULL),
(35, 'akkfortnite55@gmail.com', '$2a$10$Nxps0sXNVmUbbf248nxG1OHFWjYcrGDuvZmT8ZLZNtGsl8qTHZnZa', 'NFisotponR7xG0UrGDvvXDBG0V1HZmy4Fd5FpMaLkbZuygPrUA', 1730211162, NULL, NULL, NULL, NULL, NULL),
(36, 'filipbalada05@seznam.cz', '$2a$10$/LgIUEx5AIkSxtM942cpZ.UMlnzvBdCdVmMtrQS6tkbguv3wfv8gy', 'Ecu9d0tashoYfZRMOVIgWzsqyXqUnW3PwWexR4SV8iv2R5j7Di', 1733154862, '1145977993714487337', 'up', 'lDAB1vm7rrckb1euEa', 'k5MBfIMEDQHUMuLRo64IX4BoGLrfUJQdkiSg', NULL),
(37, 'kubanohejl@seznam.cz', '$2a$10$vNXj.xTIBtTpufvn.Uh66O7JAlU2yGFb13rwihX1JIHMvhTvstU3K', 'JW6xaNuivoOLUhZPW7HWIRJHFsrLFfqPunczkTsIBhi1gzjrce', 1730460148, '773274700524027936', NULL, NULL, NULL, NULL),
(38, 'adamjanik70@gmail.com', '$2a$10$vxAj/PCYCgsCp7zIZAOlLOHgVSpuJNCRrVSmNwqC/LIWb2n51ew5G', '6VwVWAcQjZTDMuFNoU8xVvsIp99ra5JQAEg0ZZkbuA0BYZgsLa', 1730742404, NULL, NULL, NULL, NULL, NULL),
(39, 'tomasekkadan@gmail.com', '$2a$10$aw7mCkO9HIAuzBBQrO.x9uGe9dr43H8uBgq.c3R5Rpc8mhnUhjEuS', '9N3TGJ6srHeZHcy3ATezXDG7RMYzRlF43sNMvLgIHXaZgaNiMK', 1731173578, '414305202351374336', NULL, 'xNCHBbMMNQkJ6BSOgG', 'dg8Zbuf9RRfhoovsqWuNu5wE2sMmyU5agm0a', NULL),
(40, 'metr122@seznam.cz', '$2a$10$/.3zJx2j/qWGEroIjsmeiOOGDKZeHDMyXEdUoJQsx/EfjC.5X84XO', 'hcbPlnCrj16GBDsXOQVccZ9lDcbOtyHEat1vQREGlzc1HECryd', 1731250276, '856224471248404540', NULL, NULL, NULL, NULL),
(41, 'anna.mandousova@seznam.cz', '$2a$10$vHYou/mrcCC9txdhZAtrYO25ctseSjsTE4vWShfsBo8e6sfPNFzzy', '8OgcbexR7P7u9QfssOWsUajU9M9bt3QNAqKzLjmeu7u5t66FjA', 1732572917, '927599846209245195', NULL, 'lno4SXRLA77UPYanRm', 'K5yvFERrRYwjU2qYBOcOYl6o6m3sal920H1f', NULL),
(42, 'davidrataj2@seznam.cz', '$2a$10$p8cwAwg9no7.c6n12uvdDOSRfXNQc95l5mvsFtnM3oyhOKflr1MJa', 'Uzzf7r5VxMQk2oCO0GXKLUnlzFtaGANIr5BAqSBV0e7RIsiW1q', 1731753440, '526513823901810690', NULL, NULL, NULL, NULL),
(43, 'sebrlu.david@gmail.com', '$2a$10$cgMxE94K8wi.bwi7TM2rCebWHNK2M/U8wbDNHN5iuTewGFUhwCNHG', 'tRB2DUHX3bQWLzK0oS4pv2yxr2CIXuj0tWWuzmsLen0jzvq50f', 1731855924, NULL, NULL, NULL, NULL, NULL),
(44, 'sedav2006.de@gmail.com', '$2a$10$S/l5nyy5B324JnHKpP0NSue0X4sov3xRBOphdOZY9A8kNyyNH/XyK', 'H3zC5mvwDcZq1lDVEQnLpd2B9HpkjGDCuLonnKR2LN59RIi3WU', 1734222530, '447091107701194752', NULL, 'KlYhL5v1a9NQ0yBOGg', 'CbrxQ8XbNsWczxkpSGoFotSYBs2SwMEmeG3L', NULL),
(45, 'lukasblazek89@gmail.com', '$2a$10$WPY65Gx/bI9iJgh/6tshmeVFlZk2VanIxeZuZ0hbnHoyBTj9tEjp2', 'un1mf2qwMzH7VduPUEeCduJjLdcenDdOsC1ScUfKaYsnmbzZAU', 1733083441, '805897225473359894', NULL, 'Q2HXlEREukAuypoac6', 'Y39l0HnnLuzJujKIWE3btbwfSaS5b258XnwL', NULL),
(46, 'tolajbc@gmail.com', '$2a$10$asv9Rg.YO.A5Hd8EyKEnyeUOARpRcBpcyxxw8uz2xI2QOnWFDBR5q', 'hfPP5ZO0pcaxHx80rHgUxGXfcrtxshjGfndgtwag3rO4GB2mJg', 1732475257, '767831354586693642', NULL, 'amAWlIugGo7rcRO4UJ', '8egAYS4xtIq0pGhR4vUjkSY6K8jnalnRnuOg', NULL),
(47, 'valenta.roman23@gmail.com', '$2a$10$REG8D.tZECat2nl5uZpUz.FtoK/gwP8I8Nh4f/5ttgjNg/8CmYBB.', '2F4fbzQDv0baskkAneYa852EJZYeJyxLIg8A8YCmgJWaOfBkEw', 1733833709, '801870130794594385', 'up', '7qsjLqGmu5aFsU8mDX', 'sJxyBxz6B9mN50rGakYrdMyuVSmdqySJm8mr', NULL),
(48, 'honza.mikulcik@gmail.com', '$2a$10$VrNkxvrSDKoXBiSd5pQz7e/M.s00I0kCXeQxT50witylM4mjWPdVi', 'cXjtEIwytNsJYRa1Q9Ff37a7hfciKBeYXu3vD9ZfUbCoj8YDsf', 1749229316, NULL, NULL, 'eqQpHa5opO9EideA6W', 'PuW7tLftXrdiq6OVfLXfjeBJjvU8tNjhrGuT', NULL),
(52, 'sopek.filip@seznam.cz', '$2a$10$750aErUrscyUqLMk3lDW7.aGaVJCa.prDWk4TwLvtW6//LkR9xU2a', '2SSog3m4VBn4Bor3UQjqvOLS5qMBK9vh3Qix7L4P6CkYYltnf3', 1736239987, NULL, 'up', 'Nod8mwCO9YeWNFgU7c', 'j3hoV4ehZyrsPXfKSyDdOKG2YEgE54XGUdpc', NULL),
(53, 'jakub.vlcak100@seznam.cz', '$2a$10$vhVfcFvbyRWXTO26H1NYY.F2z1mwfF9k2t/f8Nk2s8aypEwXisQjO', 'J0Wa8iuFX8NvYisTfRziaix7StmZOPOPUMtn9t1qV1fNIffWId', 1733615669, NULL, NULL, NULL, NULL, NULL),
(54, 'angiecaldwell7@outlook.com', '$2a$10$GTAVfNn4WJtrmuO/rlTxxewpT1u4SyChWrCEXCOthUfhZx8l6e8WW', 'wXZ66br2ZuBS5bkyLXJnP9P2IJGX773lh0hntA6t6xoWm36MkO', 1747869460, '315160572477833217', 'up', 'blah', 'blahls', NULL),
(55, 'graff.george1@gmail.com', '$2a$10$g2l0GDrdNnoBr5QYOgpWkeS4zpfy4rDpuexyFKNEVzF2AZAW6Hq7G', '9YeLiQqg3cAqnABql7OWD2GOkoGZjI6MpPrakzUFs8NA9o3iv9', 1737297458, '701847003302199742', 'up', '2939', 'Wiiseu', NULL),
(56, 'notfunnymarek2@gmail.com', '$2a$10$ZfCpz/jx/gIRdbTpunb6U.akLnpIvDBkCIaK4QyKn6B8iJy6P4D3e', 'sI4falEXzxObNvxcrhpfuUpTzSB3SCY95RQzWLId0Fz4mfWq97', 1737543103, NULL, NULL, NULL, NULL, NULL),
(57, 'prostee.jakub@gmail.com', '$2a$10$/3/M2YehdMpF7BmI/bWDveuPx4h.hAevhAIhw5wExep.E0VECacR6', 'pnvHz81c6pzX0nEoiGNShadhO7jMGT4UNYmyGg6BnnKYq9qOrl', 1738447076, '515637144899813398', 'up', '516561', '56165156', NULL),
(58, 'neuroai@hi2.in', '$2a$10$GNrdPklR74ZX5corA9sah.MWKNexfz4CFr6GdLeDpjhKLV8WfNbzS', '3WKUznFGR0QKOeqKaVEnHWO6akAEE9LRKfdcFuLWJIkHRXqKLf', 1747900050, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users2`
--

CREATE TABLE `users2` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users2`
--

INSERT INTO `users2` (`id`, `username`, `email`, `password_hash`, `created_at`) VALUES
(17, 'htrhtrhrt', 'gregerger@gmail.com', '$2y$10$1BlToJzToWQlnID.cGkUxuXbFFI1oraVmB5VCRtEqyUTdm1nVo2Zi', '2025-06-04 22:54:12'),
(18, 'test1', 'test1@gmail.com', '$2y$10$WxzYCC.fVLKbZPzyIjjVCuJgDKrQF1HKYrVcoTmQbq6BdLiyGnoP6', '2025-06-04 22:54:34'),
(19, 'htrhrhrt', 'rthtrhrthrt@gmai.com', '$2y$10$4gI2xUds.BlAiAsBoV1gX.zMPKZRkaqJ7j7l/R6zXLFHq/Z8OP1yK', '2025-06-04 22:56:34');

-- --------------------------------------------------------

--
-- Table structure for table `users3`
--

CREATE TABLE `users3` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `accepted_terms` tinyint(1) NOT NULL DEFAULT 0,
  `accepted_c_terms` tinyint(1) NOT NULL DEFAULT 0,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users4`
--

INSERT INTO `users4` (`id`, `username`, `name`, `bio`, `email`, `phone`, `avatar_url`, `join_whops`, `own_whops`, `approx_location`, `password_hash`, `created_at`, `balance`, `deposit_address`, `deposit_secret`, `date_of_birth`, `country`, `accepted_terms`, `accepted_c_terms`, `is_verified`) VALUES
(57, 'notfunnymarek', NULL, NULL, 'notfunnymarek@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$WpZoFFfqnnz2a/xL8SBfBO8jIps0K/W.JC5bjJDQiAIbCDN6LOnwK', '2025-07-06 16:37:36', '5.13700000', 'BAfCfZLqERJauDWLgynG1DCZsVuVkhG5NN3ZMcV1C6ZW', '3SMoEb9UwUkzH24a5h9Kfhkj5aG6fNMydvKYqZT29bjQWbwX6WtkLHotMyYL3Se399eKiWSuW9ngxQ4iYqcqVcV6', '1986-12-08', 'Austria', 1, 0, 1),
(58, 'bohdansoukup33', NULL, NULL, 'bohdansoukup33@gmail.com', NULL, 'https://res.cloudinary.com/dv6igcvz8/image/upload/v1749161429/Frame_5958f_kopie_fcgfjn.png', NULL, NULL, NULL, '$2y$10$CTYP18PBxd/ANTreUn/Hce2/N3uGXAQhxf2g5fB36qorT6N01RYxC', '2025-07-06 16:47:14', '100.00100000', 'CELjdTmuB2ZdbpK7f1wrVLU9otXgugPdRLSN12XYyBQh', 'RzS8cBu5wwZm7HTXAtLihbU7bFwM1nddZmRBpqK9kX3mbr8Po1ch474hNawR7Am19Mw7ZDgmmAj3Pdue72BfRyw', '1986-12-08', 'Antigua & Barbuda', 1, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_2fa_codes`
--

CREATE TABLE `user_2fa_codes` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `code` char(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_mutes`
--

CREATE TABLE `user_mutes` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `mute_until` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_refresh_tokens`
--

CREATE TABLE `user_refresh_tokens` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `token` char(128) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_tokens`
--

CREATE TABLE `user_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `user_agent_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_tokens`
--

INSERT INTO `user_tokens` (`id`, `user_id`, `token_hash`, `user_agent_hash`, `expires_at`, `created_at`) VALUES
(2, 16, '07f321625ff3bb59bdfc6231ca2cf4d24db7614b57a02e7a4ec2bf9d40ec9f4d', 'f3b7e2d46a10a95fd2af67c775428a175dc8c88023073887f6366c014125fc5c', '2025-08-04 23:48:46', '2025-07-06 01:48:46'),
(5, 43, 'c92ad57b6e831c4f3bb56203c94da4934b395ffcc6e476066de7cc68af084181', '9559d1e35f81d5056027cc076b5180ea0a8606127d56fdf2f861c9185cc17cb7', '2025-08-05 01:04:58', '2025-07-06 03:04:58'),
(6, 16, '3fbe30a99168830d77d2b377021ed9eda75ba6c917c3a975ce5c1713632eced6', 'f3b7e2d46a10a95fd2af67c775428a175dc8c88023073887f6366c014125fc5c', '2025-08-05 12:03:21', '2025-07-06 03:16:30'),
(16, 53, '062c3b9709d1137c14f7e1ba6073acfdd25787160926a2a3cc295f9143a34e18', '9559d1e35f81d5056027cc076b5180ea0a8606127d56fdf2f861c9185cc17cb7', '2025-08-05 13:45:56', '2025-07-06 15:45:56'),
(21, 58, 'b62c36df7c85a0042594b3a851ddaf26d518a9a0a8d345708d411bbd5cd0caf3', '9559d1e35f81d5056027cc076b5180ea0a8606127d56fdf2f861c9185cc17cb7', '2025-08-05 14:47:25', '2025-07-06 16:47:25');

-- --------------------------------------------------------

--
-- Table structure for table `verify_temp`
--

CREATE TABLE `verify_temp` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `verify_code` varchar(255) NOT NULL,
  `expiry_time` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `verify_temp`
--

INSERT INTO `verify_temp` (`id`, `email`, `pass`, `verify_code`, `expiry_time`) VALUES
(11, 'lukasberes3@gmail.com', '$2a$10$KD846K0ENQ5UUUvR3CtMquzrq6FfyiTq4OqywmeJOOD9It.6r93yS', '911713', 1720030210),
(28, '123@123.com', '$2a$10$IGgJucxMg28MX6i9NuweiOHOXsA9uShH1GRTdd2f4vqgU1HNmPXH2', '402865', 1725198429),
(51, 'notfunnygregegmarek@gmail.com', '$2a$10$NUO8S9mwEs6NSSoR0LkDCuECxyU4rYfn9rR5IcH3x/7qmTuMjHL6u', '790663', 1727707368),
(54, 'k.bednar2006@gmail.com', '$2a$10$NLiUdDSP09FCl9RvH2iLvOWjcwTsM3QyQ1wuRTbEfVNdWkW.cHcs2', '191505', 1728235219),
(59, 'kuba.dockal4@seznam.cz', '$2a$10$Ci48UUFZEuRetPEUUSLig.EBSBJpP1T.2MkUjKWimwQoohiEt6Mom', '922105', 1729513023),
(77, 'pesgay123@gmail.com', '$2a$10$UpLWIB7VVCsEm34JYfhicev1M82e.2hj2OH9/aQPyePKQSpiGkFJ2', '778792', 1731251581),
(83, 'nnkfkejdk@gmail.com', '$2a$10$nV.l9jpohAstofYHFuuJKebSfMX/4T2Qvyc8uCOPeQAVJFJ0y8msK', '289510', 1732642125),
(85, 'notfunnymarek@gmail.com', '$2a$10$v6FLUnUhLeq6Ix3CwvXRr.w1lqjwNbgG0RhWADF2vQXs.jGt9Ug.6', '206132', 1732809725),
(91, 'welthwing@gmail.com', '$2a$10$7rHwk4/DBAlAhBYMmqL.YeI7RJzM1w3ktBtkEIUDnq0ycXQQiJEFC', '823520', 1735655924),
(94, 'garff.george1@gmail.com', '$2a$10$9yOXYIZqJVg/nM73tEpkTeqduM46gjOa4Q0DRcpqAwzdiQYNNHxH2', '264566', 1736692893),
(97, 'graff.george6@gmail.com', '$2a$10$wsSIg/A6NfZq4KY9jDiMcuu1RoaAN1ULXfNgj1Y.F2VnhPHuh3YVy', '262426', 1736693108);

-- --------------------------------------------------------

--
-- Table structure for table `waitlist_requests`
--

CREATE TABLE `waitlist_requests` (
  `whop_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `requested_at` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `handled_at` datetime DEFAULT NULL,
  `answers_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answers_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whops`
--

CREATE TABLE `whops` (
  `id` int(10) UNSIGNED NOT NULL,
  `owner_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `logo_url` text NOT NULL,
  `banner_url` text NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `billing_period` varchar(20) NOT NULL DEFAULT 'none',
  `waitlist_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `waitlist_questions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`waitlist_questions`)),
  `is_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `about_bio` text NOT NULL DEFAULT '',
  `website_url` text NOT NULL DEFAULT '',
  `socials` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`socials`)),
  `who_for` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`who_for`)),
  `faq` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`faq`)),
  `long_description` text NOT NULL,
  `landing_texts` text DEFAULT NULL,
  `modules` text DEFAULT NULL,
  `course_steps` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_about`
--

CREATE TABLE `whop_about` (
  `whop_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `message_button_text` varchar(100) DEFAULT NULL,
  `website_url` text DEFAULT NULL,
  `instagram_url` text DEFAULT NULL,
  `discord_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_affiliate`
--

CREATE TABLE `whop_affiliate` (
  `whop_id` int(10) UNSIGNED NOT NULL,
  `reward_description` text DEFAULT NULL,
  `report_button_text` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_bans`
--

CREATE TABLE `whop_bans` (
  `id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `banned_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_course_progress`
--

CREATE TABLE `whop_course_progress` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `completed_steps` text DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `whop_course_progress`
--

INSERT INTO `whop_course_progress` (`id`, `user_id`, `whop_id`, `completed_steps`, `updated_at`) VALUES
(1, 40, 54, '[1]', '2025-07-06 00:46:47');

-- --------------------------------------------------------

--
-- Table structure for table `whop_faq`
--

CREATE TABLE `whop_faq` (
  `id` int(11) NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_features`
--

CREATE TABLE `whop_features` (
  `id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(100) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `image_url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_members`
--

CREATE TABLE `whop_members` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_memberships`
--

CREATE TABLE `whop_memberships` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `price` decimal(16,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_recurring` tinyint(1) NOT NULL,
  `next_payment_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_member_history`
--

CREATE TABLE `whop_member_history` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `whop_member_history`
--

INSERT INTO `whop_member_history` (`id`, `user_id`, `whop_id`, `joined_at`) VALUES
(1, 16, 31, '2025-07-05 11:21:19'),
(2, 16, 55, '2025-07-05 15:40:29'),
(3, 40, 54, '2025-07-05 22:23:46');

-- --------------------------------------------------------

--
-- Table structure for table `whop_moderators`
--

CREATE TABLE `whop_moderators` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `added_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_pricing_plans`
--

CREATE TABLE `whop_pricing_plans` (
  `id` int(11) NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `plan_name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT NULL,
  `billing_period` varchar(50) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_reviews`
--

CREATE TABLE `whop_reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `text` text NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `purchase_date` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `whop_reviews`
--

INSERT INTO `whop_reviews` (`id`, `whop_id`, `user_id`, `text`, `rating`, `purchase_date`, `created_at`) VALUES
(4, 31, 16, 'jztjt', 5, '2025-07-05 11:21:19', '2025-07-05 13:21:50'),
(7, 54, 40, 'gregre', 5, '2025-07-06 00:23:46', '2025-07-06 00:23:58');

-- --------------------------------------------------------

--
-- Table structure for table `whop_waitlist`
--

CREATE TABLE `whop_waitlist` (
  `id` int(10) UNSIGNED NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `requested_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whop_who_for`
--

CREATE TABLE `whop_who_for` (
  `id` int(11) NOT NULL,
  `whop_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `withdraw_records`
--

CREATE TABLE `withdraw_records` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `sol_address` varchar(100) NOT NULL,
  `sol_amount` decimal(16,8) NOT NULL,
  `usd_amount` decimal(16,8) NOT NULL,
  `tx_signature` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `withdraw_records`
--

INSERT INTO `withdraw_records` (`id`, `user_id`, `sol_address`, `sol_amount`, `usd_amount`, `tx_signature`, `created_at`) VALUES
(48, 57, 'DnGMKFnAh9qtatYpZsLJhwS6NN1G6LC5WtbRyuNX8o4X', '0.06608075', '10.00000000', '5Puyemjhtu4z4JBripc9LvxSiwKg4XULwmteDqv2dh6FxAGTXbjkKmvj6jQnjcU65yWL9jT8dRAUv933NJhYYdGE', '2025-07-06 14:46:07'),
(49, 58, 'DnGMKFnAh9qtatYpZsLJhwS6NN1G6LC5WtbRyuNX8o4X', '0.10920643', '16.50000000', '4pgenHaT5eZmi8FXjjCzRJWcAAkUwhre8xk19iFHeVmdKs759uRd4Ztz4wY1Zf6cCUWc7tWbeiaXuGt3EufkvuC6', '2025-07-06 14:49:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `affiliate`
--
ALTER TABLE `affiliate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `affiliateId` (`affiliateId`);

--
-- Indexes for table `auth`
--
ALTER TABLE `auth`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `campaign`
--
ALTER TABLE `campaign`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_campaign_user` (`user_id`),
  ADD KEY `fk_campaign_whop` (`whop_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `whop_id` (`whop_id`),
  ADD KEY `created_at` (`created_at`),
  ADD KEY `fk_chat_messages_reply_to` (`reply_to`);

--
-- Indexes for table `custom_wallets`
--
ALTER TABLE `custom_wallets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deposit_records`
--
ALTER TABLE `deposit_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tx_signature` (`tx_signature`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `discord_final`
--
ALTER TABLE `discord_final`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `linked_accounts`
--
ALTER TABLE `linked_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_platform_url` (`platform`,`account_url`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `memberships`
--
ALTER TABLE `memberships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `whop_id` (`whop_id`);

--
-- Indexes for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_reaction` (`message_id`,`user_id`,`reaction_type`),
  ADD KEY `fk_reactions_user` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_campaign_id` (`campaign_id`);

--
-- Indexes for table `submission_stats`
--
ALTER TABLE `submission_stats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`),
  ADD KEY `recorded_at` (`recorded_at`);

--
-- Indexes for table `two_factor_codes`
--
ALTER TABLE `two_factor_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `token` (`token`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`) USING BTREE,
  ADD UNIQUE KEY `auth_token` (`auth_token`),
  ADD UNIQUE KEY `discord_id` (`discord_id`);

--
-- Indexes for table `users2`
--
ALTER TABLE `users2`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `users3`
--
ALTER TABLE `users3`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

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
-- Indexes for table `user_2fa_codes`
--
ALTER TABLE `user_2fa_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `code` (`code`);

--
-- Indexes for table `user_mutes`
--
ALTER TABLE `user_mutes`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_refresh_tokens`
--
ALTER TABLE `user_refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_unique` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `token_hash` (`token_hash`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `verify_temp`
--
ALTER TABLE `verify_temp`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `verify_code_unique` (`verify_code`);

--
-- Indexes for table `waitlist_requests`
--
ALTER TABLE `waitlist_requests`
  ADD PRIMARY KEY (`whop_id`,`user_id`),
  ADD KEY `status` (`status`),
  ADD KEY `fk_waitlist_user` (`user_id`);

--
-- Indexes for table `whops`
--
ALTER TABLE `whops`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_whops_owner` (`owner_id`);

--
-- Indexes for table `whop_about`
--
ALTER TABLE `whop_about`
  ADD PRIMARY KEY (`whop_id`);

--
-- Indexes for table `whop_affiliate`
--
ALTER TABLE `whop_affiliate`
  ADD PRIMARY KEY (`whop_id`);

--
-- Indexes for table `whop_bans`
--
ALTER TABLE `whop_bans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_whop_user` (`whop_id`,`user_id`),
  ADD KEY `fk_whop_bans_whop` (`whop_id`),
  ADD KEY `fk_whop_bans_user` (`user_id`);

--
-- Indexes for table `whop_course_progress`
--
ALTER TABLE `whop_course_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_whop` (`user_id`,`whop_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_whop_id` (`whop_id`);

--
-- Indexes for table `whop_faq`
--
ALTER TABLE `whop_faq`
  ADD PRIMARY KEY (`id`),
  ADD KEY `whop_id` (`whop_id`);

--
-- Indexes for table `whop_features`
--
ALTER TABLE `whop_features`
  ADD PRIMARY KEY (`id`),
  ADD KEY `whop_id` (`whop_id`);

--
-- Indexes for table `whop_members`
--
ALTER TABLE `whop_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_whop` (`user_id`,`whop_id`),
  ADD KEY `fk_wm_whop` (`whop_id`);

--
-- Indexes for table `whop_memberships`
--
ALTER TABLE `whop_memberships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_whop_memberships_user` (`user_id`),
  ADD KEY `fk_whop_memberships_whop` (`whop_id`);

--
-- Indexes for table `whop_member_history`
--
ALTER TABLE `whop_member_history`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_whop` (`user_id`,`whop_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_whop_id` (`whop_id`);

--
-- Indexes for table `whop_moderators`
--
ALTER TABLE `whop_moderators`
  ADD PRIMARY KEY (`user_id`,`whop_id`),
  ADD KEY `fk_wmod_whop` (`whop_id`);

--
-- Indexes for table `whop_pricing_plans`
--
ALTER TABLE `whop_pricing_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `whop_id` (`whop_id`);

--
-- Indexes for table `whop_reviews`
--
ALTER TABLE `whop_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_whop_id` (`whop_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `whop_waitlist`
--
ALTER TABLE `whop_waitlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `whop_id` (`whop_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `whop_who_for`
--
ALTER TABLE `whop_who_for`
  ADD PRIMARY KEY (`id`),
  ADD KEY `whop_id` (`whop_id`);

--
-- Indexes for table `withdraw_records`
--
ALTER TABLE `withdraw_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `affiliate`
--
ALTER TABLE `affiliate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `auth`
--
ALTER TABLE `auth`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `campaign`
--
ALTER TABLE `campaign`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=245;

--
-- AUTO_INCREMENT for table `custom_wallets`
--
ALTER TABLE `custom_wallets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `deposit_records`
--
ALTER TABLE `deposit_records`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `discord_final`
--
ALTER TABLE `discord_final`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=155200;

--
-- AUTO_INCREMENT for table `linked_accounts`
--
ALTER TABLE `linked_accounts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `memberships`
--
ALTER TABLE `memberships`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `message_reactions`
--
ALTER TABLE `message_reactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=731;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `submission_stats`
--
ALTER TABLE `submission_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `two_factor_codes`
--
ALTER TABLE `two_factor_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `users2`
--
ALTER TABLE `users2`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users3`
--
ALTER TABLE `users3`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users4`
--
ALTER TABLE `users4`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `user_2fa_codes`
--
ALTER TABLE `user_2fa_codes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_refresh_tokens`
--
ALTER TABLE `user_refresh_tokens`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `verify_temp`
--
ALTER TABLE `verify_temp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `whops`
--
ALTER TABLE `whops`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `whop_bans`
--
ALTER TABLE `whop_bans`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `whop_course_progress`
--
ALTER TABLE `whop_course_progress`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `whop_faq`
--
ALTER TABLE `whop_faq`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `whop_features`
--
ALTER TABLE `whop_features`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `whop_members`
--
ALTER TABLE `whop_members`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT for table `whop_memberships`
--
ALTER TABLE `whop_memberships`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `whop_member_history`
--
ALTER TABLE `whop_member_history`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `whop_pricing_plans`
--
ALTER TABLE `whop_pricing_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `whop_reviews`
--
ALTER TABLE `whop_reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `whop_waitlist`
--
ALTER TABLE `whop_waitlist`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `whop_who_for`
--
ALTER TABLE `whop_who_for`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `withdraw_records`
--
ALTER TABLE `withdraw_records`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `campaign`
--
ALTER TABLE `campaign`
  ADD CONSTRAINT `fk_campaign_user` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_campaign_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `fk_chat_messages_reply_to` FOREIGN KEY (`reply_to`) REFERENCES `chat_messages` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `deposit_records`
--
ALTER TABLE `deposit_records`
  ADD CONSTRAINT `deposit_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `linked_accounts`
--
ALTER TABLE `linked_accounts`
  ADD CONSTRAINT `linked_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD CONSTRAINT `fk_reactions_message` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reactions_user` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `fk_submissions_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaign` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `submission_stats`
--
ALTER TABLE `submission_stats`
  ADD CONSTRAINT `submission_stats_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_2fa_codes`
--
ALTER TABLE `user_2fa_codes`
  ADD CONSTRAINT `user_2fa_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_mutes`
--
ALTER TABLE `user_mutes`
  ADD CONSTRAINT `fk_user_mutes_user` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_refresh_tokens`
--
ALTER TABLE `user_refresh_tokens`
  ADD CONSTRAINT `user_refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `waitlist_requests`
--
ALTER TABLE `waitlist_requests`
  ADD CONSTRAINT `fk_waitlist_user` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_waitlist_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `whops`
--
ALTER TABLE `whops`
  ADD CONSTRAINT `fk_whops_owner` FOREIGN KEY (`owner_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `whops_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `whop_about`
--
ALTER TABLE `whop_about`
  ADD CONSTRAINT `fk_about_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `whop_affiliate`
--
ALTER TABLE `whop_affiliate`
  ADD CONSTRAINT `fk_affiliate_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `whop_bans`
--
ALTER TABLE `whop_bans`
  ADD CONSTRAINT `fk_whop_bans_user` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_whop_bans_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `whop_faq`
--
ALTER TABLE `whop_faq`
  ADD CONSTRAINT `fk_faq_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `whop_features`
--
ALTER TABLE `whop_features`
  ADD CONSTRAINT `whop_features_ibfk_1` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `whop_members`
--
ALTER TABLE `whop_members`
  ADD CONSTRAINT `fk_wm_user` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wm_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `whop_memberships`
--
ALTER TABLE `whop_memberships`
  ADD CONSTRAINT `fk_whop_memberships_user` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_whop_memberships_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `whop_moderators`
--
ALTER TABLE `whop_moderators`
  ADD CONSTRAINT `fk_wmod_user` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_wmod_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `whop_pricing_plans`
--
ALTER TABLE `whop_pricing_plans`
  ADD CONSTRAINT `fk_pricing_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `whop_waitlist`
--
ALTER TABLE `whop_waitlist`
  ADD CONSTRAINT `whop_waitlist_ibfk_1` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `whop_waitlist_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `whop_who_for`
--
ALTER TABLE `whop_who_for`
  ADD CONSTRAINT `fk_who_for_whop` FOREIGN KEY (`whop_id`) REFERENCES `whops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `withdraw_records`
--
ALTER TABLE `withdraw_records`
  ADD CONSTRAINT `withdraw_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users4` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
