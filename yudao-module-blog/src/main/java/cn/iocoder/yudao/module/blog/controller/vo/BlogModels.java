package cn.iocoder.yudao.module.blog.controller.vo;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.ArrayList;
import java.util.List;

public final class BlogModels {
    private BlogModels() {}
    public static final String SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";

    @Data
    public static class ContentSave {
        private Long id;
        @NotBlank @Size(max = 200) private String title;
        @NotBlank @Size(max = 120) @Pattern(regexp = SLUG) private String slug;
        @NotNull @Size(max = 1000) private String summary = "";
        @NotNull @Size(max = 200000) private String contentMarkdown = "";
        @Size(max = 1000) private String coverUrl = "";
        private Long categoryId;
        @NotNull @Min(0) @Max(2) private Integer status = 0;
        @Size(max = 200) private String seoTitle = "";
        @Size(max = 500) private String seoDescription = "";
    }
    @Data @EqualsAndHashCode(callSuper = true)
    public static class ArticleSave extends ContentSave {
        @NotNull @Size(max = 30) private List<@NotNull @Positive Long> tagIds = new ArrayList<>();
        @NotNull private Boolean pinned = false;
    }
    @Data @EqualsAndHashCode(callSuper = true)
    public static class ResourceSave extends ContentSave {
        @NotBlank @Pattern(regexp = "link|file") private String type = "link";
        @NotBlank @Size(max = 2000) private String url;
        @NotNull private Boolean featured = false;
        @NotNull private Integer sort = 0;
    }
    @Data
    public static class CategorySave {
        private Long id;
        @NotBlank @Size(max = 80) private String name;
        @NotBlank @Size(max = 120) @Pattern(regexp = SLUG) private String slug;
        @NotBlank @Pattern(regexp = "article|resource") private String type;
        @NotNull private Integer sort = 0;
    }
    @Data
    public static class TagSave {
        private Long id;
        @NotBlank @Size(max = 80) private String name;
        @NotBlank @Size(max = 120) @Pattern(regexp = SLUG) private String slug;
    }
    @Data
    public static class SiteSave {
        @NotBlank @Size(max = 100) private String title;
        @NotNull @Size(max = 200) private String subtitle = "";
        @NotNull @Size(max = 500) private String description = "";
        @NotBlank @Size(max = 80) private String authorName;
        @Size(max = 1000) private String avatarUrl = "";
        @NotNull @Size(max = 200000) private String aboutMarkdown = "";
        @NotBlank @Size(max = 500) private String siteUrl;
        @Size(max = 1000) private String githubUrl = "";
        @Email @Size(max = 200) private String email = "";
        @Size(max = 500) private String footerText = "";
    }
    @Data
    public static class PreviewRequest {
        @NotNull @Size(max = 200000) private String markdown;
    }
    @Data
    public static class Query {
        @NotNull @Min(1) @Max(100000) private Integer pageNo = 1;
        @NotNull @Min(1) @Max(100) private Integer pageSize = 12;
        @Size(max = 200) private String keyword;
        @Positive private Long categoryId;
        @Positive private Long tagId;
        @Min(0) @Max(2) private Integer status;
        @Pattern(regexp = "link|file") private String type;
        private Boolean pinned;
        private Boolean featured;
        @Pattern(regexp = "[0-9]{4}-(0[1-9]|1[0-2])") private String yearMonth;
    }
    public record TocEntry(String id, String text, int level) {}
    public record Preview(String html, List<TocEntry> toc, int readingMinutes) {}
}
