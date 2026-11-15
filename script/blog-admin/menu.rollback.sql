-- Restore only this migration's navigation fields and automatically added grants.
-- Run against the same database as menu.apply.sql. Backups remain for inspection.
SET NAMES utf8mb4;
DROP PROCEDURE IF EXISTS blog_admin_rollback_20261115;
DELIMITER $$
CREATE PROCEDURE blog_admin_rollback_20261115()
rollback_migration: BEGIN
  DECLARE active_state INT DEFAULT 0;
  DECLARE nacos_id BIGINT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  SELECT active, nacos_menu_id INTO active_state, nacos_id
  FROM blog_admin_state_20261115 WHERE id = 1 FOR UPDATE;
  IF active_state = 0 THEN
    SELECT 'already rolled back; no changes' AS result;
    COMMIT;
    LEAVE rollback_migration;
  END IF;

  -- Do not overwrite menu edits made after the migration.
  IF EXISTS (
    SELECT 1 FROM blog_admin_menu_after_20261115 expected
    LEFT JOIN system_menu current ON current.id = expected.id
    WHERE current.id IS NULL OR NOT (
      current.name <=> expected.name AND current.parent_id <=> expected.parent_id
      AND current.path <=> expected.path AND current.sort <=> expected.sort
      AND current.visible <=> expected.visible AND current.deleted <=> expected.deleted
      AND current.updater <=> expected.updater AND current.update_time <=> expected.update_time
    )
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Menus changed after migration; inspect snapshots before rollback';
  END IF;
  IF EXISTS (
    SELECT 1 FROM blog_admin_package_after_20261115 expected
    JOIN blog_admin_package_before_20261115 original ON original.id = expected.id
    LEFT JOIN system_tenant_package current ON current.id = expected.id
    WHERE NOT (original.menu_ids <=> expected.menu_ids)
      AND (current.id IS NULL OR NOT (current.menu_ids <=> expected.menu_ids
        AND current.updater <=> expected.updater AND current.update_time <=> expected.update_time))
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tenant package changed after migration; inspect before rollback';
  END IF;
  IF EXISTS (SELECT 1 FROM system_role_menu
    WHERE menu_id = nacos_id AND deleted = b'0' AND creator <> 'blog-admin-20261115') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nacos received new role grants; inspect before rollback';
  END IF;

  UPDATE system_menu current
  JOIN blog_admin_menu_before_20261115 original ON original.id = current.id
  SET current.name = original.name, current.parent_id = original.parent_id,
      current.path = original.path, current.sort = original.sort,
      current.visible = original.visible, current.updater = original.updater,
      current.update_time = original.update_time;

  DELETE current FROM system_role_menu current
  LEFT JOIN blog_admin_role_menu_before_20261115 original ON original.id = current.id
  WHERE original.id IS NULL AND current.creator = 'blog-admin-20261115'
    AND current.menu_id IN (2, nacos_id);
  UPDATE system_tenant_package current
  JOIN blog_admin_package_before_20261115 original ON original.id = current.id
  JOIN blog_admin_package_after_20261115 expected ON expected.id = current.id
  SET current.menu_ids = original.menu_ids, current.updater = original.updater,
      current.update_time = original.update_time
  WHERE NOT (original.menu_ids <=> expected.menu_ids);
  DELETE FROM system_menu WHERE id = nacos_id AND creator = 'blog-admin-20261115';
  UPDATE blog_admin_state_20261115 SET active = 0, rolled_back_at = NOW() WHERE id = 1;
  COMMIT;
  SELECT 'rolled back' AS result;
END$$
DELIMITER ;
CALL blog_admin_rollback_20261115();
DROP PROCEDURE blog_admin_rollback_20261115;
