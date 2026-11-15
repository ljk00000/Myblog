package cn.iocoder.yudao.module.blog.controller.admin;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.blog.controller.vo.BlogModels.*;
import cn.iocoder.yudao.module.blog.service.BlogService;
import cn.iocoder.yudao.module.blog.service.MarkdownService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@RestController
@RequestMapping("/blog")
@RequiredArgsConstructor
@Validated
public class BlogAdminController {
    private final BlogService blog;
    private final MarkdownService markdown;

    @GetMapping("/article/page") @PreAuthorize("@ss.hasPermission('blog:article:query')")
    public CommonResult<PageResult<Map<String, Object>>> articlePage(@Valid Query query) {
        return success(blog.articlePage(query, false));
    }
    @GetMapping("/article/get") @PreAuthorize("@ss.hasPermission('blog:article:query')")
    public CommonResult<Map<String, Object>> articleGet(@RequestParam @Positive Long id) { return success(blog.articleGet(id)); }
    @PostMapping("/article/create") @PreAuthorize("@ss.hasPermission('blog:article:create')")
    public CommonResult<Long> articleCreate(@Valid @RequestBody ArticleSave input) { return success(blog.saveArticle(input, false)); }
    @PutMapping("/article/update") @PreAuthorize("@ss.hasPermission('blog:article:update')")
    public CommonResult<Boolean> articleUpdate(@Valid @RequestBody ArticleSave input) { blog.saveArticle(input, true); return success(true); }
    @DeleteMapping("/article/delete") @PreAuthorize("@ss.hasPermission('blog:article:delete')")
    public CommonResult<Boolean> articleDelete(@RequestParam @Positive Long id) { blog.deleteArticle(id); return success(true); }

    @GetMapping("/resource/page") @PreAuthorize("@ss.hasPermission('blog:resource:query')")
    public CommonResult<PageResult<Map<String, Object>>> resourcePage(@Valid Query query) { return success(blog.resourcePage(query, false)); }
    @GetMapping("/resource/get") @PreAuthorize("@ss.hasPermission('blog:resource:query')")
    public CommonResult<Map<String, Object>> resourceGet(@RequestParam @Positive Long id) { return success(blog.resourceGet(id)); }
    @PostMapping("/resource/create") @PreAuthorize("@ss.hasPermission('blog:resource:create')")
    public CommonResult<Long> resourceCreate(@Valid @RequestBody ResourceSave input) { return success(blog.saveResource(input, false)); }
    @PutMapping("/resource/update") @PreAuthorize("@ss.hasPermission('blog:resource:update')")
    public CommonResult<Boolean> resourceUpdate(@Valid @RequestBody ResourceSave input) { blog.saveResource(input, true); return success(true); }
    @DeleteMapping("/resource/delete") @PreAuthorize("@ss.hasPermission('blog:resource:delete')")
    public CommonResult<Boolean> resourceDelete(@RequestParam @Positive Long id) { blog.deleteResource(id); return success(true); }

    @GetMapping("/category/list") @PreAuthorize("@ss.hasPermission('blog:category:query')")
    public CommonResult<List<Map<String, Object>>> categoryList(@RequestParam(required = false) String type) { return success(blog.categoryList(type)); }
    @PostMapping("/category/create") @PreAuthorize("@ss.hasPermission('blog:category:create')")
    public CommonResult<Long> categoryCreate(@Valid @RequestBody CategorySave input) { return success(blog.saveCategory(input, false)); }
    @PutMapping("/category/update") @PreAuthorize("@ss.hasPermission('blog:category:update')")
    public CommonResult<Boolean> categoryUpdate(@Valid @RequestBody CategorySave input) { blog.saveCategory(input, true); return success(true); }
    @DeleteMapping("/category/delete") @PreAuthorize("@ss.hasPermission('blog:category:delete')")
    public CommonResult<Boolean> categoryDelete(@RequestParam @Positive Long id) { blog.deleteCategory(id); return success(true); }

    @GetMapping("/tag/list") @PreAuthorize("@ss.hasPermission('blog:tag:query')")
    public CommonResult<List<Map<String, Object>>> tagList() { return success(blog.tagList()); }
    @PostMapping("/tag/create") @PreAuthorize("@ss.hasPermission('blog:tag:create')")
    public CommonResult<Long> tagCreate(@Valid @RequestBody TagSave input) { return success(blog.saveTag(input, false)); }
    @PutMapping("/tag/update") @PreAuthorize("@ss.hasPermission('blog:tag:update')")
    public CommonResult<Boolean> tagUpdate(@Valid @RequestBody TagSave input) { blog.saveTag(input, true); return success(true); }
    @DeleteMapping("/tag/delete") @PreAuthorize("@ss.hasPermission('blog:tag:delete')")
    public CommonResult<Boolean> tagDelete(@RequestParam @Positive Long id) { blog.deleteTag(id); return success(true); }

    @GetMapping("/site/get") @PreAuthorize("@ss.hasPermission('blog:site:query')")
    public CommonResult<Map<String, Object>> siteGet() { return success(blog.siteGet(true)); }
    @PutMapping("/site/update") @PreAuthorize("@ss.hasPermission('blog:site:update')")
    public CommonResult<Boolean> siteUpdate(@Valid @RequestBody SiteSave input) { blog.siteUpdate(input); return success(true); }

    @PostMapping("/content/preview")
    @PreAuthorize("@ss.hasAnyPermissions('blog:article:create','blog:article:update','blog:resource:create','blog:resource:update','blog:site:update')")
    public CommonResult<Preview> preview(@Valid @RequestBody PreviewRequest input) { return success(markdown.render(input.getMarkdown())); }
}
