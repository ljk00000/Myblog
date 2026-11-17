package cn.iocoder.myblog.module.blog.framework;

import cn.iocoder.myblog.framework.security.config.SecurityProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.*;

/** Isolate public reads before tenant parsing and Spring Security authentication. */
public class BlogPublicRequestFilter extends OncePerRequestFilter {
    private final String tenantId;
    private final String tokenHeader;
    private final String tokenParameter;
    private final String prefix;

    public BlogPublicRequestFilter(long tenantId, SecurityProperties security, String prefix) {
        if (tenantId <= 0) throw new IllegalArgumentException("blog.site-tenant-id must be positive");
        this.tenantId = Long.toString(tenantId);
        this.tokenHeader = security.getTokenHeader();
        this.tokenParameter = security.getTokenParameter();
        this.prefix = prefix + "/blog/";
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Servlet paths are decoded by the container, like the path matched by MVC.
        String path = request.getServletPath();
        if (request.getPathInfo() != null) path += request.getPathInfo();
        return !path.startsWith(prefix);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader("Cache-Control", "no-store");
        chain.doFilter(new HttpServletRequestWrapper(request) {
            private boolean hidden(String name) {
                return name.equalsIgnoreCase(tokenHeader) || name.equalsIgnoreCase("authorization")
                        || name.equalsIgnoreCase("login-user") || name.equalsIgnoreCase("visit-tenant-id")
                        || name.equalsIgnoreCase("cookie");
            }
            @Override public String getHeader(String name) {
                if (name.equalsIgnoreCase("tenant-id")) return tenantId;
                return hidden(name) ? null : super.getHeader(name);
            }
            @Override public Enumeration<String> getHeaders(String name) {
                if (name.equalsIgnoreCase("tenant-id")) return Collections.enumeration(List.of(tenantId));
                return hidden(name) ? Collections.emptyEnumeration() : super.getHeaders(name);
            }
            @Override public Enumeration<String> getHeaderNames() {
                Set<String> names = new LinkedHashSet<>();
                super.getHeaderNames().asIterator().forEachRemaining(n -> {
                    if (!hidden(n) && !n.equalsIgnoreCase("tenant-id")) names.add(n);
                });
                names.add("tenant-id");
                return Collections.enumeration(names);
            }
            @Override public String getParameter(String name) {
                return name.equals(tokenParameter) ? null : super.getParameter(name);
            }
            @Override public String[] getParameterValues(String name) {
                return name.equals(tokenParameter) ? null : super.getParameterValues(name);
            }
            @Override public Map<String, String[]> getParameterMap() {
                Map<String, String[]> values = new LinkedHashMap<>(super.getParameterMap());
                values.remove(tokenParameter);
                return Collections.unmodifiableMap(values);
            }
            @Override public Enumeration<String> getParameterNames() {
                return Collections.enumeration(getParameterMap().keySet());
            }
            @Override public Cookie[] getCookies() { return null; }
        }, response);
    }
}
