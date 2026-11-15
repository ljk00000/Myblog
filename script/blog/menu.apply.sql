-- Add blog navigation only. System tenant super_admin already sees all enabled menus.
-- No existing role grants or tenant packages are changed. Reserve IDs 25400..25418.
SET NAMES utf8mb4;
CREATE TABLE IF NOT EXISTS blog_menu_snapshot_20261115 LIKE system_menu;
CREATE TABLE IF NOT EXISTS blog_menu_state_20261115 (
  id TINYINT NOT NULL PRIMARY KEY, active TINYINT NOT NULL DEFAULT 0, applied_at DATETIME NULL
) ENGINE=InnoDB;
DROP PROCEDURE IF EXISTS blog_menu_apply_20261115;
DELIMITER $$
CREATE PROCEDURE blog_menu_apply_20261115()
apply_migration: BEGIN
  DECLARE installed INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  INSERT IGNORE INTO blog_menu_state_20261115(id,active) VALUES(1,0);
  SELECT active INTO installed FROM blog_menu_state_20261115 WHERE id=1 FOR UPDATE;
  IF installed=1 THEN
    SELECT 'already applied; no changes' AS result;
    COMMIT; LEAVE apply_migration;
  END IF;
  IF EXISTS (SELECT 1 FROM system_menu WHERE id BETWEEN 25400 AND 25418)
    OR EXISTS (SELECT 1 FROM system_menu WHERE path='/blog' OR component LIKE 'blog/%' OR permission LIKE 'blog:%') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Blog menu namespace or reserved IDs already exist; stopped';
  END IF;
  INSERT INTO system_menu
    (id,name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,updater)
  VALUES
    (25400,'博客内容','',1,2,0,'/blog','ep:notebook',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25401,'文章管理','blog:article:query',2,1,25400,'article','ep:document','blog/article/index','BlogArticle',0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25402,'资源分享','blog:resource:query',2,2,25400,'resource','ep:collection','blog/resource/index','BlogResource',0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25403,'分类管理','blog:category:query',2,3,25400,'category','ep:folder','blog/category/index','BlogCategory',0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25404,'标签管理','blog:tag:query',2,4,25400,'tag','ep:price-tag','blog/tag/index','BlogTag',0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25405,'站点设置','blog:site:query',2,5,25400,'site','ep:setting','blog/site/index','BlogSite',0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25406,'创建文章','blog:article:create',3,1,25401,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25407,'更新文章','blog:article:update',3,2,25401,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25408,'删除文章','blog:article:delete',3,3,25401,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25409,'创建资源','blog:resource:create',3,1,25402,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25410,'更新资源','blog:resource:update',3,2,25402,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25411,'删除资源','blog:resource:delete',3,3,25402,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25412,'创建分类','blog:category:create',3,1,25403,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25413,'更新分类','blog:category:update',3,2,25403,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25414,'删除分类','blog:category:delete',3,3,25403,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25415,'创建标签','blog:tag:create',3,1,25404,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25416,'更新标签','blog:tag:update',3,2,25404,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25417,'删除标签','blog:tag:delete',3,3,25404,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115'),
    (25418,'更新站点','blog:site:update',3,1,25405,'','#',NULL,NULL,0,b'1',b'0',b'1','blog-v1-20261115','blog-v1-20261115');
  DELETE FROM blog_menu_snapshot_20261115;
  INSERT INTO blog_menu_snapshot_20261115 SELECT * FROM system_menu WHERE id BETWEEN 25400 AND 25418;
  UPDATE blog_menu_state_20261115 SET active=1,applied_at=NOW() WHERE id=1;
  COMMIT;
  SELECT 'blog menu applied (19 records); existing grants unchanged' AS result;
END$$
DELIMITER ;
CALL blog_menu_apply_20261115();
DROP PROCEDURE blog_menu_apply_20261115;
