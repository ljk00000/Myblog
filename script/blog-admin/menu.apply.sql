-- MyBlog phase 1, for the verified master-jdk25 menu schema (MySQL 8).
-- Optional before SOURCE: SET @blog_nacos_url = 'https://your-nacos-console/';
-- Changes navigation only. Existing button permissions and grants are retained.
SET NAMES utf8mb4;
SET @blog_nacos_url = COALESCE(@blog_nacos_url, 'http://127.0.0.1:18080/#/configurationManagement');

CREATE TABLE IF NOT EXISTS blog_admin_menu_before_20261115 LIKE system_menu;
CREATE TABLE IF NOT EXISTS blog_admin_menu_after_20261115 LIKE system_menu;
CREATE TABLE IF NOT EXISTS blog_admin_role_menu_before_20261115 LIKE system_role_menu;
CREATE TABLE IF NOT EXISTS blog_admin_package_before_20261115 LIKE system_tenant_package;
CREATE TABLE IF NOT EXISTS blog_admin_package_after_20261115 LIKE system_tenant_package;
CREATE TABLE IF NOT EXISTS blog_admin_state_20261115 (
  id TINYINT NOT NULL PRIMARY KEY,
  active TINYINT NOT NULL DEFAULT 0,
  nacos_menu_id BIGINT NULL,
  applied_at DATETIME NULL,
  rolled_back_at DATETIME NULL
) ENGINE=InnoDB;

