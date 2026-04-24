-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-04-2026 a las 04:02:27
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `db_academica`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `id` int(10) NOT NULL,
  `idAlumno` char(36) NOT NULL,
  `codigo` char(10) NOT NULL,
  `nombre` char(100) NOT NULL,
  `direccion` char(150) NOT NULL,
  `email` char(150) NOT NULL,
  `telefono` char(9) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumnos`
--

INSERT INTO `alumnos` (`id`, `idAlumno`, `codigo`, `nombre`, `direccion`, `email`, `telefono`, `created_at`, `updated_at`) VALUES
(2, 'f02f9bed-9653-477a-8d63-472514ddcae4', 'dssdds', 'ddsds', 'dsdsds', 'dsdsds', 'dsdsdsds', '2026-04-22 02:15:34', '2026-04-22 02:15:34'),
(3, 'fb2b51c7-d2fc-48a6-9cd1-242aa61bac6b', 'php', 'ss', 'server', 'q', 'q', '2026-04-22 02:27:31', '2026-04-22 02:27:31'),
(5, 'eb8ba15b-a5eb-444c-964f-b67a9b8fabb1', 'kldskls', 'asas', 'askjaskj', 'askaskjsa', '333s', '2026-04-22 02:42:06', '2026-04-22 02:48:29'),
(6, '6b7b7c68-8c1a-4096-b5fc-32184c8097c6', 'dsds', 'dsds', 'dsds', 'dsds', 'dsds', '2026-04-22 02:49:53', '2026-04-22 02:49:53'),
(7, 'b041b65e-3c71-4e72-93e9-c000132451b3', 'dssd', 'dsds', 'dsds', 'dsds', 'dsds', '2026-04-22 02:50:48', '2026-04-22 02:50:48'),
(8, '108c1c01-0183-4153-ab71-72cd5a0e5f10', 'ola', 'teano', 'bessito', 'uwu', 'xd', '2026-04-22 02:52:14', '2026-04-22 02:52:14'),
(9, '4fec8d4d-af84-48ac-bba4-199c58120d91', 'cxcx', 'cxcx', 'cxcx', 'xcc', 'xccxcx', '2026-04-22 20:08:56', '2026-04-22 20:08:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes`
--

