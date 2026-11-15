package cn.iocoder.yudao.module.blog.service;

import cn.iocoder.yudao.module.blog.controller.vo.BlogModels.*;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Cleaner;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class MarkdownService {
    private final Parser parser = Parser.builder().build();
    private final HtmlRenderer renderer = HtmlRenderer.builder().escapeHtml(true).sanitizeUrls(true).build();
    private final Safelist safelist = Safelist.relaxed()
            .addAttributes("code", "class").addAttributes("h1", "id").addAttributes("h2", "id")
            .addAttributes("h3", "id").addAttributes("h4", "id").addAttributes("h5", "id")
            .addAttributes("h6", "id").removeProtocols("a", "href", "ftp")
            .preserveRelativeLinks(true);

    public Preview render(String markdown) {
        Document source = Jsoup.parseBodyFragment(renderer.render(parser.parse(markdown == null ? "" : markdown)), "https://blog.invalid/");
        Document clean = new Cleaner(safelist).clean(source);
        clean.outputSettings().prettyPrint(false);
        int index = 0;
        for (var heading : clean.select("h1,h2,h3,h4,h5,h6")) {
            heading.attr("id", "heading-" + (++index));
        }
        for (var link : clean.select("a[href]")) {
            String href = link.attr("href");
            if (!UrlPolicy.isContentUrl(href) && !href.startsWith("#") && !href.startsWith("mailto:")) {
                link.removeAttr("href");
            }
            link.attr("rel", "noopener noreferrer");
        }
        for (var image : clean.select("img")) {
            if (!UrlPolicy.isContentUrl(image.attr("src"))) image.remove();
            else image.attr("loading", "lazy");
        }
        String html = clean.body().html();
        int chars = clean.body().text().codePointCount(0, clean.body().text().length());
        return new Preview(html, toc(html), Math.max(1, (chars + 399) / 400));
    }

    public List<TocEntry> toc(String html) {
        List<TocEntry> result = new ArrayList<>();
        for (var element : Jsoup.parseBodyFragment(html == null ? "" : html).select("h1,h2,h3,h4,h5,h6")) {
            result.add(new TocEntry(element.id(), element.text(), Integer.parseInt(element.tagName().substring(1))));
        }
        return result;
    }
}
