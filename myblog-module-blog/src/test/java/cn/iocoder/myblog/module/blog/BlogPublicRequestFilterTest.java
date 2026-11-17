package cn.iocoder.myblog.module.blog;

import cn.iocoder.myblog.framework.security.config.SecurityProperties;
import cn.iocoder.myblog.module.blog.framework.BlogPublicRequestFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import java.util.Collections;
import static org.junit.jupiter.api.Assertions.*;

class BlogPublicRequestFilterTest {
    private final BlogPublicRequestFilter filter = new BlogPublicRequestFilter(1, new SecurityProperties(), "/app-api");
    @Test void stripsIdentityBeforeTenantParsingEvenForInvalidTenantHeader() throws Exception {
        var request = new MockHttpServletRequest("GET", "/app-api/blog/article/page");
        request.setServletPath("/app-api/blog/article/page");
        request.addHeader("tenant-id", "invalid-input");
        request.addHeader("visit-tenant-id", "2");
        request.addHeader("Authorization", "Bearer visitor-token");
        request.addHeader("login-user", "untrusted");
        request.addHeader("Cookie", "session=untrusted");
        request.addParameter("token", "visitor-token");
        request.addParameter("pageSize", "12");
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> {
            var clean = (HttpServletRequest) req;
            assertEquals("1", clean.getHeader("tenant-id"));
            assertNull(clean.getHeader("Authorization"));
            assertNull(clean.getHeader("login-user"));
            assertNull(clean.getHeader("visit-tenant-id"));
            assertNull(clean.getHeader("Cookie"));
            assertNull(clean.getParameter("token"));
            assertFalse(clean.getParameterMap().containsKey("token"));
            assertFalse(Collections.list(clean.getParameterNames()).contains("token"));
            assertEquals("12", clean.getParameter("pageSize"));
            assertEquals(Collections.singletonList("1"), Collections.list(clean.getHeaders("tenant-id")));
        });
        assertEquals("no-store", response.getHeader("Cache-Control"));
    }
    @Test void decodedPublicPathsCannotBypassSiteTenantIsolation() throws Exception {
        for (String encodedPath : new String[] {
                "/app-api/%62log/article/page", "/%61pp-api/blog/article/page", "/app-api/blog%2farticle/page" }) {
            var request = new MockHttpServletRequest("GET", "/context" + encodedPath);
            request.setContextPath("/context");
            request.setServletPath("/app-api/blog/article/page");
            request.addHeader("tenant-id", "2");
            request.addHeader("Authorization", "Bearer visitor-token");
            filter.doFilter(request, new MockHttpServletResponse(), (req, res) -> {
                var clean = (HttpServletRequest) req;
                assertEquals("1", clean.getHeader("tenant-id"));
                assertNull(clean.getHeader("Authorization"));
            });
        }
    }
    @Test void leavesAdminAuthenticationAndTenantUntouched() throws Exception {
        var request = new MockHttpServletRequest("GET", "/admin-api/blog/article/page");
        request.setServletPath("/admin-api/blog/article/page");
        request.addHeader("tenant-id", "2"); request.addHeader("Authorization", "Bearer admin-token");
        filter.doFilter(request, new MockHttpServletResponse(), (req, res) -> {
            assertSame(request, req);
            assertEquals("2", ((HttpServletRequest) req).getHeader("tenant-id"));
            assertEquals("Bearer admin-token", ((HttpServletRequest) req).getHeader("Authorization"));
        });
    }
}