CREATE TABLE `docentes` (
  `idDocente` varchar(100) NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `dui` varchar(10) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(9) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `escalafon` varchar(50) NOT NULL,
  `hash` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `docentes`
--

INSERT INTO `docentes` (`idDocente`, `codigo`, `dui`, `nombre`, `email`, `telefono`, `direccion`, `escalafon`, `hash`) VALUES
('1774407319215', 'LLLL222222', '78787878-7', 'Romima Amaya', 'hjdshjdsjks@gmaio.com', '1111-1111', '3323232', '2', 'eyJpZERvY2VudGUiOiIxNzc0NDA3MzE5MjE1IiwiY29kaWdvIjoiTExMTDIyMjIy'),
('1774407634935', 'DSKJ525555', '65365656-5', 'Karina Amaya Gonzales', 'dssddsq33@gmai.com', '1234-5678', 'ssd', '2', 'eyJpZERvY2VudGUiOiIxNzc0NDA3NjM0OTM1IiwiY29kaWdvIjoiRFNLSjUyNTU1'),
('1774407720239', 'USAS541122', '89348378-4', 'Romamona la pelona', 'romer@gmail.cpom', '3322-3323', '323232', '1', 'eyJpZERvY2VudGUiOiIxNzc0NDA3NzIwMjM5IiwiY29kaWdvIjoiVVNBUzU0MTEy');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materias`
--

CREATE TABLE `materias` (
  `id` int(10) NOT NULL,
  `idMateria` char(36) NOT NULL,
  `codigo` char(10) NOT NULL,
  `nombre` char(100) NOT NULL,
  `uv` int(2) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materias`
--

INSERT INTO `materias` (`id`, `idMateria`, `codigo`, `nombre`, `uv`) VALUES
(1, '718c7823-db78-44b5-b7ec-6db1517c2535', '609', 'Programacion Computacional II', 4),
(3, '0344a5b9-5a98-478e-9064-dc3a7e7f7c90', 'd22', 'dsas', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2026_04_23_234735_create_usuarios_table', 1),
(6, '2026_04_24_011246_create_reportes_fallas_table', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes_fallas`
--

CREATE TABLE `reportes_fallas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `idReporte` char(36) NOT NULL,
  `idUsuario` char(36) NOT NULL,
  `concepto` text NOT NULL,
  `foto_path` char(255) DEFAULT NULL,
  `direccion_texto` char(200) DEFAULT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `maps_url` char(255) DEFAULT NULL,
  `fecha` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reportes_fallas`
--

INSERT INTO `reportes_fallas` (`id`, `idReporte`, `idUsuario`, `concepto`, `foto_path`, `direccion_texto`, `lat`, `lng`, `maps_url`, `fecha`, `created_at`, `updated_at`) VALUES
(5, 'e2523658-d645-468a-972d-ffce4b71b69c', '392b1361-ecd9-41c4-bec1-4e390bf4739b', 'he estado sin agua desde hoy y tres dias antes el agua sale bien sucia como asi con piedras', 'uploads/reportes_fallas/1776995814_xd.webp', 'Direccion de la calle tal', 13.3341665, -88.6970340, 'https://www.google.com/maps?q=13.334166500000002,-88.697034', '2026-04-24', '2026-04-24 07:56:54', '2026-04-24 07:56:54'),
(6, 'e7f87f74-5bb9-47a5-9752-b9890dfee890', '392b1361-ecd9-41c4-bec1-4e390bf4739b', 'aun no se resuelve mi problema con el tanque (no se que paso)', 'uploads/reportes_fallas/1776995856_images.jpg', NULL, 13.4200000, -88.7200000, 'https://www.google.com/maps?q=13.42,-88.72', '2025-12-03', '2026-04-24 07:57:36', '2026-04-24 07:57:36'),
(7, 'ada30800-0b35-4697-ac44-200b378301f1', '184ada73-d156-4c84-8313-0509ee3ba730', 'ya va a venir el agua???', NULL, NULL, 13.3341705, -88.6970373, 'https://www.google.com/maps?q=13.3341705,-88.69703725', '2026-04-23', '2026-04-24 07:58:26', '2026-04-24 07:58:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `idUsuario` char(36) NOT NULL,
  `nombre` char(100) NOT NULL,
  `dui` char(10) NOT NULL,
  `telefono` char(9) NOT NULL,
  `email` char(150) NOT NULL,
  `password` char(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `idUsuario`, `nombre`, `dui`, `telefono`, `email`, `password`, `created_at`, `updated_at`) VALUES
(2, '184ada73-d156-4c84-8313-0509ee3ba730', 'Maria Evangelista', '99952211-2', '7689-4455', 'esmmaria@gmail.com', '$2y$12$lMwUqTAzg3Fnvw/8GXv7SOOY1hcfyYDxnQXc28lrL.SmQZqdspkrW', '2026-04-24 05:51:58', '2026-04-24 07:44:01'),
(5, '392b1361-ecd9-41c4-bec1-4e390bf4739b', 'Alejandro Romero', '12345678-0', '0000-0000', 'ale@gmail.com', '$2y$12$Ik4toU8GiuLVGrrqZE4QT.jZBjVx4qXGZ0JBEw/48EkvIOEnsxNB.', '2026-04-24 07:17:07', '2026-04-24 07:44:11');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD PRIMARY KEY (`idDocente`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `materias`
--
ALTER TABLE `materias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idMateria` (`idMateria`) USING BTREE;

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indices de la tabla `reportes_fallas`
--
ALTER TABLE `reportes_fallas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `materias`
--
ALTER TABLE `materias`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reportes_fallas`
--
ALTER TABLE `reportes_fallas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
