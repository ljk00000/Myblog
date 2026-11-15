-- Removes only this installation's menu rows. Content tables/data are retained.
-- Stop on later edits or new role grants; review/remove those intentionally first.
SET NAMES utf8mb4;
DROP PROCEDURE IF EXISTS blog_menu_rollback_20261115;
DELIMITER $$
CREATE PROCEDURE blog_menu_rollback_20261115()
rollback_migration: BEGIN
  DECLARE installed INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  SELECT active INTO installed FROM blog_menu_state_20261115 WHERE id=1 FOR UPDATE;
  IF installed=0 THEN
    SELECT 'already rolled back; no changes' AS result;
    COMMIT; LEAVE rollback_migration;
  END IF;
  IF (SELECT COUNT(*) FROM system_menu WHERE id BETWEEN 25400 AND 25418) <> 19
    OR EXISTS (
      SELECT 1 FROM system_menu m JOIN blog_menu_snapshot_20261115 s ON s.id=m.id
      WHERE NOT (m.name <=> s.name AND m.permission <=> s.permission AND m.type <=> s.type
        AND m.parent_id <=> s.parent_id AND m.path <=> s.path AND m.icon <=> s.icon
        AND m.component <=> s.component AND m.component_name <=> s.component_name
        AND m.status <=> s.status AND m.visible <=> s.visible AND m.sort <=> s.sort
        AND m.keep_alive <=> s.keep_alive AND m.always_show <=> s.always_show AND m.deleted <=> s.deleted
        AND m.creator <=> s.creator AND m.updater <=> s.updater)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Blog menus changed after install; rollback stopped';
  END IF;
  IF EXISTS (SELECT 1 FROM system_role_menu WHERE menu_id BETWEEN 25400 AND 25418 AND deleted=b'0')
    OR EXISTS (SELECT 1 FROM system_menu WHERE parent_id BETWEEN 25400 AND 25418 AND id NOT BETWEEN 25400 AND 25418) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='New menu grants or children exist; rollback stopped';
  END IF;
  DELETE FROM system_menu WHERE id BETWEEN 25400 AND 25418;
  UPDATE blog_menu_state_20261115 SET active=0 WHERE id=1;
  COMMIT;
  SELECT 'blog menus removed; content retained' AS result;
END$$
DELIMITER ;
CALL blog_menu_rollback_20261115();
DROP PROCEDURE blog_menu_rollback_20261115;
