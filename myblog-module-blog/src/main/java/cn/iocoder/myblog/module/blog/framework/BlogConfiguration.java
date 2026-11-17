package cn.iocoder.myblog.module.blog.framework;

import cn.iocoder.myblog.framework.common.enums.WebFilterOrderEnum;
import cn.iocoder.myblog.framework.security.config.AuthorizeRequestsCustomizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import cn.iocoder.myblog.framework.security.config.SecurityProperties;
import cn.iocoder.myblog.framework.web.config.WebProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class BlogConfiguration {
    @Bean
    public AuthorizeRequestsCustomizer blogAuthorizeRequestsCustomizer() {
        return new AuthorizeRequestsCustomizer() {
            @Override
            public void customize(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry registry) {
                // Public GETs are declared with @PermitAll; all other requests retain framework authentication.
            }
        };
    }

    @Bean
    public FilterRegistrationBean<BlogPublicRequestFilter> blogPublicRequestFilter(
            @Value("${blog.site-tenant-id:1}") long tenantId, SecurityProperties security, WebProperties web) {
        var registration = new FilterRegistrationBean<>(
                new BlogPublicRequestFilter(tenantId, security, web.getAppApi().getPrefix()));
        registration.setOrder(WebFilterOrderEnum.TENANT_CONTEXT_FILTER - 1);
        return registration;
    }
}
