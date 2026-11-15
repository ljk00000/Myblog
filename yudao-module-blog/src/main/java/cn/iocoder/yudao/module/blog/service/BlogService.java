package cn.iocoder.yudao.module.blog.service;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.blog.controller.vo.BlogModels.*;
import cn.iocoder.yudao.module.blog.dal.dataobject.BlogEntities.*;
import cn.iocoder.yudao.module.blog.dal.mysql.BlogMappers.*;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception0;

@Service
@RequiredArgsConstructor
public class BlogService {
    private final ArticleMapper articles;
    private final ResourceMapper resources;
    private final CategoryMapper categories;
    private final TagMapper tags;
    private final ArticleTagMapper articleTags;
    private final SiteMapper sites;
    private final MarkdownService markdown;

    private static final String[] LIST_COLUMNS = {"id", "title", "slug", "summary", "cover_url", "category_id",
            "status", "publish_time", "create_time", "update_time", "seo_title", "seo_description"};

    private <T extends Content> QueryWrapper<T> contentQuery(Query q, boolean published) {
        QueryWrapper<T> w = new QueryWrapper<>();
        if (published) visible(w);
        else if (q.getStatus() != null) w.eq("status", q.getStatus());
        if (q.getKeyword() != null && !q.getKeyword().isBlank()) {
            String keyword = q.getKeyword().strip();
            w.and(a -> a.like("title", keyword).or().like("summary", keyword).or().like("content_markdown", keyword));
        }
        w.eq(q.getCategoryId() != null, "category_id", q.getCategoryId());
        return w;
    }
    private <T extends Content> QueryWrapper<T> visible(QueryWrapper<T> w) {
        return w.eq("status", 1).le("publish_time", LocalDateTime.now());
    }
    public PageResult<Map<String, Object>> articlePage(Query q, boolean published) {
        QueryWrapper<Article> w = contentQuery(q, published);
        w.eq(q.getPinned() != null, "pinned", q.getPinned());
        if (q.getYearMonth() != null) {
            YearMonth month = YearMonth.parse(q.getYearMonth());
            w.ge("publish_time", month.atDay(1).atStartOfDay())
                    .lt("publish_time", month.plusMonths(1).atDay(1).atStartOfDay());
        }
        if (q.getTagId() != null) {
            List<Long> ids = articleTags.selectList("tag_id", q.getTagId()).stream().map(ArticleTag::getArticleId).distinct().toList();
            if (ids.isEmpty()) return PageResult.empty();
            w.in("id", ids);
        }
        w.select(listColumns("pinned", "reading_minutes")).orderByDesc("pinned", "publish_time", "id");
        Page<Article> page = articles.selectPage(new Page<>(q.getPageNo(), q.getPageSize()), w);
        return new PageResult<>(page.getRecords().stream().map(a -> articleView(a, !published, false)).toList(), page.getTotal());
    }
    public PageResult<Map<String, Object>> resourcePage(Query q, boolean published) {
        QueryWrapper<Resource> w = contentQuery(q, published);
        w.eq(q.getType() != null, "type", q.getType()).eq(q.getFeatured() != null, "featured", q.getFeatured());
        w.select(listColumns("type", "url", "featured", "sort"))
                .orderByDesc("featured").orderByAsc("sort").orderByDesc("publish_time", "id");
        Page<Resource> page = resources.selectPage(new Page<>(q.getPageNo(), q.getPageSize()), w);
        return new PageResult<>(page.getRecords().stream().map(a -> resourceView(a, !published, false)).toList(), page.getTotal());
    }
    private String[] listColumns(String... extra) {
        List<String> columns = new ArrayList<>(List.of(LIST_COLUMNS));
        columns.addAll(List.of(extra));
        return columns.toArray(String[]::new);
    }
    public Map<String, Object> articleGet(Long id) {
        return articleView(required(articles.selectById(id)), true, true);
    }
    public Map<String, Object> resourceGet(Long id) {
        return resourceView(required(resources.selectById(id)), true, true);
    }
    public Map<String, Object> publicArticle(String slug) {
        return articleView(required(articles.selectOne(visible(new QueryWrapper<Article>()).eq("slug", slug))), false, true);
    }
    public Map<String, Object> publicResource(String slug) {
        return resourceView(required(resources.selectOne(visible(new QueryWrapper<Resource>()).eq("slug", slug))), false, true);
    }
    @Transactional
    public Long saveArticle(ArticleSave input, boolean update) {
        Article entity = update ? required(articles.selectById(requiredId(input.getId()))) : new Article();
        validateSlug(entity, input);
        validateCategory(input.getCategoryId(), "article");
        List<Long> tagIds = input.getTagIds().stream().distinct().toList();
        if (!tagIds.isEmpty() && tags.selectCount(new QueryWrapper<Tag>().in("id", tagIds)) != tagIds.size()) {
            throw exception0(400, "包含不存在的标签");
        }
        if (input.getStatus() == 1 && input.getContentMarkdown().isBlank()) throw exception0(400, "请先填写文章正文再发布");
        fillContent(entity, input);
        entity.setPinned(input.getPinned());
        entity.setReadingMinutes(markdown.render(input.getContentMarkdown()).readingMinutes());
        if (update) articles.updateById(entity); else articles.insert(entity);
        if (update) articleTags.delete(new QueryWrapper<ArticleTag>().eq("article_id", entity.getId()));
        for (Long tagId : tagIds) {
            ArticleTag relation = new ArticleTag();
            relation.setArticleId(entity.getId());
            relation.setTagId(tagId);
            articleTags.insert(relation);
        }
        return entity.getId();
    }
    @Transactional
    public Long saveResource(ResourceSave input, boolean update) {
        Resource entity = update ? required(resources.selectById(requiredId(input.getId()))) : new Resource();
        validateSlug(entity, input);
        validateCategory(input.getCategoryId(), "resource");
        fillContent(entity, input);
        entity.setType(input.getType());
        entity.setUrl(UrlPolicy.contentUrl(input.getUrl(), true));
        entity.setFeatured(input.getFeatured());
        entity.setSort(input.getSort());
        if (update) resources.updateById(entity); else resources.insert(entity);
        return entity.getId();
    }
    private void validateSlug(Content entity, ContentSave input) {
        if (entity.getPublishTime() != null && !entity.getSlug().equals(input.getSlug())) {
            throw exception0(400, "发布过的内容不能修改访问标识，请保留原 slug");
        }
    }
    private void fillContent(Content entity, ContentSave input) {
        entity.setTitle(input.getTitle().strip());
        entity.setSlug(input.getSlug());
        entity.setSummary(input.getSummary());
        entity.setContentMarkdown(input.getContentMarkdown());
        entity.setContentHtml(markdown.render(input.getContentMarkdown()).html());
        entity.setCoverUrl(UrlPolicy.contentUrl(input.getCoverUrl(), false));
        entity.setCategoryId(input.getCategoryId());
        entity.setStatus(input.getStatus());
        entity.setSeoTitle(Objects.requireNonNullElse(input.getSeoTitle(), ""));
        entity.setSeoDescription(Objects.requireNonNullElse(input.getSeoDescription(), ""));
        if (input.getStatus() == 1 && entity.getPublishTime() == null) entity.setPublishTime(LocalDateTime.now());
    }
    @Transactional
    public void deleteArticle(Long id) {
        required(articles.selectById(id));
        articleTags.delete(new QueryWrapper<ArticleTag>().eq("article_id", id));
        articles.deleteById(id);
    }
    @Transactional
    public void deleteResource(Long id) {
        required(resources.selectById(id));
        resources.deleteById(id);
    }
    public List<Map<String, Object>> categoryList(String type) {
        if (type != null && !Set.of("article", "resource").contains(type)) throw exception0(400, "分类类型不正确");
        return categories.selectList(new QueryWrapper<Category>().eq(type != null, "type", type)
                .orderByAsc("sort", "id")).stream().map(this::categoryView).toList();
    }
    public List<Map<String, Object>> tagList() {
        return tags.selectList(new QueryWrapper<Tag>().orderByAsc("id")).stream().map(this::tagView).toList();
    }
    @Transactional
    public Long saveCategory(CategorySave input, boolean update) {
        Category entity = update ? required(categories.selectById(requiredId(input.getId()))) : new Category();
        if (update && !entity.getType().equals(input.getType()) && categoryUsed(entity.getId())) {
            throw exception0(400, "分类已被引用，不能更改类型");
        }
        entity.setName(input.getName().strip()); entity.setSlug(input.getSlug());
        entity.setType(input.getType()); entity.setSort(input.getSort());
        if (update) categories.updateById(entity); else categories.insert(entity);
        return entity.getId();
    }
    @Transactional
    public Long saveTag(TagSave input, boolean update) {
        Tag entity = update ? required(tags.selectById(requiredId(input.getId()))) : new Tag();
        entity.setName(input.getName().strip()); entity.setSlug(input.getSlug());
        if (update) tags.updateById(entity); else tags.insert(entity);
        return entity.getId();
    }
    @Transactional
    public void deleteCategory(Long id) {
        required(categories.selectById(id));
        if (categoryUsed(id)) throw exception0(400, "分类仍被文章或资源引用，请先移除引用");
        categories.deleteById(id);
    }
    private boolean categoryUsed(Long id) {
        return articles.selectCount("category_id", id) > 0 || resources.selectCount("category_id", id) > 0;
    }
    @Transactional
    public void deleteTag(Long id) {
        required(tags.selectById(id));
        if (articleTags.selectCount("tag_id", id) > 0) throw exception0(400, "标签仍被文章引用，请先移除引用");
        tags.deleteById(id);
    }
    private void validateCategory(Long id, String type) {
        if (id == null) return;
        Category category = categories.selectById(id);
        if (category == null || !type.equals(category.getType())) throw exception0(400, "分类不存在或类型不匹配");
    }
    public Map<String, Object> siteGet(boolean admin) {
        Site site = sites.selectOne(new QueryWrapper<Site>());
        if (site == null) {
            site = new Site();
            site.setTitle("Myblog"); site.setSubtitle("记录思考，分享发现"); site.setDescription("");
            site.setAuthorName("博主"); site.setAvatarUrl(""); site.setAboutMarkdown(""); site.setAboutHtml("");
            site.setSiteUrl("http://127.0.0.1:3000"); site.setGithubUrl(""); site.setEmail(""); site.setFooterText("");
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("title", site.getTitle()); result.put("subtitle", site.getSubtitle());
        result.put("description", site.getDescription()); result.put("authorName", site.getAuthorName());
        result.put("avatarUrl", site.getAvatarUrl()); result.put("aboutHtml", site.getAboutHtml());
        result.put("siteUrl", site.getSiteUrl()); result.put("githubUrl", site.getGithubUrl());
        result.put("email", site.getEmail()); result.put("footerText", site.getFooterText());
        if (admin) result.put("aboutMarkdown", site.getAboutMarkdown());
        return result;
    }
    @Transactional
    public void siteUpdate(SiteSave input) {
        Site site = sites.selectOne(new QueryWrapper<Site>());
        boolean create = site == null;
        if (create) site = new Site();
        BeanUtils.copyProperties(input, site);
        site.setAvatarUrl(UrlPolicy.contentUrl(input.getAvatarUrl(), false));
        site.setGithubUrl(UrlPolicy.absoluteUrl(input.getGithubUrl(), false));
        site.setSiteUrl(UrlPolicy.siteUrl(input.getSiteUrl()));
        site.setAboutHtml(markdown.render(input.getAboutMarkdown()).html());
        if (create) sites.insert(site); else sites.updateById(site);
    }
    public List<Map<String, Object>> archives() {
        List<Map<String, Object>> rows = articles.selectMaps(visible(new QueryWrapper<Article>())
                .select("DATE_FORMAT(publish_time, '%Y-%m') AS yearMonth", "COUNT(*) AS total")
                .groupBy("DATE_FORMAT(publish_time, '%Y-%m')").orderByDesc("yearMonth"));
        return rows.stream().map(r -> {
            Map<String, Object> value = new LinkedHashMap<>();
            value.put("yearMonth", r.get("yearMonth")); value.put("total", r.get("total"));
            return value;
        }).toList();
    }
    public List<Map<String, Object>> sitemap() {
        List<Map<String, Object>> result = new ArrayList<>();
        articles.selectList(visible(new QueryWrapper<Article>()).select("slug", "update_time").orderByAsc("id"))
                .forEach(a -> result.add(sitemapEntry("/articles/" + a.getSlug(), a.getUpdateTime())));
        resources.selectList(visible(new QueryWrapper<Resource>()).select("slug", "update_time").orderByAsc("id"))
                .forEach(r -> result.add(sitemapEntry("/resources/" + r.getSlug(), r.getUpdateTime())));
        return result;
    }
    private Map<String, Object> sitemapEntry(String path, LocalDateTime time) {
        return Map.of("path", path, "updateTime", time);
    }
    private Map<String, Object> contentView(Content entity, boolean admin, boolean detail) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", entity.getId()); result.put("title", entity.getTitle()); result.put("slug", entity.getSlug());
        result.put("summary", entity.getSummary()); result.put("coverUrl", entity.getCoverUrl());
        result.put("categoryId", entity.getCategoryId());
        Category category = entity.getCategoryId() == null ? null : categories.selectById(entity.getCategoryId());
        result.put("categoryName", category == null ? null : category.getName());
        result.put("publishTime", entity.getPublishTime());
        result.put("seoTitle", entity.getSeoTitle()); result.put("seoDescription", entity.getSeoDescription());
        if (detail) {
            result.put("contentHtml", entity.getContentHtml()); result.put("toc", markdown.toc(entity.getContentHtml()));
            if (admin) result.put("contentMarkdown", entity.getContentMarkdown());
        }
        if (admin) {
            result.put("status", entity.getStatus()); result.put("createTime", entity.getCreateTime());
            result.put("updateTime", entity.getUpdateTime());
        }
        return result;
    }
    private Map<String, Object> articleView(Article entity, boolean admin, boolean detail) {
        Map<String, Object> result = contentView(entity, admin, detail);
        result.put("pinned", entity.getPinned()); result.put("readingMinutes", entity.getReadingMinutes());
        List<Long> ids = articleTags.selectList("article_id", entity.getId()).stream().map(ArticleTag::getTagId).toList();
        List<Tag> articleTagValues = ids.isEmpty() ? List.of() : tags.selectList(new QueryWrapper<Tag>().in("id", ids).orderByAsc("id"));
        result.put("tags", articleTagValues.stream().map(this::tagView).toList());
        if (admin) result.put("tagIds", ids);
        return result;
    }
    private Map<String, Object> resourceView(Resource entity, boolean admin, boolean detail) {
        Map<String, Object> result = contentView(entity, admin, detail);
        result.put("type", entity.getType()); result.put("url", entity.getUrl());
        result.put("featured", entity.getFeatured()); result.put("sort", entity.getSort());
        return result;
    }
    private Map<String, Object> categoryView(Category entity) {
        return Map.of("id", entity.getId(), "name", entity.getName(), "slug", entity.getSlug(), "type", entity.getType(), "sort", entity.getSort());
    }
    private Map<String, Object> tagView(Tag entity) {
        return Map.of("id", entity.getId(), "name", entity.getName(), "slug", entity.getSlug());
    }
    private Long requiredId(Long id) {
        if (id == null || id <= 0) throw exception0(400, "缺少有效编号");
        return id;
    }
    private <T> T required(T value) {
        if (value == null) throw exception0(404, "内容不存在或尚未发布");
        return value;
    }
}
