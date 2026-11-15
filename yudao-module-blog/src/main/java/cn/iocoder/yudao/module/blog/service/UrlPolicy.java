package cn.iocoder.yudao.module.blog.service;

import java.net.URI;
import java.util.Locale;
import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception0;

public final class UrlPolicy {
    private UrlPolicy() {}
    public static boolean isContentUrl(String value) {
        if (value == null || value.isBlank() || value.contains("\\")
                || value.codePoints().anyMatch(c -> Character.isWhitespace(c) || Character.isISOControl(c))) return false;
        String lower = value.toLowerCase(Locale.ROOT);
        if (lower.contains("%5c") || lower.contains("%0a") || lower.contains("%0d")) return false;
        try {
            URI uri = URI.create(value);
            if (value.startsWith("/") && !value.startsWith("//")) return true;
            return ("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                    && uri.getHost() != null && uri.getUserInfo() == null;
        } catch (IllegalArgumentException e) { return false; }
    }
    public static String contentUrl(String value, boolean required) {
        if (value == null || value.isBlank()) {
            if (required) throw exception0(400, "请填写链接地址");
            return "";
        }
        if (!isContentUrl(value)) throw exception0(400, "链接仅支持 HTTP(S) 或本站根路径");
        return value;
    }
    public static String absoluteUrl(String value, boolean required) {
        String safe = contentUrl(value, required);
        if (!safe.isEmpty() && safe.startsWith("/")) throw exception0(400, "请填写完整 HTTP(S) 地址");
        return safe;
    }
    public static String siteUrl(String value) {
        String safe = absoluteUrl(value, true);
        URI uri = URI.create(safe);
        if (uri.getRawQuery() != null || uri.getRawFragment() != null) throw exception0(400, "站点地址不能包含查询参数或锚点");
        return safe.replaceAll("/+$", "");
    }
}
