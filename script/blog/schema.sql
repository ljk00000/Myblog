-- MySQL 8.4. Additive and repeatable: never deletes or seeds personal content.
-- Existing blog tables must match this version; upgrades require a separate migration.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS blog_category (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  type VARCHAR(16) NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  creator VARCHAR(64) NOT NULL DEFAULT '', updater VARCHAR(64) NOT NULL DEFAULT '',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted BIT(1) NOT NULL DEFAULT b'0', tenant_id BIGINT NOT NULL,
  PRIMARY KEY (id), UNIQUE KEY uk_blog_category_slug (tenant_id, type, slug),
  CONSTRAINT ck_blog_category_type CHECK (type IN ('article','resource'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_tag (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL, slug VARCHAR(120) NOT NULL,
  creator VARCHAR(64) NOT NULL DEFAULT '', updater VARCHAR(64) NOT NULL DEFAULT '',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted BIT(1) NOT NULL DEFAULT b'0', tenant_id BIGINT NOT NULL,
  PRIMARY KEY (id), UNIQUE KEY uk_blog_tag_slug (tenant_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_article (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL, slug VARCHAR(120) NOT NULL,
  summary VARCHAR(1000) NOT NULL DEFAULT '',
  content_markdown MEDIUMTEXT NOT NULL, content_html MEDIUMTEXT NOT NULL,
  cover_url VARCHAR(1000) NOT NULL DEFAULT '', category_id BIGINT NULL,
  status TINYINT NOT NULL DEFAULT 0, pinned BIT(1) NOT NULL DEFAULT b'0',
  publish_time DATETIME NULL, reading_minutes INT NOT NULL DEFAULT 1,
  seo_title VARCHAR(200) NOT NULL DEFAULT '', seo_description VARCHAR(500) NOT NULL DEFAULT '',
  creator VARCHAR(64) NOT NULL DEFAULT '', updater VARCHAR(64) NOT NULL DEFAULT '',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted BIT(1) NOT NULL DEFAULT b'0', tenant_id BIGINT NOT NULL,
  PRIMARY KEY (id), UNIQUE KEY uk_blog_article_slug (tenant_id, slug),
  KEY idx_blog_article_public (tenant_id, deleted, status, pinned, publish_time, id),
  KEY idx_blog_article_category (tenant_id, category_id),
  CONSTRAINT ck_blog_article_status CHECK (status IN (0,1,2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_article_tag (
  id BIGINT NOT NULL AUTO_INCREMENT, article_id BIGINT NOT NULL, tag_id BIGINT NOT NULL,
  creator VARCHAR(64) NOT NULL DEFAULT '', updater VARCHAR(64) NOT NULL DEFAULT '',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted BIT(1) NOT NULL DEFAULT b'0', tenant_id BIGINT NOT NULL,
  PRIMARY KEY (id), KEY idx_blog_article_tag (tenant_id, article_id, deleted, tag_id),
  KEY idx_blog_tag_article (tenant_id, tag_id, deleted, article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_resource (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL, slug VARCHAR(120) NOT NULL,
  summary VARCHAR(1000) NOT NULL DEFAULT '',
  content_markdown MEDIUMTEXT NOT NULL, content_html MEDIUMTEXT NOT NULL,
  type VARCHAR(16) NOT NULL DEFAULT 'link', url VARCHAR(2000) NOT NULL,
  cover_url VARCHAR(1000) NOT NULL DEFAULT '', category_id BIGINT NULL,
  status TINYINT NOT NULL DEFAULT 0, featured BIT(1) NOT NULL DEFAULT b'0', sort INT NOT NULL DEFAULT 0,
  publish_time DATETIME NULL,
  seo_title VARCHAR(200) NOT NULL DEFAULT '', seo_description VARCHAR(500) NOT NULL DEFAULT '',
  creator VARCHAR(64) NOT NULL DEFAULT '', updater VARCHAR(64) NOT NULL DEFAULT '',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted BIT(1) NOT NULL DEFAULT b'0', tenant_id BIGINT NOT NULL,
  PRIMARY KEY (id), UNIQUE KEY uk_blog_resource_slug (tenant_id, slug),
  KEY idx_blog_resource_public (tenant_id, deleted, status, featured, sort, publish_time, id),
  KEY idx_blog_resource_category (tenant_id, category_id),
  CONSTRAINT ck_blog_resource_status CHECK (status IN (0,1,2)),
  CONSTRAINT ck_blog_resource_type CHECK (type IN ('link','file'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_site_config (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL, subtitle VARCHAR(200) NOT NULL DEFAULT '', description VARCHAR(500) NOT NULL DEFAULT '',
  author_name VARCHAR(80) NOT NULL, avatar_url VARCHAR(1000) NOT NULL DEFAULT '',
  about_markdown MEDIUMTEXT NOT NULL, about_html MEDIUMTEXT NOT NULL,
  site_url VARCHAR(500) NOT NULL, github_url VARCHAR(1000) NOT NULL DEFAULT '',
  email VARCHAR(200) NOT NULL DEFAULT '', footer_text VARCHAR(500) NOT NULL DEFAULT '',
  creator VARCHAR(64) NOT NULL DEFAULT '', updater VARCHAR(64) NOT NULL DEFAULT '',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted BIT(1) NOT NULL DEFAULT b'0', tenant_id BIGINT NOT NULL,
  PRIMARY KEY (id), UNIQUE KEY uk_blog_site_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