DROP PROCEDURE IF EXISTS blog_admin_apply_20261115;
DELIMITER $$
CREATE PROCEDURE blog_admin_apply_20261115()
apply_migration: BEGIN
  DECLARE nacos_id BIGINT;
  DECLARE active_state INT DEFAULT 0;
  DECLARE target_count INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  INSERT IGNORE INTO blog_admin_state_20261115 (id, active) VALUES (1, 0);
  SELECT active INTO active_state FROM blog_admin_state_20261115 WHERE id = 1 FOR UPDATE;
  IF active_state = 1 THEN
    SELECT 'already applied; no changes' AS result;
    COMMIT;
    LEAVE apply_migration;
  END IF;

  -- Fail closed if the menu layout differs from the inspected upstream database.
  SELECT COUNT(*) INTO target_count FROM system_menu
  WHERE deleted = b'0' AND (
    (id = 1 AND parent_id = 0 AND path = '/system') OR
    (id = 2 AND parent_id = 0 AND path = '/infra') OR
    (id = 4 AND component = 'system/user/index') OR
    (id = 5 AND component = 'system/role/index') OR
    (id = 6 AND parent_id = 1 AND path = 'menu' AND component = 'system/menu/index') OR
    (id = 9 AND parent_id = 1 AND path = 'dict' AND component = 'system/dict/index') OR
    (id = 10 AND component = 'infra/config/index') OR
    (id = 19 AND component = 'infra/codegen/index') OR
    (id = 20 AND component = 'infra/swagger/index') OR
    (id = 21 AND parent_id = 12 AND path = 'operate-log') OR
    (id = 22 AND parent_id = 12 AND path = 'login-log') OR
    (id = 86 AND component = 'infra/apiAccessLog/index') OR
    (id = 88 AND parent_id = 2 AND path = 'log') OR
    (id = 89 AND component = 'infra/apiErrorLog/index') OR
    (id = 95 AND parent_id = 193 AND path = 'file' AND component = 'infra/file/index') OR
    (id = 187 AND parent_id = 193 AND path = 'file-config' AND component = 'infra/fileConfig/index') OR
    (id = 193 AND parent_id = 2 AND path = 'file') OR
    (id = 195 AND component = 'infra/dataSourceConfig/index')
  );
  IF target_count <> 18 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Menu layout differs from verified baseline; migration stopped';
  END IF;
  IF @blog_nacos_url NOT REGEXP '^https?://[^[:space:]]+$' OR CHAR_LENGTH(@blog_nacos_url) > 200 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid Nacos console URL';
  END IF;
  IF EXISTS (SELECT 1 FROM system_menu WHERE component_name = 'BlogNacosConsole') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'BlogNacosConsole already exists outside this migration';
  END IF;
  IF EXISTS (SELECT 1 FROM system_tenant_package WHERE deleted = b'0' AND NOT JSON_VALID(menu_ids)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tenant package menu_ids must be valid JSON arrays';
  END IF;

  -- Refresh snapshots only on a new application (never on an idempotent rerun).
  DELETE FROM blog_admin_menu_before_20261115;
  DELETE FROM blog_admin_menu_after_20261115;
  DELETE FROM blog_admin_role_menu_before_20261115;
  DELETE FROM blog_admin_package_before_20261115;
  DELETE FROM blog_admin_package_after_20261115;
  INSERT INTO blog_admin_menu_before_20261115 SELECT * FROM system_menu WHERE deleted = b'0' AND type IN (1, 2);
  INSERT INTO blog_admin_role_menu_before_20261115 SELECT * FROM system_role_menu;
  INSERT INTO blog_admin_package_before_20261115 SELECT * FROM system_tenant_package;

  UPDATE system_menu SET visible = b'0', updater = 'blog-admin-20261115'
  WHERE deleted = b'0' AND type IN (1, 2);
  UPDATE system_menu SET visible = b'1', updater = 'blog-admin-20261115'
  WHERE id IN (1, 2, 4, 5, 6, 9, 10, 19, 21, 22, 86, 88, 89, 95, 187, 193, 195);

  -- Reuse the original file directory ID; the file-list URL stays /infra/file/file.
  UPDATE system_menu SET name = '媒体资源', parent_id = 0, path = '/infra/file', sort = 5 WHERE id = 193;
  UPDATE system_menu SET name = '文件管理', sort = 1 WHERE id = 95;
  UPDATE system_menu SET name = '系统管理', sort = 10 WHERE id = 1;
  UPDATE system_menu SET name = '管理员账号', sort = 1 WHERE id = 4;
  UPDATE system_menu SET name = '角色与权限', sort = 2 WHERE id = 5;
  UPDATE system_menu SET parent_id = 1, path = 'log/login-log', sort = 3 WHERE id = 22;
  UPDATE system_menu SET parent_id = 1, path = 'log/operate-log', sort = 4 WHERE id = 21;

  -- Absolute child paths preserve old URLs when their displayed directory changes.
  UPDATE system_menu SET name = '开发运维', sort = 20 WHERE id = 2;
  UPDATE system_menu SET parent_id = 2, path = '/system/menu', sort = 1 WHERE id = 6;
  UPDATE system_menu SET parent_id = 2, path = '/system/dict', sort = 2 WHERE id = 9;
  UPDATE system_menu SET name = '参数配置', sort = 3 WHERE id = 10;
  UPDATE system_menu SET name = '文件存储配置', parent_id = 2, path = 'file/file-config', sort = 4 WHERE id = 187;
  UPDATE system_menu SET sort = 5 WHERE id = 19;
  UPDATE system_menu SET sort = 6 WHERE id = 195;
  UPDATE system_menu SET name = 'API 文档', sort = 7 WHERE id = 20;
  UPDATE system_menu SET sort = 8 WHERE id = 88;
  -- Job API currently returns 404; monitoring dependencies are not deployed. Keep hidden.

  INSERT INTO system_menu
    (name, permission, type, sort, parent_id, path, icon, component_name,
     status, visible, keep_alive, always_show, creator, updater)
  VALUES
    ('Nacos 控制台', 'infra:config:query', 2, 9, 2, @blog_nacos_url, 'ep:connection', 'BlogNacosConsole',
     0, b'1', b'0', b'1', 'blog-admin-20261115', 'blog-admin-20261115');
  SET nacos_id = LAST_INSERT_ID();

  -- Add directory grants only where a moved child was already granted.
  INSERT INTO system_role_menu (role_id, menu_id, creator, updater, tenant_id)
  SELECT DISTINCT source.role_id, 2, 'blog-admin-20261115', 'blog-admin-20261115', source.tenant_id
  FROM blog_admin_role_menu_before_20261115 source
  WHERE source.deleted = b'0' AND source.menu_id IN (6, 9, 187)
    AND NOT EXISTS (SELECT 1 FROM system_role_menu existing
      WHERE existing.role_id = source.role_id AND existing.tenant_id = source.tenant_id
        AND existing.menu_id = 2 AND existing.deleted = b'0');
  -- Nacos is a separate login-protected console, exposed only to existing config managers.
  INSERT INTO system_role_menu (role_id, menu_id, creator, updater, tenant_id)
  SELECT DISTINCT source.role_id, nacos_id, 'blog-admin-20261115', 'blog-admin-20261115', source.tenant_id
  FROM blog_admin_role_menu_before_20261115 source
  WHERE source.deleted = b'0' AND source.menu_id = 10;

  UPDATE system_tenant_package
  SET menu_ids = JSON_ARRAY_APPEND(menu_ids, '$', 2), updater = 'blog-admin-20261115'
  WHERE deleted = b'0' AND NOT JSON_CONTAINS(menu_ids, '2')
    AND (JSON_CONTAINS(menu_ids, '6') OR JSON_CONTAINS(menu_ids, '9') OR JSON_CONTAINS(menu_ids, '187'));
  UPDATE system_tenant_package
  SET menu_ids = JSON_ARRAY_APPEND(menu_ids, '$', nacos_id), updater = 'blog-admin-20261115'
  WHERE deleted = b'0' AND JSON_CONTAINS(menu_ids, '10');

  INSERT INTO blog_admin_menu_after_20261115 SELECT * FROM system_menu WHERE deleted = b'0' AND type IN (1, 2);
  INSERT INTO blog_admin_package_after_20261115 SELECT * FROM system_tenant_package;
  UPDATE blog_admin_state_20261115
    SET active = 1, nacos_menu_id = nacos_id, applied_at = NOW(), rolled_back_at = NULL WHERE id = 1;
  COMMIT;
  SELECT 'applied' AS result, nacos_id AS nacos_menu_id;
END$$
DELIMITER ;
CALL blog_admin_apply_20261115();
DROP PROCEDURE blog_admin_apply_20261115;
