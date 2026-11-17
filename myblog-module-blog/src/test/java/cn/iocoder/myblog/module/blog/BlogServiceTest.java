package cn.iocoder.myblog.module.blog;

import cn.iocoder.myblog.framework.common.exception.ServiceException;
import cn.iocoder.myblog.module.blog.controller.vo.BlogModels.*;
import cn.iocoder.myblog.module.blog.dal.dataobject.BlogEntities.*;
import cn.iocoder.myblog.module.blog.dal.mysql.BlogMappers.*;
import cn.iocoder.myblog.module.blog.service.*;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BlogServiceTest {
    private ArticleMapper articles;
    private CategoryMapper categories;
    private ArticleTagMapper relations;
    private BlogService service;
    @BeforeEach void setup() {
        articles = mock(ArticleMapper.class); categories = mock(CategoryMapper.class); relations = mock(ArticleTagMapper.class);
        service = new BlogService(articles, mock(ResourceMapper.class), categories, mock(TagMapper.class), relations,
                mock(SiteMapper.class), new MarkdownService());
    }
    @Test void publishedSlugRemainsStableAndRejectsMissingCategory() {
        Article current = new Article(); current.setId(1L); current.setSlug("original"); current.setPublishTime(LocalDateTime.now());
        when(articles.selectById(1L)).thenReturn(current);
        ArticleSave input = new ArticleSave(); input.setId(1L); input.setSlug("changed"); input.setTitle("标题");
        ServiceException slug = assertThrows(ServiceException.class, () -> service.saveArticle(input, true));
        assertEquals(400, slug.getCode());
        input.setSlug("original"); input.setCategoryId(999L);
        assertThrows(ServiceException.class, () -> service.saveArticle(input, true));
        verify(articles, never()).updateById(any(Article.class));
    }
    @Test void firstPublicationGetsServerTimeAndPublicOutputHasNoPrivateFields() {
        ArticleSave input = new ArticleSave(); input.setTitle("标题"); input.setSlug("first"); input.setStatus(1);
        input.setContentMarkdown("## 正文\n\n可读的正文内容");
        doAnswer(call -> { Article value = call.getArgument(0); value.setId(7L); return 1; }).when(articles).insert(any(Article.class));
        assertEquals(7L, service.saveArticle(input, false));
        var captor = org.mockito.ArgumentCaptor.forClass(Article.class);
        verify(articles).insert(captor.capture());
        Article saved = captor.getValue();
        assertNotNull(saved.getPublishTime()); assertTrue(saved.getContentHtml().contains("heading-1"));
        when(articles.selectOne(any(QueryWrapper.class))).thenAnswer(call -> {
            QueryWrapper<?> query = call.getArgument(0);
            assertTrue(query.getSqlSegment().contains("publish_time <="));
            assertTrue(query.getParamNameValuePairs().containsValue(1));
            return saved;
        });
        when(relations.selectList("article_id", 7L)).thenReturn(List.of());
        var view = service.publicArticle("first");
        assertFalse(view.containsKey("contentMarkdown")); assertFalse(view.containsKey("status"));
        assertFalse(view.containsKey("tenantId")); assertFalse(view.containsKey("createTime"));
        assertFalse(view.containsKey("updateTime")); assertFalse(view.containsKey("tagIds"));
        assertTrue(view.containsKey("contentHtml"));
    }
    @Test void missingOrUnpublishedDetailsReturnNotFound() {
        when(articles.selectOne(any(QueryWrapper.class))).thenReturn(null);
        assertEquals(404, assertThrows(ServiceException.class, () -> service.publicArticle("draft")).getCode());
    }
    @Test void categoriesInUseCannotBeDeleted() {
        Category category = new Category(); category.setId(1L);
        when(categories.selectById(1L)).thenReturn(category);
        when(articles.selectCount("category_id", 1L)).thenReturn(1L);
        assertThrows(ServiceException.class, () -> service.deleteCategory(1L));
        verify(categories, never()).deleteById(1L);
    }
}
