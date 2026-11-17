package cn.iocoder.myblog.module.blog.framework;

import cn.iocoder.myblog.framework.common.pojo.CommonResult;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "cn.iocoder.myblog.module.blog.controller")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class BlogConflictAdvice {
    @ExceptionHandler(DuplicateKeyException.class)
    public CommonResult<Boolean> duplicate() {
        return CommonResult.error(409, "访问标识已被使用，请更换 slug；删除过的标识也会保留");
    }
}
