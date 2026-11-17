package cn.iocoder.myblog.module.blog.dal.dataobject;

import cn.iocoder.myblog.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

/** Blog persistence models; API input and public output are defined separately. */
public final class BlogEntities {
    private BlogEntities() {}

    @Data
    @EqualsAndHashCode(callSuper = true)
    public abstract static class Content extends TenantBaseDO {
        @TableId(type = IdType.AUTO)
        private Long id;
        private String title;
        private String slug;
        private String summary;
        private String contentMarkdown;
        private String contentHtml;
        private String coverUrl;
        @TableField(updateStrategy = FieldStrategy.ALWAYS)
        private Long categoryId;
        private Integer status;
        private LocalDateTime publishTime;
        private String seoTitle;
        private String seoDescription;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @TableName("blog_article")
    public static class Article extends Content {
        private Boolean pinned;
        private Integer readingMinutes;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @TableName("blog_resource")
    public static class Resource extends Content {
        private String type;
        private String url;
        private Boolean featured;
        private Integer sort;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @TableName("blog_category")
    public static class Category extends TenantBaseDO {
        @TableId(type = IdType.AUTO)
        private Long id;
        private String name;
        private String slug;
        private String type;
        private Integer sort;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @TableName("blog_tag")
    public static class Tag extends TenantBaseDO {
        @TableId(type = IdType.AUTO)
        private Long id;
        private String name;
        private String slug;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @TableName("blog_article_tag")
    public static class ArticleTag extends TenantBaseDO {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long articleId;
        private Long tagId;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @TableName("blog_site_config")
    public static class Site extends TenantBaseDO {
        @TableId(type = IdType.AUTO)
        private Long id;
        private String title;
        private String subtitle;
        private String description;
        private String authorName;
        private String avatarUrl;
        private String aboutMarkdown;
        private String aboutHtml;
        private String siteUrl;
        private String githubUrl;
        private String email;
        private String footerText;
    }
}
