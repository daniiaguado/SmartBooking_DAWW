-- ============================================================
-- SMARTBOOKING - Esquema de base de datos
-- ============================================================

CREATE DATABASE IF NOT EXISTS `smartbooking`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `smartbooking`;

-- ------------------------------------------------------------
-- Tabla: user
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id`                INT            NOT NULL AUTO_INCREMENT,
  `email`             VARCHAR(180)   NOT NULL,
  `roles`             JSON           NOT NULL,
  `password`          VARCHAR(255)   NOT NULL,
  `user_type`         VARCHAR(10)    NOT NULL DEFAULT 'persona',

  -- Campos persona
  `nombre`            VARCHAR(100)   DEFAULT NULL,
  `apellidos`         VARCHAR(150)   DEFAULT NULL,
  `dni`               VARCHAR(20)    DEFAULT NULL,
  `telefono`          VARCHAR(20)    DEFAULT NULL,

  -- Campos empresa
  `nombre_empresa`    VARCHAR(150)   DEFAULT NULL,
  `cif`               VARCHAR(20)    DEFAULT NULL,
  `sector`            VARCHAR(100)   DEFAULT NULL,
  `telefono_empresa`  VARCHAR(20)    DEFAULT NULL,

  `created_at`        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active`         TINYINT(1)     NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_USER_EMAIL` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: category
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `category` (
  `id`          INT            NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(100)   NOT NULL,
  `descripcion` TEXT           DEFAULT NULL,
  `color`       VARCHAR(7)     NOT NULL DEFAULT '#007bff',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: resource
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `resource` (
  `id`           INT             NOT NULL AUTO_INCREMENT,
  `category_id`  INT             DEFAULT NULL,
  `nombre`       VARCHAR(150)    NOT NULL,
  `descripcion`  TEXT            DEFAULT NULL,
  `capacidad`    INT             NOT NULL DEFAULT 1,
  `ubicacion`    VARCHAR(200)    DEFAULT NULL,
  `precio_hora`  DECIMAL(8,2)   NOT NULL DEFAULT '0.00',
  `is_active`    TINYINT(1)      NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_resource_category`
    FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: booking
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `user_id`         INT             NOT NULL,
  `resource_id`     INT             NOT NULL,
  `fecha_inicio`    DATETIME        NOT NULL,
  `fecha_fin`       DATETIME        NOT NULL,
  `asistentes`      INT             NOT NULL DEFAULT 1,
  `motivo`          LONGTEXT        DEFAULT NULL,
  `estado`          VARCHAR(20)     NOT NULL DEFAULT 'pendiente',
  `precio_total`    DECIMAL(10,2)  DEFAULT NULL,
  `cliente_nombre`  VARCHAR(200)    DEFAULT NULL,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_booking_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_booking_resource`
    FOREIGN KEY (`resource_id`) REFERENCES `resource` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Datos de ejemplo: categorías
-- ------------------------------------------------------------
INSERT INTO `category` (`nombre`, `descripcion`, `color`) VALUES
  ('Salas de Reuniones', 'Salas equipadas para reuniones de trabajo', '#0d6efd'),
  ('Equipamiento AV',    'Equipos audiovisuales y tecnológicos',       '#198754'),
  ('Espacios Comunes',   'Zonas comunes y salas multiusos',            '#ffc107'),
  ('Laboratorios',       'Laboratorios de informática y electrónica',  '#dc3545');

-- ------------------------------------------------------------
-- Datos de ejemplo: recursos
-- ------------------------------------------------------------
INSERT INTO `resource` (`category_id`, `nombre`, `descripcion`, `capacidad`, `ubicacion`, `precio_hora`, `is_active`) VALUES
  (1, 'Sala A – Directivos',    'Sala equipada con proyector y videoconferencia', 10,  'Planta 2, Ala Norte', 25.00, 1),
  (1, 'Sala B – General',       'Sala de reuniones de uso general',               20,  'Planta 1, Ala Sur',   15.00, 1),
  (1, 'Sala C – Formación',     'Sala de formación con pizarra digital',          30,  'Planta 3',            20.00, 1),
  (2, 'Proyector Epson EB-X41', 'Proyector Full HD portátil',                      1,  'Almacén TI',           5.00, 1),
  (2, 'Kit Videoconferencia',   'Cámara y altavoz para reuniones remotas',         1,  'Almacén TI',           8.00, 1),
  (3, 'Auditorio Principal',    'Auditorio con capacidad para 100 personas',      100, 'Planta Baja',         75.00, 1),
  (4, 'Lab. Informática 1',     'Laboratorio con 30 ordenadores',                 30,  'Planta 1',            30.00, 1);

-- ------------------------------------------------------------
-- Usuario administrador por defecto
-- (contraseña: Admin1234! — hash bcrypt generado con Symfony)
-- Ejecuta: php bin/console app:create-admin  para crear uno nuevo
-- ------------------------------------------------------------
