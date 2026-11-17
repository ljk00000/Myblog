package cn.iocoder.myblog.module.blog.controller.app;

import cn.iocoder.myblog.framework.common.pojo.CommonResult;
import cn.iocoder.myblog.framework.common.pojo.PageResult;
import cn.iocoder.myblog.module.blog.controller.vo.BlogModels;
import cn.iocoder.myblog.module.blog.controller.vo.BlogModels.Query;
import cn.iocoder.myblog.module.blog.service.BlogService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import static cn.iocoder.myblog.framework.common.pojo.CommonResult.success;

@RestController
@RequestMapping("/blog")
@RequiredArgsConstructor
@Validated
@PermitAll
public class BlogAppController {
    private final BlogService blog;
    @GetMapping("/site/get")
    public CommonResult<Map<String, Object>> site() { return success(blog.siteGet(false)); }
    @GetMapping("/category/list")
    public CommonResult<List<Map<String, Object>>> categories(@RequestParam(required = false) String type) { return success(blog.categoryList(type)); }
    @GetMapping("/tag/list")
    public CommonResult<List<Map<String, Object>>> tags() { return success(blog.tagList()); }
    @GetMapping("/article/page")
    public CommonResult<PageResult<Map<String, Object>>> articles(@Valid Query query) { return success(blog.articlePage(query, true)); }
    @GetMapping("/article/get")
    public CommonResult<Map<String, Object>> article(@RequestParam @Size(max = 120) @Pattern(regexp = BlogModels.SLUG) String slug) { return success(blog.publicArticle(slug)); }
    @GetMapping("/article/archives")
    public CommonResult<List<Map<String, Object>>> archives() { return success(blog.archives()); }
    @GetMapping("/resource/page")
    public CommonResult<PageResult<Map<String, Object>>> resources(@Valid Query query) { return success(blog.resourcePage(query, true)); }
    @GetMapping("/resource/get")
    public CommonResult<Map<String, Object>> resource(@RequestParam @Size(max = 120) @Pattern(regexp = BlogModels.SLUG) String slug) { return success(blog.publicResource(slug)); }
    @GetMapping("/sitemap")
    public CommonResult<List<Map<String, Object>>> sitemap() { return success(blog.sitemap()); }
}
