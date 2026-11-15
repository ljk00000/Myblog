package cn.iocoder.yudao.module.blog;

import cn.iocoder.yudao.module.blog.service.MarkdownService;
import cn.iocoder.yudao.module.blog.service.UrlPolicy;
import cn.iocoder.yudao.module.blog.controller.vo.BlogModels.Query;
import jakarta.validation.Validation;
import org.jsoup.Jsoup;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BlogContentTest {
    private final MarkdownService markdown = new MarkdownService();

    @Test void sanitizesDangerousMarkupAndRetainsReadingStructure() {
        var rendered = markdown.render("# 标题\n\n## 标题\n\n<script>alert(1)</script>\n\n[危险](javascript:alert(1))\n\n![图片](data:text/html,attack)\n\n```java\nSystem.out.println(1);\n```\n\n[正常](https://example.org)\n\n![正常](/media/a.png)");
        var doc = Jsoup.parseBodyFragment(rendered.html());
        assertTrue(doc.select("script,iframe,object,[onclick],[onerror]").isEmpty());
        assertTrue(doc.select("a[href^=javascript],img[src^=data]").isEmpty());
        assertEquals("heading-1", rendered.toc().get(0).id());
        assertEquals("heading-2", rendered.toc().get(1).id());
        assertEquals(2, rendered.toc().get(1).level());
        assertTrue(doc.select("code.language-java").text().contains("System.out"));
        assertEquals("/media/a.png", doc.select("img").attr("src"));
        assertEquals("noopener noreferrer", doc.select("a[href=https://example.org]").attr("rel"));
        assertEquals(1, rendered.readingMinutes());
    }
    @Test void rejectsUnsafeResourceAndImageAddresses() {
        for (String url : new String[]{"javascript:alert(1)", "//evil.example", "/\\evil.example", "/%5cevil", "data:image/svg+xml,attack", "https://a.example\nevil", "https://user:pass@example.org"}) {
            assertFalse(UrlPolicy.isContentUrl(url), url);
        }
        assertTrue(UrlPolicy.isContentUrl("https://example.org/a?q=1"));
        assertTrue(UrlPolicy.isContentUrl("/admin-api/infra/file/4/get/a.png"));
        assertEquals("https://example.org", UrlPolicy.siteUrl("https://example.org/"));
        assertThrows(RuntimeException.class, () -> UrlPolicy.siteUrl("https://example.org/?q=1"));
    }
    @Test void requiresBoundedPaginationAndKeywords() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            Query query = new Query();
            assertTrue(validator.validate(query).isEmpty());
            query.setPageSize(-1);
            assertFalse(validator.validate(query).isEmpty());
            query.setPageSize(101);
            assertFalse(validator.validate(query).isEmpty());
            query.setPageSize(10); query.setPageNo(0);
            assertFalse(validator.validate(query).isEmpty());
            query.setPageNo(1);
            query.setKeyword("a".repeat(101));
            assertTrue(validator.validate(query).isEmpty());
            query.setKeyword("a".repeat(200));
            assertTrue(validator.validate(query).isEmpty());
            query.setKeyword("a".repeat(201));
            assertFalse(validator.validate(query).isEmpty());
        }
    }
}
