-- ============================================================
-- Obsidian Vinyl - Database Schema & Collaborative Features
-- ============================================================

-- ------------------------------------------------------------
-- Table structure for table `music`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `music` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `artist` VARCHAR(255) NOT NULL,
  `album` VARCHAR(255) NULL,
  `genre` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `cover_image` VARCHAR(255) NULL,
  `audio_file` VARCHAR(255) NOT NULL,
  `youtube_url` VARCHAR(255) NULL,
  `duration` VARCHAR(20) NULL,
  `file_size` BIGINT UNSIGNED DEFAULT 0,
  `play_count` INT UNSIGNED DEFAULT 0,
  `uploader_name` VARCHAR(100) DEFAULT 'Admin',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active_created` (`is_active`, `created_at`),
  INDEX `idx_genre` (`is_active`, `genre`),
  INDEX `idx_active_play_count` (`is_active`, `play_count`),
  INDEX `idx_search` (`title`, `artist`),
  INDEX `idx_uploader` (`uploader_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for table `playlists` (Community & Shared)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `playlists` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `emoji` VARCHAR(20) DEFAULT '🎧',
  `gradient` VARCHAR(50) DEFAULT 'default',
  `custom_cover` LONGTEXT NULL,
  `creator_name` VARCHAR(100) DEFAULT 'Admin',
  `status` VARCHAR(20) DEFAULT 'pending',
  `client_token` VARCHAR(100) NULL,
  `is_public` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_public_created` (`is_public`, `created_at`),
  INDEX `idx_status_public` (`status`, `is_public`),
  INDEX `idx_creator` (`creator_name`),
  INDEX `idx_client_token` (`client_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for pivot table `playlist_music`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `playlist_music` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `playlist_id` INT UNSIGNED NOT NULL,
  `music_id` INT NOT NULL,
  `order_position` INT UNSIGNED DEFAULT 0,
  `added_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_pl_music` (`playlist_id`, `music_id`),
  INDEX `idx_pl_id` (`playlist_id`),
  INDEX `idx_ms_id` (`music_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Seed initial tracks from assets/ (jika tabel masih kosong)
-- ------------------------------------------------------------
INSERT INTO `music` (`slug`, `title`, `artist`, `album`, `genre`, `description`, `cover_image`, `audio_file`, `youtube_url`, `duration`, `file_size`, `play_count`, `uploader_name`, `is_active`)
SELECT * FROM (
  SELECT
    'imagine-dragons-believer' AS `slug`,
    'Believer' AS `title`,
    'Imagine Dragons' AS `artist`,
    'Evolve' AS `album`,
    'Rock' AS `genre`,
    'Driving percussion, explosive arena-rock dynamics, and raw lyrical urgency.' AS `description`,
    'believer.jpg' AS `cover_image`,
    'believer.mp4' AS `audio_file`,
    'https://www.youtube.com/watch?v=7wtfhZwyrcc' AS `youtube_url`,
    '3:37' AS `duration`,
    0 AS `file_size`,
    124 AS `play_count`,
    'Admin' AS `uploader_name`,
    1 AS `is_active`
  UNION ALL
  SELECT
    'ed-sheeran-shape-of-you',
    'Shape of You',
    'Ed Sheeran',
    '÷ (Divide)',
    'Pop',
    'Infectious pop rhythms with marimba-infused beats and vocal hooks.',
    'shape-of-you.jpg',
    'shape.mp4',
    'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    '3:54',
    0,
    98,
    'Admin',
    1
  UNION ALL
  SELECT
    'backstreet-boys-shape-of-my-heart',
    'Shape Of My Heart',
    'Backstreet Boys',
    'Black & Blue',
    'Pop',
    'Classic late-90s vocal harmony pop ballad with lush acoustic textures.',
    'shape-of-my-heart.jpg',
    'of my heart.mp4',
    'https://www.youtube.com/watch?v=OT5msu-dap8',
    '4:23',
    0,
    76,
    'Admin',
    1
  UNION ALL
  SELECT
    'alex-si-alan-miss-you',
    'Miss You',
    'Alex Si Alan',
    'Acoustic Sessions',
    'Pop',
    'Intimate acoustic arrangement with emotive vocal delivery.',
    'i-miss-you.png',
    'I Miss You.mp4',
    '',
    '3:45',
    0,
    42,
    'Admin',
    1
  UNION ALL
  SELECT
    'afgan-jodoh-pasti-bertemu',
    'Jodoh Pasti Bertemu',
    'Afgan',
    'L1ve to Love, Love to L1ve',
    'Pop',
    'Soulful Indonesian pop ballad with sweeping orchestration.',
    'bertemu.jpg',
    'Jodoh Pasti Bertemu.mp3',
    '',
    '3:51',
    0,
    55,
    'Admin',
    1
) AS `seed`
WHERE NOT EXISTS (SELECT 1 FROM `music` LIMIT 1);
